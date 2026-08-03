'use strict';

/* ============ 📝 心镜：多模态日记本 ============ */
const DRAW_TOOLS = [
  { key: 'pen', label: '✏️', name: '笔' },
  { key: 'marker', label: '🖍️', name: '马克' },
  { key: 'pencil', label: '✎', name: '铅笔' },
  { key: 'spray', label: '💨', name: '喷枪' },
  { key: 'highlight', label: '🖊️', name: '荧光' },
  { key: 'line', label: '─', name: '直线' },
  { key: 'ellipse', label: '◯', name: '圆形' },
  { key: 'rect', label: '▭', name: '矩形' },
];

const Mirror = {
  BOARD_BG: '#faf0dc',
  strokes: [],
  redoStack: [],
  drawing: false,
  color: '#4f7a60',
  size: 8,
  erasing: false,
  stamp: '',
  tool: 'pen',
  selectedEmotion: '',
  keywords: new Set(),
  intensity: 5,
  promptIndex: 0,

  PROMPTS: [
    '今天发生了什么，哪怕很小？',
    '此刻身体哪个部位在紧绷？',
    '有什么是你希望被理解，却没说出来？',
    '今天有没有一个让你稍微喘口气的瞬间？',
    '如果给今天起个名字，会叫什么？',
    '现在最想放下的是什么？',
    '有没有一句话，你想听别人对你说？',
  ],

  init() {
    this.renderEmotions();
    this.renderKeywords();
    this.renderPrompt();
    this.bindIntensity();
    this.renderTools();
    this.bindExtras();
    this.renderPalette();
    this.renderStamps();
    this.setupCanvas();
    this.bindUndoShortcuts();
    this.updateToolbar();
    this.bindSave();
    this.renderGallery();
  },

  isShape() {
    return ['line', 'ellipse', 'rect'].includes(this.tool);
  },

  renderTools() {
    const wrap = $('#drawTools');
    wrap.innerHTML = DRAW_TOOLS.map((t) =>
      `<button class="tool-btn ${t.key === 'pen' ? 'active' : ''}" data-tool="${t.key}" title="${t.name}" type="button">${t.label}</button>`
    ).join('');
    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.tool-btn');
      if (!btn) return;
      this.tool = btn.dataset.tool;
      $$('.tool-btn', wrap).forEach((b) => b.classList.toggle('active', b === btn));
      this.erasing = false;
      this.stamp = '';
      this.hideStamps();
      $$('.stamp-btn', $('#stampPalette')).forEach((b) => b.classList.toggle('active', b.dataset.emoji === ''));
      $$('.color-swatch', $('#drawColors')).forEach((s) => s.classList.toggle('active', s.dataset.color === this.color));
    });
  },

  hideStamps() {
    $('#stampPalette').classList.add('hidden');
    $('#stampToggle').classList.remove('active');
  },

  bindExtras() {
    $('#mirrorColorPicker').addEventListener('input', (e) => {
      this.color = e.target.value;
      this.erasing = false;
      this.stamp = '';
      this.hideStamps();
      this.tool = 'pen';
      $$('.tool-btn', $('#drawTools')).forEach((b) => b.classList.toggle('active', b.dataset.tool === 'pen'));
      $$('.stamp-btn', $('#stampPalette')).forEach((b) => b.classList.toggle('active', b.dataset.emoji === ''));
      $$('.color-swatch', $('#drawColors')).forEach((s) => s.classList.toggle('active', s.dataset.color === this.color));
    });
    const updatePreview = () => {
      const d = this.size;
      $('#sizePreview').style.width = `${d}px`;
      $('#sizePreview').style.height = `${d}px`;
      $('#sizeNote').textContent = d;
    };
    updatePreview();
    $('#drawSize').addEventListener('input', (e) => {
      this.size = Number(e.target.value);
      updatePreview();
    });
  },

  renderStamps() {
    const stamps = ['', '☀️', '🌙', '🌸', '🍃', '⭐', '💧', '❤️', '🫧', '🦋'];
    const wrap = $('#stampPalette');
    wrap.innerHTML = stamps.map((s, i) =>
      `<button class="stamp-btn ${i === 0 ? 'active' : ''}" data-emoji="${s}" type="button" title="${s ? '盖印章' : '回到画笔'}">${s || '✏️'}</button>`
    ).join('');
    $('#stampToggle').addEventListener('click', () => {
      const pal = $('#stampPalette');
      pal.classList.toggle('hidden');
      $('#stampToggle').classList.toggle('active', !pal.classList.contains('hidden'));
    });
    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.stamp-btn');
      if (!btn) return;
      this.stamp = btn.dataset.emoji;
      $$('.stamp-btn', wrap).forEach((b) => b.classList.toggle('active', b === btn));
      $('#stampPalette').classList.remove('hidden');
      $('#stampToggle').classList.add('active');
      if (this.stamp) toast(`选好了「${this.stamp}」，点画板盖一个吧`);
      else this.hideStamps();
    });
  },

  renderEmotions() {
    const wrap = $('#mirrorEmotions');
    wrap.innerHTML = EMOTION_KEYS.map((k) =>
      `<button class="mirror-chip" data-key="${k}" type="button" style="--mc-color:${EMOTIONS[k].color};--mc-soft:${EMOTIONS[k].soft}">${EMOTIONS[k].emoji} ${EMOTIONS[k].name}</button>`
    ).join('');
    wrap.addEventListener('click', (e) => {
      const chip = e.target.closest('.mirror-chip');
      if (!chip) return;
      this.selectedEmotion = this.selectedEmotion === chip.dataset.key ? '' : chip.dataset.key;
      $$('.mirror-chip', wrap).forEach((c) => c.classList.toggle('selected', c.dataset.key === this.selectedEmotion));
    });
  },

  renderKeywords() {
    const list = ['说不出口', '想被理解', '撑住了', '有点累', '想被抱抱', '想一个人待着', '又熬过一天', '需要帮助'];
    const wrap = $('#mirrorKeywords');
    wrap.innerHTML = list.map((k) =>
      `<button class="keyword-chip" data-k="${k}" type="button">${k}</button>`
    ).join('');
    wrap.addEventListener('click', (e) => {
      const chip = e.target.closest('.keyword-chip');
      if (!chip) return;
      const k = chip.dataset.k;
      if (this.keywords.has(k)) this.keywords.delete(k);
      else this.keywords.add(k);
      chip.classList.toggle('on', this.keywords.has(k));
    });
  },

  renderPrompt() {
    const el = $('#mirrorPromptText');
    const show = () => { el.textContent = this.PROMPTS[this.promptIndex % this.PROMPTS.length]; };
    $('#mirrorPromptNext').addEventListener('click', () => {
      this.promptIndex++;
      show();
    });
    $('#mirrorPromptUse').addEventListener('click', () => {
      const ta = $('#mirrorText');
      const p = el.textContent;
      ta.value = ta.value.trim() ? ta.value.trim() + '\n' + p : p;
      ta.focus();
      toast('写吧，怎么都行 ✍️');
    });
    show();
  },

  bindIntensity() {
    const range = $('#mirrorIntensity');
    const val = $('#mirrorIntensityVal');
    range.addEventListener('input', () => {
      this.intensity = Number(range.value);
      val.textContent = this.intensity;
    });
  },

  renderPalette() {
    const colors = [
      '#3f6f5c', '#8dbcd6', '#ecc66a', '#dd7d6d',
      '#a696c0', '#e6a36e', '#63aeb8', '#92c58e', '#3d5448', this.BOARD_BG,
    ];
    const wrap = $('#drawColors');
    wrap.innerHTML = colors.map((c, i) =>
      `<button class="color-swatch ${i === 0 ? 'active' : ''}" data-color="${c}" type="button" style="background:${c};${c === this.BOARD_BG ? 'border:2px solid #d8c9a8;' : ''}"></button>`
    ).join('');
    wrap.addEventListener('click', (e) => {
      const sw = e.target.closest('.color-swatch');
      if (!sw) return;
      this.color = sw.dataset.color;
      this.erasing = this.color === this.BOARD_BG;
      this.stamp = '';
      this.hideStamps();
      $$('.stamp-btn', $('#stampPalette')).forEach((b) => b.classList.toggle('active', b.dataset.emoji === ''));
      $$('.color-swatch', wrap).forEach((s) => s.classList.toggle('active', s === sw));
    });

    $('#drawUndo').addEventListener('click', () => this.undo());
    $('#drawRedo').addEventListener('click', () => this.redo());
    $('#drawClear').addEventListener('click', () => {
      this.strokes = [];
      this.redoStack = [];
      this.redraw();
      this.updateToolbar();
    });
  },

  bindUndoShortcuts() {
    document.addEventListener('keydown', (e) => {
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const mod = e.ctrlKey || e.metaKey;
      if (!mod || e.key.toLowerCase() !== 'z') return;
      e.preventDefault();
      if (e.shiftKey) this.redo();
      else this.undo();
    });
  },

  updateToolbar() {
    $('#drawUndo').disabled = this.strokes.length === 0;
    $('#drawRedo').disabled = this.redoStack.length === 0;
  },

  setupCanvas() {
    const canvas = $('#mirrorCanvas');
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const pos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };
    };

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const p = pos(e);
      if (this.stamp) {
        this.redoStack = [];
        this.strokes.push({
          type: 'stamp',
          emoji: this.stamp,
          x: p.x,
          y: p.y,
          size: this.size * 2.6,
          rot: (Math.random() - 0.5) * 0.7,
        });
        this.redraw();
        this.updateToolbar();
        return;
      }
      canvas.setPointerCapture(e.pointerId);
      this.drawing = true;
      if (this.isShape()) {
        this.redoStack = [];
        this.strokes.push({
          type: 'shape',
          kind: this.tool,
          color: this.color,
          size: this.size,
          start: p,
          end: null,
        });
        this.redraw();
        this.updateToolbar();
        return;
      }
      this.redoStack = [];
      this.strokes.push({
        type: 'brush',
        tool: this.tool,
        color: this.color,
        size: this.size,
        eraser: this.erasing,
        points: [p],
        seed: Math.floor(Math.random() * 1e9),
      });
      this.redraw();
      this.updateToolbar();
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!this.drawing) return;
      const stroke = this.strokes[this.strokes.length - 1];
      if (stroke.type === 'shape') {
        stroke.end = pos(e);
        this.redraw();
        return;
      }
      stroke.points.push(pos(e));
      const ctx2 = canvas.getContext('2d');
      this.paintSegment(ctx2, stroke);
    });

    const stop = (e) => {
      if (!this.drawing) return;
      this.drawing = false;
      try { canvas.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    };
    canvas.addEventListener('pointerup', stop);
    canvas.addEventListener('pointercancel', stop);
  },

  paintSegment(ctx, stroke) {
    const pts = stroke.points;
    const color = stroke.eraser ? this.BOARD_BG : stroke.color;
    if (pts.length < 2) {
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, stroke.size / 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      return;
    }
    const a = pts[pts.length - 2];
    const b = pts[pts.length - 1];
    if (stroke.tool === 'spray') {
      this.spraySeg(ctx, a, b, stroke, pts.length - 2);
      return;
    }
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (stroke.tool === 'marker') {
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = stroke.size * 1.7;
    } else if (stroke.tool === 'pencil') {
      ctx.globalAlpha = 0.5 + Math.random() * 0.4;
      ctx.lineWidth = Math.max(1, stroke.size * 0.55);
    } else if (stroke.tool === 'highlight') {
      ctx.globalAlpha = 0.32;
      ctx.lineWidth = stroke.size * 2.3;
    } else {
      ctx.globalAlpha = 1;
      ctx.lineWidth = stroke.size;
    }
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();
  },

  spraySeg(ctx, a, b, stroke, pairIndex) {
    let seed = ((stroke.seed || 1) ^ (pairIndex * 2654435761)) >>> 0;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(1, Math.floor(dist / 4));
    const color = stroke.eraser ? this.BOARD_BG : stroke.color;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      for (let k = 0; k < 3; k++) {
        const ang = rand() * Math.PI * 2;
        const rad = rand() * stroke.size * 0.95;
        ctx.globalAlpha = 0.3 + rand() * 0.35;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad, Math.max(0.6, stroke.size * 0.18), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  },

  redraw() {
    const canvas = $('#mirrorCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = this.BOARD_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.strokes.forEach((stroke) => {
      if (stroke.type === 'stamp') {
        ctx.save();
        ctx.translate(stroke.x, stroke.y);
        ctx.rotate(stroke.rot);
        ctx.font = `${stroke.size}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stroke.emoji, 0, 0);
        ctx.restore();
        return;
      }
      if (stroke.type === 'shape') {
        if (!stroke.end) return;
        ctx.save();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        if (stroke.kind === 'line') {
          ctx.moveTo(stroke.start.x, stroke.start.y);
          ctx.lineTo(stroke.end.x, stroke.end.y);
        } else if (stroke.kind === 'ellipse') {
          const rx = (stroke.end.x - stroke.start.x) / 2;
          const ry = (stroke.end.y - stroke.start.y) / 2;
          ctx.ellipse(stroke.start.x + rx, stroke.start.y + ry, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
        } else {
          ctx.rect(
            Math.min(stroke.start.x, stroke.end.x),
            Math.min(stroke.start.y, stroke.end.y),
            Math.abs(stroke.end.x - stroke.start.x),
            Math.abs(stroke.end.y - stroke.start.y)
          );
        }
        ctx.stroke();
        ctx.restore();
        return;
      }
      if (stroke.tool === 'spray') {
        for (let i = 1; i < stroke.points.length; i++) {
          this.spraySeg(ctx, stroke.points[i - 1], stroke.points[i], stroke, i);
        }
        if (stroke.points.length === 1) {
          ctx.save();
          ctx.globalAlpha = 0.45;
          ctx.fillStyle = stroke.eraser ? this.BOARD_BG : stroke.color;
          ctx.beginPath();
          ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        return;
      }
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.beginPath();
        ctx.moveTo(stroke.points[i - 1].x, stroke.points[i - 1].y);
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        ctx.strokeStyle = stroke.eraser ? this.BOARD_BG : stroke.color;
        ctx.lineWidth = stroke.size;
        if (stroke.tool === 'marker') ctx.globalAlpha = 0.5;
        else if (stroke.tool === 'pencil') ctx.globalAlpha = 0.65;
        else if (stroke.tool === 'highlight') ctx.globalAlpha = 0.32;
        else ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
      if (stroke.points.length === 1) {
        ctx.beginPath();
        ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = stroke.eraser ? this.BOARD_BG : stroke.color;
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
    });
  },

  undo() {
    if (!this.strokes.length) return;
    this.redoStack.push(this.strokes.pop());
    this.redraw();
    this.updateToolbar();
  },

  redo() {
    if (!this.redoStack.length) return;
    this.strokes.push(this.redoStack.pop());
    this.redraw();
    this.updateToolbar();
  },

  bindSave() {
    $('#saveMirror').addEventListener('click', () => this.save());
  },

  save() {
    const text = $('#mirrorText').value.trim();
    const smallWin = $('#mirrorSmall').value.trim();
    const selfTalk = $('#mirrorSelf').value.trim();
    const canvas = $('#mirrorCanvas');
    if (!text && !smallWin && this.strokes.length === 0) {
      toast('写下一点文字、记一件小事，或画下一点颜色吧 📝');
      return;
    }

    let img = '';
    if (this.strokes.length > 0) {
      // 压缩画作后以 Base64 存储
      const temp = document.createElement('canvas');
      const scale = Math.min(1, 700 / canvas.width);
      temp.width = Math.round(canvas.width * scale);
      temp.height = Math.round(canvas.height * scale);
      const tctx = temp.getContext('2d');
      tctx.fillStyle = this.BOARD_BG;
      tctx.fillRect(0, 0, temp.width, temp.height);
      tctx.drawImage(canvas, 0, 0, temp.width, temp.height);
      img = temp.toDataURL('image/jpeg', 0.82);
    }

    const entry = {
      id: uid(),
      date: todayStr(),
      ts: Date.now(),
      emotion: this.selectedEmotion,
      intensity: this.intensity,
      keywords: Array.from(this.keywords),
      smallWin,
      selfTalk,
      text,
      img,
    };
    if (Store.diary.add(entry)) {
      $('#mirrorText').value = '';
      $('#mirrorSmall').value = '';
      $('#mirrorSelf').value = '';
      this.selectedEmotion = '';
      this.keywords.clear();
      this.intensity = 5;
      $('#mirrorIntensity').value = '5';
      $('#mirrorIntensityVal').textContent = '5';
      $$('.mirror-chip').forEach((c) => c.classList.remove('selected'));
      $$('.keyword-chip').forEach((c) => c.classList.remove('on'));
      this.strokes = [];
      this.redoStack = [];
      this.redraw();
      this.updateToolbar();
      toast('已存入心镜 🖼️');
      this.renderGallery();
      this.celebrate();
    }
  },

  celebrate() {
    if (prefersReducedMotion()) return;
    const btn = $('#saveMirror');
    const r = btn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top;
    const marks = ['✦', '✧', '💛', '✦', '✧'];
    for (let i = 0; i < 8; i++) {
      const s = document.createElement('span');
      s.className = 'spark';
      s.textContent = marks[i % marks.length];
      s.style.left = `${cx}px`;
      s.style.top = `${cy}px`;
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2;
      const dist = 40 + Math.random() * 70;
      s.style.setProperty('--dx', `${Math.round(Math.cos(ang) * dist)}px`);
      s.style.setProperty('--dy', `${Math.round(Math.sin(ang) * dist)}px`);
      s.style.setProperty('--rot', `${Math.round(Math.random() * 140 - 70)}deg`);
      s.style.setProperty('--dur', `${(0.9 + Math.random() * 0.5).toFixed(2)}s`);
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1600);
    }
  },

  renderGallery() {
    const el = $('#mirrorGallery');
    const list = Store.diary.list().slice().reverse();
    if (!list.length) {
      el.innerHTML = '<div class="empty-state">心镜还是空的。画一笔、写一句，它都会替你收好。</div>';
      return;
    }
    el.innerHTML = list.map((e) => {
      const em = e.emotion ? EMOTIONS[e.emotion] : null;
      const tag = em
        ? `<span class="emotion-tag" style="--tag-soft:${em.soft};--tag-color:${em.color}">${em.emoji} ${em.name}</span>`
        : '';
      const intensity = e.intensity ? `<span class="gi-line">强度 ${e.intensity}/10</span>` : '';
      const keywords = (e.keywords && e.keywords.length)
        ? `<span class="gi-keywords">${e.keywords.map((k) => `<i>${esc(k)}</i>`).join('')}</span>`
        : '';
      const smallWin = e.smallWin ? `<p class="gi-line">✨ 今天的一件小事：${esc(e.smallWin)}</p>` : '';
      const selfTalk = e.selfTalk ? `<p class="gi-line">💬 想对自己说：${esc(e.selfTalk)}</p>` : '';
      return `<div class="gallery-item" data-id="${e.id}">
        ${e.img ? `<img src="${e.img}" alt="涂鸦日记" loading="lazy">` : ''}
        <div class="gallery-body">
          <div class="gallery-meta">
            <span class="g-date">${fmtTime(e.ts)}</span>
            ${tag}
            ${intensity}
            <button class="gallery-del" data-del="${e.id}" type="button">删除</button>
          </div>
          ${keywords}
          ${e.text ? `<p class="gallery-text">${esc(e.text)}</p>` : ''}
          ${smallWin}
          ${selfTalk}
        </div>
      </div>`;
    }).join('');
    el.addEventListener('click', (ev) => {
      const del = ev.target.closest('[data-del]');
      if (!del) return;
      Store.diary.remove(del.dataset.del);
      this.renderGallery();
      toast('已移除这条日记');
    });
  },
};
