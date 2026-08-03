'use strict';

/* ============ 🌱 此刻：情绪感知站 ============ */
const Emotion = {
  selected: null,
  intensity: 3,
  spectrumDays: 7,

  init() {
    this.renderGrid();
    this.renderDots();
    this.bindEvents();
    this.renderHistory();
    this.renderHeroStats();
  },

  bindEvents() {
    $('#saveEmotion').addEventListener('click', () => this.save());
    $('#emotionNote').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); this.save(); }
    });
    $('#spectrumToggle').addEventListener('click', (e) => {
      const btn = e.target.closest('.seg');
      if (!btn) return;
      this.spectrumDays = Number(btn.dataset.days);
      $$('.seg', $('#spectrumToggle')).forEach((b) => b.classList.toggle('active', b === btn));
      this.renderSpectrum(this.spectrumDays);
    });
    $('#spectrumReplay').addEventListener('click', () => {
      if (!this.spectrumPts || !this.spectrumPts.length) return;
      const btn = $('#spectrumReplay');
      btn.classList.remove('spinning');
      void btn.offsetWidth;
      btn.classList.add('spinning');
      setTimeout(() => btn.classList.remove('spinning'), 750);
      this.renderSpectrum(this.spectrumDays, true);
    });
  },

  renderGrid() {
    const grid = $('#emotionGrid');
    grid.innerHTML = EMOTION_KEYS.map((key) => {
      const em = EMOTIONS[key];
      return `<button class="emotion-chip" data-key="${key}" type="button" style="--ec-color:${em.color};--ec-soft:${em.soft}">
        <span class="ec-emoji">${em.emoji}</span><span class="ec-name">${em.name}</span>
      </button>`;
    }).join('');
    grid.addEventListener('click', (e) => {
      const chip = e.target.closest('.emotion-chip');
      if (!chip) return;
      this.selected = chip.dataset.key;
      $$('.emotion-chip', grid).forEach((c) => c.classList.toggle('selected', c === chip));
      this.burstEmoji(chip, EMOTIONS[this.selected].emoji);
    });
  },

  renderDots() {
    const wrap = $('#intensityDots');
    wrap.innerHTML = [1, 2, 3, 4, 5]
      .map((n) => `<button class="dot" data-n="${n}" type="button" aria-label="强度 ${n}"></button>`)
      .join('');
    wrap.addEventListener('click', (e) => {
      const dot = e.target.closest('.dot');
      if (!dot) return;
      this.intensity = Number(dot.dataset.n);
      this.paintDots();
    });
    this.paintDots();
  },

  paintDots() {
    $$('.dot').forEach((d) => d.classList.toggle('active', Number(d.dataset.n) <= this.intensity));
  },

  save() {
    if (!this.selected) {
      toast('先选择一个此刻的情绪吧 🌱');
      return;
    }
    const note = $('#emotionNote').value.trim();
    const entry = {
      id: uid(),
      date: todayStr(),
      ts: Date.now(),
      emotion: this.selected,
      intensity: this.intensity,
      note,
    };
    if (Store.emotions.add(entry)) {
      $('#emotionNote').value = '';
      toast(`已保存这一刻 · ${EMOTIONS[this.selected].emoji}`);
      this.renderSpectrum(this.spectrumDays, true);
      this.renderHistory();
    }
  },

  burstEmoji(chip, emoji) {
    if (prefersReducedMotion()) return;
    const rect = chip.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 4; i++) {
      const span = document.createElement('span');
      span.className = 'bubble-emoji';
      span.textContent = emoji;
      span.style.left = `${cx + (Math.random() - 0.5) * 56}px`;
      span.style.top = `${cy + (Math.random() - 0.5) * 18}px`;
      span.style.animationDelay = `${(Math.random() * 0.12).toFixed(2)}s`;
      document.body.appendChild(span);
      setTimeout(() => span.remove(), 1300);
    }
  },

  /* ---- 情绪光谱卡片：Canvas 轨迹 ---- */
  renderSpectrum(days, animate = false) {
    const section = $('#spectrumSection');
    section.classList.remove('hidden');
    const canvas = $('#spectrumCanvas');
    const emptyEl = $('#spectrumEmpty');
    const insightEl = $('#spectrumInsight');

    const cutoff = daysAgoStr(days - 1);
    const entries = Store.emotions.list().filter((e) => e.date >= cutoff);

    if (entries.length === 0) {
      emptyEl.classList.remove('hidden');
      insightEl.textContent = '';
      $('#wordCloud').innerHTML = '';
      canvas.width = canvas.width; // 清空
      this.spectrumPts = null;
      this.spectrumGeom = null;
      return;
    }
    emptyEl.classList.add('hidden');

    // 每天的情绪记录
    const dayMap = {};
    entries.forEach((e) => {
      if (!dayMap[e.date]) dayMap[e.date] = [];
      dayMap[e.date].push(e);
    });

    const today = todayStr();
    const pts = [];
    const base = new Date(today);
    base.setDate(base.getDate() - (days - 1));
    for (let i = 0; i < days; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const key = dateKeyOf(d);
      if (dayMap[key]) {
        const list = dayMap[key];
        const avg = list.reduce((a, e) => a + (EMOTIONS[e.emotion] ? EMOTIONS[e.emotion].val : 5), 0) / list.length;
        pts.push({ key, val: avg, i, list });
      }
    }

    this.drawCurve(canvas, pts, days, animate);
    this.renderInsight(pts, entries);
    this.renderCloud(entries);
    this.bindSpectrumHover();
  },

  drawCurve(canvas, pts, days, animate) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 320;
    const h = 190;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const padL = 12, padR = 12, padT = 14, padB = 24;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const geom = {
      w, h, padL, padR, padT, padB, plotW, plotH, days,
      xOf: (i) => padL + (days === 1 ? plotW / 2 : (i / (days - 1)) * plotW),
      yOf: (v) => padT + (1 - clamp((v - 1) / 8, 0, 1)) * plotH,
    };
    this.spectrumGeom = geom;

    const sorted = [...pts].sort((a, b) => a.i - b.i);
    this.spectrumPts = sorted;
    const segments = [];
    if (sorted.length) {
      let seg = [sorted[0]];
      for (let k = 1; k < sorted.length; k++) {
        if (sorted[k].i === sorted[k - 1].i + 1) seg.push(sorted[k]);
        else { segments.push(seg); seg = [sorted[k]]; }
      }
      segments.push(seg);
    }

    const paint = (reveal) => {
      ctx.clearRect(0, 0, w, h);
      this.paintGrid(ctx, geom);
      if (!sorted.length) return;
      const revealX = geom.padL + geom.plotW * clamp(reveal, 0, 1);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, revealX, h);
      ctx.clip();
      this.paintArea(ctx, geom, segments);
      this.paintLine(ctx, geom, segments);
      ctx.restore();
      this.paintSpectrumDots(ctx, geom, sorted, revealX);
      this.labelAxis(ctx, geom);
    };

    cancelAnimationFrame(this.spectrumRaf);
    if (!animate || prefersReducedMotion() || sorted.length < 2) {
      paint(1);
      return;
    }
    const dur = Math.min(1300, 300 + sorted.length * 110);
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const loop = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      paint(ease(t));
      if (t < 1) this.spectrumRaf = requestAnimationFrame(loop);
    };
    this.spectrumRaf = requestAnimationFrame(loop);
  },

  paintGrid(ctx, g) {
    ctx.strokeStyle = 'rgba(120, 140, 128, 0.12)';
    ctx.lineWidth = 1;
    for (let v = 2; v <= 8; v += 2) {
      const y = g.yOf(v);
      ctx.beginPath();
      ctx.moveTo(g.padL, y);
      ctx.lineTo(g.w - g.padR, y);
      ctx.stroke();
      ctx.fillStyle = 'rgba(125, 139, 130, 0.55)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(String(v), g.padL - 3, y + 3);
    }
  },

  paintArea(ctx, g, segments) {
    const grad = ctx.createLinearGradient(0, g.padT, 0, g.h - g.padB);
    grad.addColorStop(0, 'rgba(127, 174, 146, 0.32)');
    grad.addColorStop(1, 'rgba(147, 194, 226, 0.05)');
    segments.forEach((s) => {
      if (s.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(g.xOf(s[0].i), g.yOf(s[0].val));
      for (let k = 1; k < s.length; k++) {
        const prev = s[k - 1], cur = s[k];
        const mx = (g.xOf(prev.i) + g.xOf(cur.i)) / 2;
        ctx.quadraticCurveTo(mx, g.yOf(prev.val), g.xOf(cur.i), g.yOf(cur.val));
      }
      ctx.lineTo(g.xOf(s[s.length - 1].i), g.h - g.padB);
      ctx.lineTo(g.xOf(s[0].i), g.h - g.padB);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
    });
  },

  paintLine(ctx, g, segments) {
    segments.forEach((s) => {
      if (s.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(g.xOf(s[0].i), g.yOf(s[0].val));
      for (let k = 1; k < s.length; k++) {
        const prev = s[k - 1], cur = s[k];
        const mx = (g.xOf(prev.i) + g.xOf(cur.i)) / 2;
        ctx.quadraticCurveTo(mx, g.yOf(prev.val), g.xOf(cur.i), g.yOf(cur.val));
      }
      ctx.strokeStyle = '#3f6f5c';
      ctx.lineWidth = 2.4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();
    });
  },

  paintSpectrumDots(ctx, g, pts, revealX) {
    pts.forEach((p) => {
      const x = g.xOf(p.i);
      if (x > revealX + 2) return;
      const y = g.yOf(p.val);
      ctx.globalAlpha = clamp((revealX - x) / 12 + 0.25, 0.25, 1);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#3f6f5c';
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
  },

  labelAxis(ctx, g) {
    ctx.fillStyle = 'rgba(125, 139, 130, 0.85)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(daysAgoStr(g.days - 1).slice(5), 2, g.h - 8);
    ctx.textAlign = 'right';
    ctx.fillText(todayStr().slice(5), g.w - 2, g.h - 8);
  },

  bindSpectrumHover() {
    if (this.hoverBound) return;
    this.hoverBound = true;
    const canvas = $('#spectrumCanvas');
    const tip = $('#spectrumTip');
    canvas.addEventListener('mousemove', (e) => {
      const g = this.spectrumGeom;
      const pts = this.spectrumPts;
      if (!g || !pts || !pts.length) { tip.classList.add('hidden'); return; }
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (g.w / rect.width);
      const my = (e.clientY - rect.top) * (g.h / rect.height);
      let best = null, bd = 20;
      pts.forEach((p) => {
        const d = Math.hypot(mx - g.xOf(p.i), my - g.yOf(p.val));
        if (d < bd) { bd = d; best = p; }
      });
      if (!best) { tip.classList.add('hidden'); return; }
      const counts = {};
      best.list.forEach((en) => { counts[en.emotion] = (counts[en.emotion] || 0) + 1; });
      let dom = null, n = 0;
      Object.keys(counts).forEach((k) => { if (counts[k] > n) { n = counts[k]; dom = k; } });
      const em = EMOTIONS[dom] || EMOTIONS.neutral;
      const avgInt = Math.round(best.list.reduce((a, en) => a + (en.intensity || 3), 0) / best.list.length);
      tip.textContent = `${best.key.slice(5)} · ${em.emoji} ${em.name} · 强度${avgInt}`;
      tip.style.position = 'fixed';
      tip.style.left = `${clamp(e.clientX, 70, window.innerWidth - 70)}px`;
      tip.style.top = `${Math.max(rect.top + (g.yOf(best.val) / g.h) * rect.height - 8, 10)}px`;
      tip.classList.remove('hidden');
    });
    canvas.addEventListener('mouseleave', () => tip.classList.add('hidden'));
  },

  renderInsight(pts, entries) {
    const el = $('#spectrumInsight');
    const dom = this.dominantEmotion(entries);
    if (pts.length >= 4) {
      const half = Math.floor(pts.length / 2);
      const first = pts.slice(0, half).reduce((a, p) => a + p.val, 0) / half;
      const second = pts.slice(half).reduce((a, p) => a + p.val, 0) / (pts.length - half);
      const delta = second - first;
      if (delta >= 0.6) {
        el.textContent = '你的情绪整体在向更安定的方向流动——你看，它真的会过去。';
        return;
      }
      if (delta <= -0.6) {
        el.textContent = '最近有些起伏。波动也是恢复的一部分，请对慢下来的自己温柔一点。';
        return;
      }
    }
    const msgs = {
      anxiety: '你看，焦虑并非永远持续，它在流动。',
      sad: '低落不会一直待在这里，它是路过的云。',
      joy: '那些亮起来的时刻，也是你真实的一部分。',
      calm: '平稳区里，也有温柔的呼吸。',
      gratitude: '你看见的光越多，光就越愿意靠近你。',
      anger: '愤怒在告诉你边界在哪里，听见它，就是照顾它。',
      fear: '害怕的时候，记得你还有呼吸这个锚点。',
      tired: '疲惫在提醒你：慢一点，也是一种前进。',
      neutral: '每一种情绪都在这里被看见、被记住。',
    };
    el.textContent = dom && msgs[dom] ? msgs[dom] : '每一种情绪都在这里被看见、被记住。';
  },

  dominantEmotion(entries) {
    const count = {};
    entries.forEach((e) => { count[e.emotion] = (count[e.emotion] || 0) + 1; });
    let best = null, n = 0;
    Object.keys(count).forEach((k) => { if (count[k] > n) { n = count[k]; best = k; } });
    return best;
  },

  renderCloud(entries) {
    const el = $('#wordCloud');
    const count = {};
    entries.forEach((e) => { count[e.emotion] = (count[e.emotion] || 0) + 1; });
    const items = Object.entries(count)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([key, n]) => {
        const em = EMOTIONS[key];
        const size = 12 + Math.min(8, n * 2.4);
        return `<span style="font-size:${size}px;border-color:${em.color}44;color:${em.color}">${em.emoji} ${em.name} ×${n}</span>`;
      })
      .join('');
    el.innerHTML = items || '';
  },

  renderHistory() {
    const el = $('#emotionHistory');
    const list = Store.emotions.list().slice(-7).reverse();
    if (!list.length) {
      el.innerHTML = '<div class="empty-state">还没有足迹。此刻，就是你种下的第一颗种子 🌱</div>';
      return;
    }
    el.innerHTML = list.map((e) => {
      const em = EMOTIONS[e.emotion] || EMOTIONS.neutral;
      const dots = [1, 2, 3, 4, 5]
        .map((n) => `<i class="${n <= e.intensity ? 'on' : ''}"></i>`)
        .join('');
      return `<div class="history-item">
        <span class="h-emoji">${em.emoji}</span>
        <div class="h-body">
          <div class="h-date">${fmtTime(e.ts)} · ${em.name}</div>
          <div class="h-note">${e.note ? esc(e.note) : '——'}</div>
        </div>
        <div class="h-intensity">${dots}</div>
      </div>`;
    }).join('');
  },

  refresh() {
    this.renderSpectrum(this.spectrumDays);
    this.renderHistory();
    this.renderHeroStats();
  },

  renderHeroStats() {
    const el = $('#heroStats');
    const emotions = Store.emotions.list();
    const days = new Set(emotions.map((e) => e.date));
    let streak = 0;
    const d = new Date();
    if (!days.has(dateKeyOf(d))) d.setDate(d.getDate() - 1);
    while (days.has(dateKeyOf(d))) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    const todayCount = emotions.filter((e) => e.date === todayStr()).length;
    const lit = Store.light.list().some((l) => l.date === todayStr() && l.lit);
    el.innerHTML = `
      <div class="hero-stat"><b>${streak} 天</b><span>连续记录</span></div>
      <div class="hero-stat"><b>${todayCount} 次</b><span>今日足迹</span></div>
      <div class="hero-stat"><b>${lit ? '✨' : '🌙'}</b><span>今日微光</span></div>`;
  },
};
