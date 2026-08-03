'use strict';

/* =========================================================
 * 治愈增强模块：PHQ-9 / 安全计划 / 思维记录 / 数据
 * 情绪花园 / 发财接星星 / 安心小岛 / 4-7-8 呼吸
 * 全部本地存储，视觉沿用现有暖色玻璃 + 星空风格。
 * ========================================================= */

const PHQ_ITEMS = [
  '做事时提不起劲或没有兴趣',
  '感到心情低落、沮丧或绝望',
  '入睡困难、睡不安稳或睡眠过多',
  '感觉疲倦或没有活力',
  '食欲不振或吃太多',
  '觉得自己很糟，或觉得自己很失败、让自己或家人失望',
  '难以集中注意力（例如看电视或读东西时）',
  '动作或说话速度缓慢到别人能察觉；或相反，烦躁、坐立不安',
  '有不如死掉，或用某种方式伤害自己的念头',
];
const PHQ_OPTS = ['完全没有', '好几天', '一半以上天数', '几乎每天'];
const GARDEN_FLOWERS = {
  joy: { e: '🌻', cls: 'joy' },
  calm: { e: '🪷', cls: 'calm' },
  gratitude: { e: '🌼', cls: 'gratitude' },
  neutral: { e: '🌱', cls: 'neutral' },
  anxiety: { e: '🌷', cls: 'anxiety' },
  sad: { e: '🥀', cls: 'sad' },
  anger: { e: '🌺', cls: 'anger' },
  fear: { e: '🪻', cls: 'fear' },
  tired: { e: '🍂', cls: 'tired' },
};
const CALM_ITEMS = [
  { id: 'star', emoji: '⭐', x: 14, y: 28 },
  { id: 'shell', emoji: '🐚', x: 76, y: 74 },
  { id: 'leaf', emoji: '🍃', x: 24, y: 62 },
  { id: 'cloud', emoji: '☁️', x: 60, y: 22 },
  { id: 'moon', emoji: '🌙', x: 88, y: 40 },
  { id: 'heart', emoji: '💛', x: 44, y: 80 },
];

const Heal = {
  phqAnswers: [],
  calmCollected: 0,
  calmItems: [],

  init() {
    this.bindEsc();
    this.initPhq();
    this.initPlan();
    this.initThought();
    this.initData();
    this.initGarden();
    this.initCatcher();
    this.initCalm();
    this.init478();
    this.initLoveContact();
    this.careFollowup();
  },

  /* ================= 私人紧急联系人（密码解锁） ================= */
  initLoveContact() {
    const overlay = $('#crisisOverlay');
    if (!overlay) return;
    const NAME = '永远爱迪迪的松';
    const MASK = '155****7610';
    const FULL = '15585067610';
    const key = 'xy_love_unlocked';
    let unlockedNow = false;
    const lockedHtml = `<b>📱 ${NAME}</b><button id="loveUnlock" class="hotline-lock" type="button">${MASK} · 解锁 🔒</button>`;
    const resetLove = () => {
      unlockedNow = false;
      try { sessionStorage.removeItem(key); } catch (e) { /* ignore */ }
      const li = $('#loveUnlock') ? $('#loveUnlock').closest('li') : document.querySelector('.hotline-locked');
      if (li) li.innerHTML = lockedHtml;
      const reveal = $('#loveReveal');
      if (reveal) reveal.classList.add('hidden');
      const pwd = $('#lovePwd');
      if (pwd) pwd.value = '';
    };
    // 每次打开紧急帮助弹层，都重置为锁定状态
    if (window.MutationObserver) {
      const obs = new MutationObserver(() => {
        if (!overlay.classList.contains('hidden')) resetLove();
      });
      obs.observe(overlay, { attributes: true, attributeFilter: ['class'] });
    }
    overlay.addEventListener('click', (e) => {
      const t = e.target;
      if (t.id === 'loveUnlock') {
        $('#loveReveal').classList.remove('hidden');
        $('#lovePwd').focus();
        return;
      }
    });
    const form = $('#loveForm');
    const tryUnlock = () => {
      if (unlockedNow) return;
      if ($('#lovePwd').value.trim() === '520') {
        unlockedNow = true;
        const li = $('#loveUnlock') ? $('#loveUnlock').closest('li') : document.querySelector('.hotline-locked');
        if (li) li.innerHTML = `<b>📱 ${NAME}</b><a class="hotline-tel" href="tel:${FULL}">${FULL}</a>`;
        $('#loveReveal').classList.add('hidden');
        toast('已解锁，正在为你拨出 📞');
        location.href = 'tel:' + FULL; // 同步触发，保留用户手势
      } else {
        toast('密码不对，再试一次 🔒');
        $('#lovePwd').value = '';
        $('#lovePwd').focus();
      }
    };
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        tryUnlock();
      });
    }
    const go = $('#loveGo');
    if (go) {
      go.addEventListener('click', (e) => {
        e.preventDefault();
        tryUnlock();
      });
    }
  },

  bindEsc() {
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      $$('.overlay:not(.hidden)').forEach((o) => o.classList.add('hidden'));
    });
  },

  /* ================= PHQ-9 ================= */
  initPhq() {
    $('#phqStart').addEventListener('click', () => this.startPhq());
    $('#phqHistory').addEventListener('click', () => {
      if (!Store.phq.list().length) {
        toast('还没有自评记录，先做一次吧 📋');
        return;
      }
      const wrap = $('#phqTrendWrap');
      wrap.classList.toggle('hidden');
      this.renderPhqTrend();
    });
  },

  startPhq() {
    this.phqAnswers = Array(PHQ_ITEMS.length).fill(null);
    $('#phqIntro').classList.add('hidden');
    $('#phqResult').classList.add('hidden');
    const quiz = $('#phqQuiz');
    quiz.classList.remove('hidden');
    quiz.innerHTML = PHQ_ITEMS.map((q, i) => `
      <div class="phq-item" data-q="${i}">
        <p class="phq-question">${i + 1}. ${esc(q)}</p>
        <div class="phq-opts" role="radiogroup" aria-label="第 ${i + 1} 题">
          ${PHQ_OPTS.map((o, v) => `<button class="phq-opt" data-v="${v}" type="button">${o}</button>`).join('')}
        </div>
      </div>`).join('');
    quiz.querySelectorAll('.phq-opt').forEach((b) => b.addEventListener('click', () => {
      const item = b.closest('.phq-item');
      const q = +item.dataset.q;
      this.phqAnswers[q] = +b.dataset.v;
      item.querySelectorAll('.phq-opt').forEach((x) => x.classList.toggle('sel', x === b));
    }));
    const submit = document.createElement('button');
    submit.id = 'phqSubmit';
    submit.className = 'btn primary full';
    submit.type = 'button';
    submit.textContent = '提交自评';
    submit.addEventListener('click', () => this.submitPhq());
    const cancel = document.createElement('button');
    cancel.id = 'phqCancel';
    cancel.className = 'btn ghost full';
    cancel.type = 'button';
    cancel.textContent = '取消';
    cancel.addEventListener('click', () => {
      quiz.classList.add('hidden');
      $('#phqIntro').classList.remove('hidden');
    });
    const row = document.createElement('div');
    row.className = 'btn-row';
    row.append(submit, cancel);
    quiz.appendChild(row);
  },

  submitPhq() {
    if (this.phqAnswers.some((a) => a === null)) {
      toast('还有题目没选，慢慢来，不着急 📋');
      return;
    }
    const score = this.phqAnswers.reduce((a, b) => a + b, 0);
    Store.phq.add({ id: uid(), ts: Date.now(), date: todayStr(), score, answers: this.phqAnswers.slice() });
    $('#phqQuiz').classList.add('hidden');
    const result = $('#phqResult');
    result.classList.remove('hidden');
    const sev = this.phqSeverity(score);
    result.innerHTML = `
      <div class="phq-score"><b>${score}</b><span> / 27 分</span></div>
      <p class="severity-pill ${sev.cls}">${sev.label}</p>
      <p class="mini-note">${sev.advice}</p>
      <p class="mini-note">PHQ-9 是筛查工具，不能替代医生诊断；如果这些问题正困扰你，可以把结果带给专业人员看看。</p>
      <div class="btn-row">
        <button id="phqAgain" class="btn ghost" type="button">再做一次</button>
        <button id="phqDone" class="btn primary" type="button">看趋势</button>
      </div>`;
    $('#phqAgain').addEventListener('click', () => {
      result.classList.add('hidden');
      this.startPhq();
    });
    $('#phqDone').addEventListener('click', () => {
      $('#phqTrendWrap').classList.remove('hidden');
      this.renderPhqTrend();
    });
    if (this.phqAnswers[8] > 0) {
      Store.careflags.add();
      this.openCrisis('🛟 谢谢你愿意告诉我们', '你刚才的最后一题提到了伤害自己的念头。这不是矫情，是很需要被认真对待的信号。请现在就联系专业支持：');
    } else {
      toast('已记录，谢谢你愿意看见自己 🌱');
    }
  },

  phqSeverity(score) {
    if (score <= 4) return { label: '无明显抑郁症状', cls: 'sev-ok', advice: '继续保持现在照顾自己的方式。如果情绪开始压过生活，随时可以回来记录。' };
    if (score <= 9) return { label: '轻度抑郁症状', cls: 'sev-mild', advice: '可以先用站内的着陆、花园和呼吸照顾自己；如果持续两周以上或越来越重，建议约一次专业评估。' };
    if (score <= 14) return { label: '中度抑郁症状', cls: 'sev-mid', advice: '建议近期安排一次专业评估（三甲精神科/心理科或咨询师），同时继续使用站内工具；你不必一个人扛。' };
    if (score <= 19) return { label: '中重度抑郁症状', cls: 'sev-high', advice: '请尽快预约专业评估，并告诉一位信任的人。情绪有办法被治疗，前提是先被看见。' };
    return { label: '重度抑郁症状', cls: 'sev-severe', advice: '请尽快联系精神科医生，并让信任的人陪你。如果出现伤害自己的念头，请立即拨打 12356 或 120。' };
  },

  renderPhqTrend() {
    const canvas = $('#phqTrend');
    if (!canvas) return;
    const list = Store.phq.list().slice(-10);
    const note = $('#phqTrendNote');
    if (list.length < 2) {
      note.textContent = '再记录几次，就能看到你的变化曲线了。';
      canvas.style.display = 'none';
      return;
    }
    canvas.style.display = '';
    const W = canvas.width = Math.max(260, Math.min(720, canvas.parentElement.clientWidth - 8));
    const H = canvas.height = 170;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    const pad = { l: 28, r: 10, t: 12, b: 24 };
    const xs = (i) => pad.l + (W - pad.l - pad.r) * (i / (list.length - 1));
    const ys = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / 27);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.fillStyle = 'rgba(200,180,150,0.6)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    for (let v = 0; v <= 27; v += 9) {
      ctx.beginPath(); ctx.moveTo(pad.l, ys(v)); ctx.lineTo(W - pad.r, ys(v)); ctx.stroke();
      ctx.fillText(String(v), pad.l - 5, ys(v) + 3);
    }
    ctx.beginPath();
    list.forEach((e, i) => { const x = xs(i), y = ys(e.score); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.strokeStyle = '#e3bd86';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    list.forEach((e, i) => {
      ctx.beginPath();
      ctx.arc(xs(i), ys(e.score), 4, 0, Math.PI * 2);
      ctx.fillStyle = e.score >= 15 ? '#f08a6e' : '#f2cf8f';
      ctx.fill();
      ctx.fillStyle = 'rgba(200,180,150,0.75)';
      ctx.textAlign = 'center';
      ctx.fillText(e.date.slice(5), xs(i), H - 8);
    });
    const last = list[list.length - 1];
    const prev = list[list.length - 2];
    note.textContent = last.score === prev.score
      ? `和上次一样（${last.score} 分）。分数不变也是一种信息，继续记录就好。`
      : last.score < prev.score
        ? `比上次低了 ${prev.score - last.score} 分。变化是真实的，慢慢来。`
        : `比上次高了 ${last.score - prev.score} 分。分数上升不代表失败，它只是提醒我们多照顾自己一些。`;
  },

  openCrisis(title, text) {
    $('#careTitle').textContent = title;
    $('#careText').textContent = text;
    $('#crisisOverlay').classList.remove('hidden');
  },

  careFollowup() {
    if (this.careFollowupShown || !Store.careflags.hasRecent(2)) return;
    this.careFollowupShown = true;
    setTimeout(() => {
      toast('昨天你提到了一些很难受的事。今天还好吗？需要的时候点右上角 🆘');
    }, 6000);
  },

  /* ================= 安全计划 ================= */
  initPlan() {
    $$('[data-action="plan"]').forEach((b) => b.addEventListener('click', () => this.openPlan()));
    $('#savePlan').addEventListener('click', () => this.savePlan());
    $('#planClose').addEventListener('click', () => $('#planOverlay').classList.add('hidden'));
    $('#crisisPlan').addEventListener('click', () => {
      $('#crisisOverlay').classList.add('hidden');
      this.openPlan();
    });
  },

  openPlan() {
    $('#planOverlay').classList.remove('hidden');
    const plan = Store.safetyplan.get();
    if (plan) {
      this.renderPlanView(plan);
      $('#planForm').classList.add('hidden');
      $('#planView').classList.remove('hidden');
    } else {
      $('#planView').classList.add('hidden');
      $('#planForm').classList.remove('hidden');
    }
  },

  renderPlanView(plan) {
    const steps = [
      ['预警信号', plan.s1],
      ['我自己能做的事', plan.s2],
      ['能分散注意力的人和地方', plan.s3],
      ['能帮助我的人', plan.s4],
      ['专业人士与求助热线', plan.s5],
      ['让环境更安全', plan.s6],
    ];
    $('#planView').innerHTML = steps.map(([t, v], i) => `
      <div class="plan-step-view"><b>${i + 1} · ${t}</b><p>${esc(v || '（空）')}</p></div>`).join('') +
      `<div class="btn-row">
        <button id="planEdit" class="btn ghost" type="button">编辑</button>
        <a class="btn primary" href="tel:12356">📞 拨打 12356</a>
      </div>`;
    $('#planEdit').addEventListener('click', () => {
      ['plan1', 'plan2', 'plan3', 'plan4', 'plan5', 'plan6'].forEach((id, i) => {
        $('#' + id).value = plan['s' + (i + 1)] || '';
      });
      $('#planView').classList.add('hidden');
      $('#planForm').classList.remove('hidden');
    });
  },

  savePlan() {
    const plan = {
      s1: $('#plan1').value.trim(),
      s2: $('#plan2').value.trim(),
      s3: $('#plan3').value.trim(),
      s4: $('#plan4').value.trim(),
      s5: $('#plan5').value.trim(),
      s6: $('#plan6').value.trim(),
      updated: Date.now(),
    };
    Store.safetyplan.set(plan);
    toast('安全计划已保存 🛟');
    this.renderPlanView(plan);
    $('#planForm').classList.add('hidden');
    $('#planView').classList.remove('hidden');
  },

  /* ================= 思维记录 ================= */
  initThought() {
    $$('[data-action="thought"]').forEach((b) => b.addEventListener('click', () => {
      $('#thoughtOverlay').classList.remove('hidden');
      setTimeout(() => $('#thoughtSituation').focus(), 60);
    }));
    $('#saveThought').addEventListener('click', () => this.saveThought());
    $('#thoughtClose').addEventListener('click', () => $('#thoughtOverlay').classList.add('hidden'));
    this.renderThoughtList();
  },

  saveThought() {
    const situation = $('#thoughtSituation').value.trim();
    const auto = $('#thoughtAuto').value.trim();
    if (!situation && !auto) {
      toast('至少写一个情境或想法 📝');
      return;
    }
    Store.thoughts.add({
      id: uid(),
      ts: Date.now(),
      date: todayStr(),
      kind: 'thought',
      situation,
      emotion: +$('#thoughtEmotion').value || 0,
      auto,
      evidence: $('#thoughtEvidence').value.trim(),
      balance: $('#thoughtBalance').value.trim(),
    });
    ['thoughtSituation', 'thoughtAuto', 'thoughtEvidence', 'thoughtBalance'].forEach((id) => { $('#' + id).value = ''; });
    $('#thoughtEmotion').value = '7';
    $('#thoughtOverlay').classList.add('hidden');
    toast('记录收好了，想法不等于事实 📝');
    this.renderThoughtList();
  },

  renderThoughtList() {
    const el = $('#thoughtList');
    const list = Store.thoughts.list().filter((t) => t.kind === 'thought').slice().reverse().slice(0, 4);
    if (!list.length) {
      el.innerHTML = '';
      return;
    }
    el.innerHTML = list.map((t) => `
      <details class="thought-item">
        <summary>${t.date.slice(5)} · ${esc(t.auto || t.situation || '').slice(0, 22)}…</summary>
        <p><b>情境：</b>${esc(t.situation || '—')}</p>
        <p><b>自动想法：</b>${esc(t.auto || '—')}（强度 ${t.emotion}/10）</p>
        ${t.evidence ? `<p><b>证据：</b>${esc(t.evidence)}</p>` : ''}
        ${t.balance ? `<p><b>更平衡的想法：</b>${esc(t.balance)}</p>` : ''}
        <button class="btn ghost sm" data-del-thought="${t.id}" type="button">删除</button>
      </details>`).join('');
    el.querySelectorAll('[data-del-thought]').forEach((b) => b.addEventListener('click', () => {
      Store.thoughts.remove(b.dataset.delThought);
      this.renderThoughtList();
      toast('已删除');
    }));
  },

  /* ================= 数据 / 隐私 ================= */
  initData() {
    $('#openReport').addEventListener('click', () => {
      this.buildReport();
      $('#reportOverlay').classList.remove('hidden');
    });
    $('#reportClose').addEventListener('click', () => $('#reportOverlay').classList.add('hidden'));
    $('#reportCopy').addEventListener('click', () => {
      if (!this.reportText) return;
      const done = () => toast('报告已复制，可以带去见咨询师 📄');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(this.reportText).then(done).catch(() => {});
      }
    });
    $('#reportExport').addEventListener('click', () => this.exportData());
    $('#openPrivacy').addEventListener('click', () => {
      $('#remindToggle').checked = !!Store.remind.get().enabled;
      $('#privacyOverlay').classList.remove('hidden');
    });
    $('#privacyClose').addEventListener('click', () => $('#privacyOverlay').classList.add('hidden'));
    $('#privacyExport').addEventListener('click', () => this.exportData());
    $('#privacyDelete').addEventListener('click', () => {
      if (confirm('确定删除这台设备上的全部记录吗？此操作不可恢复。')) {
        Object.keys(localStorage).filter((k) => k.startsWith(Store.PREFIX)).forEach((k) => localStorage.removeItem(k));
        location.reload();
      }
    });
    $('#remindToggle').addEventListener('change', (e) => {
      const v = Store.remind.get();
      v.enabled = e.target.checked;
      if (v.enabled && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      Store.remind.set(v);
      toast(e.target.checked ? '晚间提醒已开启 🔔' : '晚间提醒已关闭');
    });
    this.startReminder();
  },

  buildReport() {
    const emo = Store.emotions.list().filter((e) => Date.now() - e.ts < 30 * 86400000);
    const phq = Store.phq.list();
    const ground = Store.ground.list().filter((e) => Date.now() - e.ts < 30 * 86400000);
    const diary = Store.diary.list().filter((e) => Date.now() - e.ts < 30 * 86400000);
    const garden = (Store.get('moodgarden', { flowers: [] }).flowers || []).length;
    const avg = (arr, f) => (arr.length ? (arr.reduce((a, b) => a + f(b), 0) / arr.length).toFixed(1) : '—');
    const top = {};
    emo.forEach((e) => { top[e.emotion] = (top[e.emotion] || 0) + 1; });
    const topName = Object.entries(top).sort((a, b) => b[1] - a[1])[0];
    const topTxt = topName && EMOTIONS[topName[0]] ? `${EMOTIONS[topName[0]].emoji} ${EMOTIONS[topName[0]].name}（${topName[1]} 次）` : '—';
    const lastPhq = phq.length ? phq[phq.length - 1] : null;
    const lines = [
      '迪迪的心屿 · 情绪小结（近 30 天）',
      `生成时间：${new Date().toLocaleString('zh-CN', { hour12: false })}`,
      `情绪记录：${emo.length} 天 · 最常见情绪：${topTxt} · 平均强度：${avg(emo, (e) => e.val || 0)}`,
      lastPhq ? `PHQ-9：最近一次 ${lastPhq.score}/27（${lastPhq.date}）` : 'PHQ-9：尚未完成过自评',
      `着陆练习（近 30 天）：${ground.length} 次`,
      `心镜日记（近 30 天）：${diary.length} 篇`,
      `情绪花园：已开出 ${garden} 朵花`,
      '说明：以上为自我记录与筛查工具结果，不能替代医生诊断。',
    ];
    this.reportText = lines.join('\n');
    $('#reportBody').innerHTML = lines.map((l) => `<p>${esc(l)}</p>`).join('');
  },

  exportData() {
    const keys = ['emotions', 'ground', 'diary', 'garden', 'light', 'phq', 'safetyplan', 'ba', 'thoughts', 'sleep', 'careflags', 'remind', 'moodgarden', 'catch', 'smallthings', 'lightidx'];
    const data = { app: '迪迪的心屿', exportedAt: new Date().toISOString() };
    keys.forEach((k) => { data[k] = Store.get(k, null); });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `didi-mood-data-${todayStr()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    toast('数据已导出 📦');
  },

  startReminder() {
    if (!Store.remind.get().enabled) return;
    setInterval(() => {
      const cfg = Store.remind.get();
      const h = new Date().getHours();
      const d = todayStr();
      if (cfg.enabled && h === cfg.hour && cfg.lastNotified !== d) {
        cfg.lastNotified = d;
        Store.remind.set(cfg);
        toast('🌙 睡前微光：今天也辛苦了，记得给自己留一点空隙');
      }
    }, 60000);
  },

  /* ================= 情绪花园 ================= */
  gardenData() {
    return Store.get('moodgarden', { flowers: [], decor: 0 });
  },

  initGarden() {
    $('#plantFlower').addEventListener('click', () => this.plantFlower());
    $('#gardenWater').addEventListener('click', () => this.waterGarden());
    this.renderGarden();
  },

  plantFlower() {
    const today = Store.emotions.list().filter((e) => e.date === todayStr());
    const last = today[today.length - 1];
    if (!last) {
      toast('先去「此刻」记一笔今天的心情，花会知道怎么开 🌱');
      return;
    }
    const data = this.gardenData();
    if (data.flowers.some((f) => f.date === todayStr())) {
      toast('今天的花已经种下啦，明天再来 🌷');
      return;
    }
    data.flowers.push({ date: todayStr(), emotion: last.emotion, ts: Date.now() });
    Store.set('moodgarden', data);
    this.renderGarden();
    this.celebrateAt($('#gardenBed'));
    toast('今天的花，开好了 🌸');
  },

  waterGarden() {
    const data = this.gardenData();
    if (!data.flowers.length) {
      toast('花园还空着，先种下一朵花吧 🌱');
      return;
    }
    data.decor = (data.decor || 0) + 1;
    Store.set('moodgarden', data);
    this.renderGarden();
    toast('花园亮起了萤火 ✨');
  },

  consecutiveDays(flowers) {
    const days = new Set(flowers.map((f) => f.date));
    let n = 0;
    const d = new Date();
    while (days.has(dateKeyOf(d))) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  },

  renderGarden() {
    const data = this.gardenData();
    const flowers = data.flowers || [];
    const stats = flowers.length
      ? `共 ${flowers.length} 朵 · 连续 ${this.consecutiveDays(flowers)} 天`
      : '花园还空着';
    $('#gardenStats').textContent = stats;
    const bed = $('#gardenBed');
    if (!flowers.length) {
      bed.innerHTML = '<div class="garden-empty">🌱 把今天的情绪种进来，这里会长出属于你的花。</div>';
      $('#gardenTip').textContent = '在「此刻」保存一次心情，然后点「种下今天的花」。';
      return;
    }
    const recent = flowers.slice(-12);
    bed.innerHTML = recent.map((f, i) => {
      const fl = GARDEN_FLOWERS[f.emotion] || GARDEN_FLOWERS.neutral;
      return `<span class="garden-flower f-${fl.cls}" style="--fl-delay:${(i % 4) * 0.35}s" title="${f.date}">${fl.e}</span>`;
    }).join('') + (data.decor ? `<span class="garden-firefly">${'✨'.repeat(Math.min(data.decor, 6))}</span>` : '');
    bed.querySelectorAll('.garden-flower').forEach((f) => f.addEventListener('click', () => {
      f.classList.add('pop');
      setTimeout(() => f.classList.remove('pop'), 600);
      this.spawnSparkle(f);
    }));
    $('#gardenTip').textContent = '点一点花，它会轻轻摇一摇；「浇浇水」会让花园亮起萤火。';
  },

  spawnSparkle(el) {
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 4; i++) {
      const s = document.createElement('span');
      s.className = 'spark';
      s.textContent = '✦';
      s.style.left = `${r.left + r.width / 2}px`;
      s.style.top = `${r.top}px`;
      s.style.setProperty('--dx', `${Math.round((Math.random() - 0.5) * 60)}px`);
      s.style.setProperty('--dy', `${Math.round(-30 - Math.random() * 40)}px`);
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1400);
    }
  },

  celebrateAt(el) {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('span');
      s.className = 'spark';
      s.textContent = ['✦', '✧', '💛'][i % 3];
      s.style.left = `${cx}px`;
      s.style.top = `${cy}px`;
      const ang = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 80;
      s.style.setProperty('--dx', `${Math.round(Math.cos(ang) * dist)}px`);
      s.style.setProperty('--dy', `${Math.round(Math.sin(ang) * dist)}px`);
      s.style.setProperty('--rot', `${Math.round(Math.random() * 160 - 80)}deg`);
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1500);
    }
  },

  /* ================= 发财接星星 ================= */
  initCatcher() {
    this.catch = { running: false, raf: null, score: 0, motes: [], cat: { x: 0, y: 0, tx: 0, ty: 0 } };
    $('#catchStart').addEventListener('click', () => this.startCatcher());
    $('#catchReset').addEventListener('click', () => this.resetCatcher());
  },

  startCatcher() {
    const canvas = $('#catchCanvas');
    const wrap = canvas.parentElement;
    canvas.width = Math.max(300, Math.min(720, wrap.clientWidth - 4));
    canvas.height = 210;
    const c = this.catch;
    c.running = true;
    c.score = c.score || 0;
    c.cat.x = c.cat.tx = canvas.width / 2;
    c.cat.y = c.cat.ty = canvas.height / 2;
    if (!c.motes.length) {
      c.motes = Array.from({ length: 12 }, () => this.makeMote(canvas));
    }
    $('#catchStart').textContent = '继续接 ✨';
    $('#catchStats').textContent = `已接住 ${c.score} 颗`;
    if (c.raf) cancelAnimationFrame(c.raf);
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      c.cat.tx = e.clientX - r.left;
      c.cat.ty = e.clientY - r.top;
    };
    canvas.addEventListener('pointermove', onMove, { passive: true });
    this.catchMove = onMove;
    const ctx = canvas.getContext('2d');
    const step = () => {
      if (!c.running || !canvas.isConnected) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      c.cat.x += (c.cat.tx - c.cat.x) * 0.18;
      c.cat.y += (c.cat.ty - c.cat.y) * 0.18;
      c.motes.forEach((m) => {
        m.x += m.vx + Math.sin(m.ph) * 0.25;
        m.y += m.vy;
        m.ph += 0.04;
        if (m.y < -10) { m.y = canvas.height + 10; m.x = Math.random() * canvas.width; }
        if (m.x < -10) m.x = canvas.width + 10;
        if (m.x > canvas.width + 10) m.x = -10;
        const dx = m.x - c.cat.x;
        const dy = m.y - c.cat.y;
        if (dx * dx + dy * dy < 26 * 26) {
          c.score++;
          $('#catchStats').textContent = `已接住 ${c.score} 颗`;
          m.x = Math.random() * canvas.width;
          m.y = canvas.height + 8;
          if (c.score % 10 === 0) {
            const data = this.gardenData();
            data.decor = (data.decor || 0) + 1;
            Store.set('moodgarden', data);
            this.renderGarden();
            toast('接到 10 颗！花园多了一束萤火 ✨');
          }
        }
        const tw = 0.55 + 0.45 * Math.sin(m.ph * 2);
        ctx.save();
        ctx.globalAlpha = 0.5 + tw * 0.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = m.color;
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      this.drawCat(ctx, c.cat.x, c.cat.y);
      c.raf = requestAnimationFrame(step);
    };
    c.raf = requestAnimationFrame(step);
  },

  makeMote(canvas) {
    const colors = ['#ffffff', '#f4d28a', '#7ad7c2', '#9db8cf'];
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(0.25 + Math.random() * 0.55),
      r: 2 + Math.random() * 2.5,
      ph: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  },

  drawCat(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowBlur = 14;
    ctx.shadowColor = 'rgba(255,240,200,0.8)';
    ctx.fillStyle = '#fffdf5';
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-12, -6); ctx.lineTo(-16, -16); ctx.lineTo(-4, -12);
    ctx.moveTo(12, -6); ctx.lineTo(16, -16); ctx.lineTo(4, -12);
    ctx.fill();
    ctx.fillStyle = '#6b4a3a';
    ctx.beginPath();
    ctx.arc(-4, -1, 2, 0, Math.PI * 2);
    ctx.arc(4, -1, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c99a8a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 3, 3, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.restore();
  },

  resetCatcher() {
    const c = this.catch;
    c.running = false;
    c.score = 0;
    c.motes = [];
    if (c.raf) cancelAnimationFrame(c.raf);
    const canvas = $('#catchCanvas');
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    $('#catchStats').textContent = '0 颗';
    $('#catchStart').textContent = '开始接星星 ✨';
  },

  /* ================= 安心小岛 ================= */
  initCalm() {
    $('#calmReset').addEventListener('click', () => this.renderCalm());
    this.renderCalm();
  },

  renderCalm() {
    this.calmCollected = 0;
    this.calmItems = CALM_ITEMS.map((it) => ({ ...it }));
    const wrap = $('#calmItems');
    wrap.innerHTML = this.calmItems.map((it) =>
      `<button class="calm-item" data-id="${it.id}" style="left:${it.x}%;top:${it.y}%" type="button" aria-label="收好 ${it.emoji}">${it.emoji}</button>`
    ).join('');
    wrap.querySelectorAll('.calm-item').forEach((b) => b.addEventListener('click', (e) => this.collectCalm(b, e)));
    $('#calmMsg').textContent = '';
    $('#calmScene').classList.remove('glow');
    $('#calmStats').textContent = '';
  },

  collectCalm(btn, e) {
    if (btn.classList.contains('got')) return;
    const basket = $('#calmBasket').getBoundingClientRect();
    const r = btn.getBoundingClientRect();
    const dx = basket.left + basket.width / 2 - (r.left + r.width / 2);
    const dy = basket.top + basket.height / 2 - (r.top + r.height / 2);
    btn.classList.add('got');
    btn.style.setProperty('--fx', `${dx.toFixed(0)}px`);
    btn.style.setProperty('--fy', `${dy.toFixed(0)}px`);
    this.spawnSparkle(btn);
    this.calmCollected++;
    $('#calmStats').textContent = `已收好 ${this.calmCollected} / ${this.calmItems.length}`;
    setTimeout(() => btn.remove(), 900);
    if (this.calmCollected >= this.calmItems.length) {
      setTimeout(() => {
        $('#calmScene').classList.add('glow');
        $('#calmMsg').textContent = '小岛亮起来了。这里永远有一块地方，是为你留着的 🏝️';
        const data = this.gardenData();
        data.decor = (data.decor || 0) + 1;
        Store.set('moodgarden', data);
        this.renderGarden();
        this.celebrateAt($('#calmScene'));
      }, 500);
    }
  },

  /* ================= 4-7-8 呼吸 ================= */
  init478() {
    $('#b478Toggle').addEventListener('click', () => this.toggle478());
  },

  toggle478() {
    if (this.b478Running) {
      this.b478Running = false;
      cancelAnimationFrame(this.b478Raf);
      $('#b478Toggle').textContent = '继续';
      return;
    }
    if (!this.b478Start) {
      this.b478Round = 0;
      this.b478PhaseIdx = 0;
      this.b478PhaseT = 0;
      this.b478Start = performance.now();
    }
    this.b478Running = true;
    $('#b478Toggle').textContent = '暂停';
    $('#b478Done').classList.add('hidden');
    const phases = [
      { name: '吸气…', dur: 4000, from: 0.85, to: 1.55 },
      { name: '屏住…', dur: 7000, from: 1.55, to: 1.55 },
      { name: '呼气…', dur: 8000, from: 1.55, to: 0.85 },
      { name: '屏住…', dur: 7000, from: 0.85, to: 0.85 },
    ];
    const tick = (now) => {
      if (!this.b478Running) return;
      const elapsed = now - this.b478Start;
      const total = 26000;
      const cycle = Math.floor(elapsed / total);
      const t = elapsed % total;
      let acc = 0;
      let idx = 0;
      for (let i = 0; i < phases.length; i++) {
        if (t < acc + phases[i].dur) { idx = i; break; }
        acc += phases[i].dur;
      }
      const p = phases[idx];
      const pt = (t - acc) / p.dur;
      const eased = p.from === p.to ? p.from : p.from + (p.to - p.from) * (1 - Math.pow(1 - pt, 3));
      $('#b478Circle').style.transform = `scale(${eased.toFixed(3)})`;
      $('#b478Phase').textContent = p.name;
      $('#b478Count').textContent = `第 ${Math.min(cycle + 1, 4)} / 4 轮`;
      if (cycle >= 4) {
        this.b478Running = false;
        $('#b478Toggle').textContent = '再来一次';
        $('#b478Phase').textContent = '完成了';
        $('#b478Done').classList.remove('hidden');
        this.b478Start = null;
        return;
      }
      this.b478Raf = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(this.b478Raf);
    this.b478Raf = requestAnimationFrame(tick);
  },
};

document.addEventListener('DOMContentLoaded', () => Heal.init());
