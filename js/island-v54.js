'use strict';

/* ============ 📖 岛屿：资源与微光 ============ */
const LIGHT_ROTATION = [
  '你想到什么开心我们一起去试试吧',
  '你一定了吃了很多苦辛苦了',
  '不怕,你以后不是一个人',
  '你很好,我真的很喜欢你',
  '没关系,我会陪你一起面对的',
  '你的痛苦不是矫情,是心灵在发出求救信号',
  '不想说话的时候,我陪你看窗外的云',
  '我知道你已经拼尽全力',
  '想哭就哭吧,我准备了无限量纸巾',
  '今天没完成任务也没关系,你已经活着了呀',
  '我理解你的疲惫,那不是你的错',
  '你笑不出来的时候,我来当你的镜子',
  '我们可以一起种一盆向日葵,等它向阳生长',
  '如果需要,记得伸手求助,专业的帮助永远值得被信任',
  '黑暗会过去的,我陪你.等下一个天亮',
  '你生病的样子,依然值得被温柔对待',
  '我不要求你立刻好起来,慢慢来就好',
];

const LIGHT_THEMES = [
  { fx: 'bubbles', fb: '那就现在出发，去做一件让自己开心的小事吧。' },
  { fx: 'hand', fb: '辛苦了。先喝口热茶，再慢慢说。' },
  { fx: 'gather', fb: '看，光点都聚向你——你不是一个人。' },
  { fx: 'hearts', fb: '这份喜欢是真的，包括现在这一刻的你。' },
  { fx: 'pairs', fb: '我在你左边，慢慢走，一起面对。' },
  { fx: 'signal', fb: '这不是矫情，是心灵在认真保护你。' },
  { fx: 'cloud', fb: '那就一起看云吧，什么都不用说。' },
  { fx: 'check', fb: '你已经把力气用在了最重要的事：活着。' },
  { fx: 'tissue', fb: '纸巾管够，眼泪不丢人。' },
  { fx: 'check', fb: '活着，就已经完成了今天最重要的事。' },
  { fx: 'blanket', fb: '重担可以放下了，那不是你的错。' },
  { fx: 'mirror', fb: '镜子里的你，笑起来其实很好看。' },
  { fx: 'plant', fb: '它会长大的，就像你会好起来一样。' },
  { fx: 'hand', fb: '伸手不是软弱，是勇敢。我陪你去。' },
  { fx: 'dawn', fb: '黑暗会过去的，我们一起等天亮。' },
  { fx: 'blanket', fb: '生病的你，也值得被好好照顾。' },
  { fx: 'turtle', fb: '慢慢来，我在呢，不急。' },
];

/* 每种微光的氛围配置：粒子色、光晕、底色、点击爆裂符号 */
const LIGHT_FX_CFG = {
  bubbles: { c: ['255,240,205', '255,215,170', '255,255,255'], aura: 'rgba(255,216,150,0.30)', wash: 'rgba(255,214,150,0.18)', marks: ['✦', '◦', '✧'] },
  hand: { c: ['255,236,215', '255,206,178', '255,255,240'], aura: 'rgba(255,214,178,0.28)', wash: 'rgba(255,208,176,0.16)', marks: ['🫖', '✦', '✧'] },
  gather: { c: ['255,232,165', '255,255,224', '255,200,140'], aura: 'rgba(255,224,150,0.32)', wash: 'rgba(255,222,150,0.20)', marks: ['✦', '✧', '💛'] },
  hearts: { c: ['255,150,180', '255,190,160', '255,220,200'], aura: 'rgba(255,170,185,0.30)', wash: 'rgba(255,168,178,0.16)', marks: ['💗', '💛', '🩷'] },
  pairs: { c: ['255,205,175', '255,240,195', '255,235,225'], aura: 'rgba(255,216,178,0.28)', wash: 'rgba(255,214,178,0.15)', marks: ['💛', '✦', '🧡'] },
  signal: { c: ['255,226,165', '255,196,170', '255,250,225'], aura: 'rgba(255,218,160,0.30)', wash: 'rgba(255,216,160,0.17)', marks: ['✦', '✧', '💛'] },
  cloud: { c: ['255,250,238', '222,236,255', '255,236,222'], aura: 'rgba(232,240,255,0.26)', wash: 'rgba(226,236,255,0.14)', marks: ['☁️', '✦', '✧'] },
  check: { c: ['255,240,185', '255,218,155', '255,255,232'], aura: 'rgba(255,226,160,0.30)', wash: 'rgba(255,224,158,0.17)', marks: ['✦', '✓', '✧'] },
  tissue: { c: ['255,238,222', '255,205,185', '255,255,242'], aura: 'rgba(255,216,195,0.28)', wash: 'rgba(255,214,192,0.16)', marks: ['🤍', '✦', '✧'] },
  blanket: { c: ['255,228,195', '255,196,165', '255,246,228'], aura: 'rgba(255,212,172,0.30)', wash: 'rgba(255,208,168,0.17)', marks: ['🛋️', '✦', '💛'] },
  mirror: { c: ['255,242,215', '232,222,255', '255,222,205'], aura: 'rgba(236,226,255,0.28)', wash: 'rgba(234,224,255,0.15)', marks: ['✨', '🪞', '✧'] },
  plant: { c: ['205,236,180', '255,240,192', '255,255,232'], aura: 'rgba(205,232,178,0.30)', wash: 'rgba(200,228,172,0.16)', marks: ['🌱', '🌻', '✦'] },
  turtle: { c: ['255,238,195', '205,232,182', '255,255,228'], aura: 'rgba(240,226,170,0.28)', wash: 'rgba(238,224,168,0.15)', marks: ['🐢', '✦', '✧'] },
  dawn: { c: ['255,205,165', '255,242,205', '255,175,155'], aura: 'rgba(255,198,150,0.32)', wash: 'rgba(255,192,142,0.20)', marks: ['🌅', '✦', '✧'] },
  sun: { c: ['255,242,185', '255,222,145', '255,252,225'], aura: 'rgba(255,224,150,0.32)', wash: 'rgba(255,222,148,0.20)', marks: ['☀️', '✦', '✧'] },
  stars: { c: ['255,242,205', '232,226,255', '255,255,255'], aura: 'rgba(255,238,195,0.30)', wash: 'rgba(255,236,190,0.16)', marks: ['✦', '✧', '⋆'] },
};

const Island = {
  breathMiniOn: false,
  miniRaf: null,
  currentNameEmotion: null,

  init() {
    this.renderLight();
    this.renderHistory();
    $('#lightCard').addEventListener('click', () => this.tapLight());
    this.bindResources();
    this.renderSmallThings();
    this.renderNameEmotions();
    this.renderConnectPhrases();
  },

  /* ---------- 自愈小站互动 ---------- */
  bindResources() {
    $('#resBreath').querySelector('[data-action="breath"]')
      .addEventListener('click', () => this.toggleBreathMini());
    $('#miniBreathStop').addEventListener('click', () => this.stopBreathMini());
    $('#smallThings').addEventListener('input', (e) => {
      if (e.target.matches('input')) this.onSmallInput();
    });
    $('#nameLetGo').addEventListener('click', () => this.letEmotionGo());
    $('#connectPhrases').addEventListener('click', (e) => {
      const btn = e.target.closest('.connect-phrase');
      if (btn) this.copyPhrase(btn);
    });
  },

  /* --- 四七呼吸（迷你引导） --- */
  toggleBreathMini() {
    if (this.breathMiniOn) { this.stopBreathMini(); return; }
    const stage = $('#breathMiniStage');
    stage.classList.remove('hidden');
    $('#resBreath').querySelector('[data-action="breath"]').textContent = '暂停引导 ⏸';
    this.breathMiniOn = true;
    this.miniCycle = 0;
    this.miniStart = null;
    const circle = $('#miniBreathCircle');
    const text = $('#miniBreathText');
    const count = $('#miniBreathCount');
    const IN = 4000, HOLD = 4000, OUT = 7000, TOTAL = IN + HOLD + OUT;
    const tick = (now) => {
      if (!this.breathMiniOn) return;
      if (!this.miniStart) this.miniStart = now;
      const t = now - this.miniStart;
      const cycle = Math.floor(t / TOTAL);
      const phase = t % TOTAL;
      if (cycle >= 4) { this.stopBreathMini(true); return; }
      let scale = 1, label = '';
      if (phase < IN) {
        const p = phase / IN;
        scale = 0.75 + (1 - Math.pow(1 - p, 3)) * 0.8;
        label = '吸 气…';
      } else if (phase < IN + HOLD) {
        scale = 1.55;
        label = '屏 住…';
      } else {
        const p = (phase - IN - HOLD) / OUT;
        scale = 1.55 - (1 - Math.pow(1 - p, 2.6)) * 0.8;
        label = '呼 气…';
      }
      circle.style.transform = `scale(${scale})`;
      text.textContent = label;
      count.textContent = `第 ${Math.min(cycle + 1, 4)} / 4 轮`;
      this.miniRaf = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(this.miniRaf);
    this.miniRaf = requestAnimationFrame(tick);
  },

  stopBreathMini(completed = false) {
    this.breathMiniOn = false;
    cancelAnimationFrame(this.miniRaf);
    $('#breathMiniStage').classList.add('hidden');
    $('#resBreath').querySelector('[data-action="breath"]').textContent = '开始一次引导 🌬️';
    $('#miniBreathCircle').style.transform = 'scale(0.75)';
    if (completed) toast('四轮呼吸完成，你做得很好 🌬️');
  },

  /* --- 三件小事 --- */
  renderSmallThings() {
    const saved = Store.get('smallthings', {})[todayStr()] || [];
    const inputs = $('#smallThings').querySelectorAll('input');
    inputs.forEach((inp, i) => { if (saved[i]) inp.value = saved[i]; });
    this.onSmallInput(false);
  },

  onSmallInput(save = true) {
    const inputs = $('#smallThings').querySelectorAll('input');
    const values = Array.from(inputs).map((i) => i.value.trim());
    if (save) {
      const all = Store.get('smallthings', {});
      all[todayStr()] = values;
      Store.set('smallthings', all);
    }
    inputs.forEach((inp, i) => {
      inp.closest('.small-item').classList.toggle('done', !!inp.value.trim());
    });
    const filled = values.filter(Boolean).length;
    $('#smallProgress').querySelector('span').style.width = `${(filled / 3) * 100}%`;
    const note = $('#smallNote');
    const res = $('#resSleep');
    if (filled === 3) {
      res.classList.add('complete');
      note.textContent = '三件小事都记下了。今天，你有好好照顾自己 🫶';
    } else if (filled > 0) {
      res.classList.remove('complete');
      note.textContent = `已经写下 ${filled} 件，还差 ${3 - filled} 件。`;
    } else {
      res.classList.remove('complete');
      note.textContent = '哪怕「呼吸了一口新鲜空气」也算。';
    }
  },

  /* --- 给情绪命名 --- */
  renderNameEmotions() {
    const list = [
      { key: 'sad', emoji: '😢', name: '难过' },
      { key: 'anxiety', emoji: '😰', name: '焦虑' },
      { key: 'anger', emoji: '😡', name: '愤怒' },
      { key: 'fear', emoji: '😨', name: '害怕' },
      { key: 'tired', emoji: '😴', name: '疲惫' },
      { key: 'sad', emoji: '🕳️', name: '孤独' },
    ];
    const wrap = $('#nameEmotions');
    wrap.innerHTML = list.map((c) => {
      const em = EMOTIONS[c.key] || EMOTIONS.neutral;
      return `<button class="name-chip" data-key="${c.key}" data-name="${c.name}" style="--nc-color:${em.color};--nc-soft:${em.soft}" type="button">${c.emoji} ${c.name}</button>`;
    }).join('');
    wrap.addEventListener('click', (e) => {
      const chip = e.target.closest('.name-chip');
      if (!chip) return;
      $$('.name-chip', wrap).forEach((c) => c.classList.toggle('selected', c === chip));
      this.currentNameEmotion = chip.dataset.key;
      $('#nameStage').classList.remove('hidden');
      $('#nameLine').innerHTML = `我看到，你正在感到 <b>「${chip.dataset.name}」</b>。<br>它是来拜访你的情绪，不是你的名字。`;
    });
  },

  letEmotionGo() {
    const em = EMOTIONS[this.currentNameEmotion] || EMOTIONS.neutral;
    $('#nameStage').classList.add('hidden');
    $$('.name-chip', $('#nameEmotions')).forEach((c) => c.classList.remove('selected'));
    if (!prefersReducedMotion()) {
      const btn = $('#nameLetGo').getBoundingClientRect();
      const cx = btn.left + btn.width / 2;
      const cy = btn.top;
      const cloud = document.createElement('span');
      cloud.className = 'drift-cloud';
      cloud.textContent = '☁️';
      cloud.style.left = `${cx}px`;
      cloud.style.top = `${cy}px`;
      cloud.style.setProperty('--dx', `${Math.round(Math.random() * 120 - 60)}px`);
      cloud.style.setProperty('--dy', '-130px');
      document.body.appendChild(cloud);
      setTimeout(() => cloud.remove(), 2000);
    }
    toast(`${em.emoji} 被云带走了，而你留在这里`);
    this.currentNameEmotion = null;
  },

  /* --- 连接问候 --- */
  renderConnectPhrases() {
    const phrases = [
      '今天我需要一点陪伴，不用做什么，听我说说话就好。',
      '我最近有点累，想找个人聊聊，你方便吗？',
      '谢谢你一直在。今天也想跟你说一声，我在。',
    ];
    $('#connectPhrases').innerHTML = phrases
      .map((p) => `<button class="connect-phrase" type="button">💌 ${p}</button>`)
      .join('');
  },

  copyPhrase(btn) {
    const text = btn.textContent.replace(/^💌\s*/, '');
    const done = () => {
      if (this.copyHandled) return;
      this.copyHandled = true;
      $$('.connect-phrase', $('#connectPhrases')).forEach((b) => b.classList.remove('copied'));
      btn.classList.add('copied');
      this.heartBurst(btn);
      toast('已复制，去发给信任的人吧 💌');
    };
    this.copyHandled = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => {});
      setTimeout(() => { if (!this.copyHandled) this.fallbackCopy(text, done); }, 250);
    } else {
      this.fallbackCopy(text, done);
    }
  },

  fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      done();
    } catch (e) {
      toast('复制失败，长按文字手动复制吧');
    }
    ta.remove();
  },

  heartBurst(btn) {
    if (prefersReducedMotion()) return;
    const r = btn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    for (let i = 0; i < 5; i++) {
      const h = document.createElement('span');
      h.className = 'heart-burst';
      h.textContent = '💗';
      h.style.left = `${cx}px`;
      h.style.top = `${cy}px`;
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      const dist = 34 + Math.random() * 46;
      h.style.setProperty('--dx', `${Math.round(Math.cos(ang) * dist)}px`);
      h.style.setProperty('--dy', `${Math.round(Math.sin(ang) * dist)}px`);
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 1200);
    }
  },

  lightIndex() {
    const saved = Store.get('lightidx', {});
    return saved.date === todayStr() ? (saved.idx || 0) : 0;
  },

  setLightIndex(idx) {
    Store.set('lightidx', { date: todayStr(), idx });
  },

  /* 今日微光：用温暖的话语逐句点亮 */
  ensureTodayLight() {
    const list = Store.light.list();
    let existing = list.find((l) => l.date === todayStr());
    if (existing && typeof existing.text === 'string' && existing.text.indexOf('?') !== -1) {
      Store.set('light', list.filter((l) => l.id !== existing.id));
      existing = null;
    }
    if (existing) return { entry: existing, fresh: false };
    const idx = this.lightIndex();
    const hour = new Date().getHours();
    const morning = hour >= 5 && hour < 12;
    const entry = {
      id: uid(),
      date: todayStr(),
      ts: Date.now(),
      text: LIGHT_ROTATION[idx],
      basis: `第 ${idx + 1} 句`,
      morning,
    };
    Store.light.add(entry);
    return { entry, fresh: true };
  },

  renderLight() {
    const { entry, fresh } = this.ensureTodayLight();
    const idx = this.lightIndex();
    const el = $('#lightCard');
    el.classList.remove('hidden');
    el.classList.toggle('lit', !!entry.lit);
    el.classList.toggle('unlit', !entry.lit);
    el.innerHTML = `
      <div class="light-label">${entry.morning ? '☀️ 清晨微光' : '🌙 今日微光'}</div>
      <p class="light-text">${esc(LIGHT_ROTATION[idx])}</p>
      <p class="light-basis">第 ${idx + 1} 句 · 点击换下一句${entry.lit ? ' · 点一点卡片 ✨' : ''}</p>
      ${entry.lit ? '' : '<span class="light-hint">轻触点亮 ✨</span>'}`;
    return fresh;
  },

  tapLight() {
    if (!$('#lightCard').classList.contains('lit')) {
      this.ignite();
    } else {
      this.setLightIndex((this.lightIndex() + 1) % LIGHT_ROTATION.length);
      this.renderLight();
    }
    this.runLightFx();
  },

  runLightFx() {
    const idx = this.lightIndex();
    const theme = LIGHT_THEMES[idx];
    const card = $('#lightCard');
    this.stopLightAmbient();
    card.querySelectorAll('.light-fx, .light-scene').forEach((n) => n.remove());
    const oldFb = document.querySelector('.lf-feedback');
    if (oldFb) oldFb.remove();
    this.spawnFx(theme.fx, card);
    if (theme.fb) {
      const fb = document.createElement('span');
      fb.className = 'lf-feedback';
      fb.textContent = theme.fb;
      const r = card.getBoundingClientRect();
      fb.style.left = `${r.left + r.width / 2}px`;
      fb.style.top = `${r.bottom + 10}px`;
      document.body.appendChild(fb);
      setTimeout(() => fb.remove(), 5200);
    }
  },

  ensureFxDefs() {
    if (this.fxDefsReady) return;
    this.fxDefsReady = true;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    svg.innerHTML = `
      <defs>
        <linearGradient id="lg-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fff3cf"/><stop offset="1" stop-color="#f0c06a"/>
        </linearGradient>
        <linearGradient id="lg-peach" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffe3cb"/><stop offset="1" stop-color="#efa77c"/>
        </linearGradient>
        <linearGradient id="lg-cream" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#fcefd9"/>
        </linearGradient>
        <radialGradient id="rg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="rgba(255,244,210,0.9)"/><stop offset="1" stop-color="rgba(255,244,210,0)"/>
        </radialGradient>
      </defs>`;
    document.body.appendChild(svg);
  },

  fxSvg(inner, cls, style) {
    const s = document.createElement('span');
    s.className = `light-fx ${cls}`;
    s.innerHTML = `<svg viewBox="0 0 100 100" width="100%" height="100%">${inner}</svg>`;
    if (style) Object.assign(s.style, style);
    return s;
  },

  spawnFx(type, card) {
    this.ensureFxDefs();
    this.stopLightAmbient();
    card.querySelectorAll('.light-scene').forEach((n) => n.remove());
    const cfg = LIGHT_FX_CFG[type] || LIGHT_FX_CFG.stars;
    this.currentFxType = type;
    const scene = document.createElement('span');
    scene.className = 'light-scene';
    scene.dataset.fx = type;
    scene.style.setProperty('--aura', cfg.aura);
    scene.innerHTML = '<span class="ls-bg"></span><span class="ls-aura"></span><span class="ls-parallax"></span>';
    scene.querySelector('.ls-bg').style.background =
      `radial-gradient(130% 100% at 50% 108%, ${cfg.wash} 0%, rgba(0,0,0,0) 62%)`;
    const layer = scene.querySelector('.ls-parallax');
    const add = (el) => { layer.appendChild(el); setTimeout(() => el.remove(), 6500); return el; };
    const rand = (a, b) => a + Math.random() * (b - a);
    const r = card.getBoundingClientRect();
    const cx = () => rand(12, 68);
    const ORB = (g) => `<circle cx="30" cy="30" r="27" fill="url(#rg-glow)"/><circle cx="30" cy="30" r="15" fill="url(${g})"/><circle cx="23" cy="22" r="4.5" fill="#fff" opacity=".85"/>`;
    const HEART = (g) => `<path d="M12 21s-6.6-4.3-9.2-8.1C1 10.1 1.9 6.8 4.9 5.6c1.7-.7 3.6-.2 5.1 1.1L12 8.5l2-1.8c1.5-1.3 3.4-1.8 5.1-1.1 3 1.2 3.9 4.5 2.1 7.3C18.6 16.7 12 21 12 21z" fill="url(${g})"/>`;
    const SPARK = `<path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" fill="url(#lg-gold)"/>`;

    switch (type) {
      case 'bubbles': {
        const gs = ['url(#lg-gold)', 'url(#lg-peach)', 'url(#lg-cream)'];
        for (let i = 0; i < 9; i++) {
          add(this.fxSvg(ORB(gs[i % 3]), 'fx-orb', { left: cx() + '%', animationDelay: `${(i * 0.18).toFixed(2)}s` }));
        }
        break;
      }
      case 'hearts':
        this.fxHeartCanvas(scene);
        break;
      case 'stars':
        for (let i = 0; i < 9; i++) {
          add(this.fxSvg(SPARK, 'fx-star', { left: cx() + '%', animationDelay: `${(i * 0.14).toFixed(2)}s` }));
        }
        break;
      case 'gather': {
        for (let i = 0; i < 9; i++) {
          const s = add(this.fxSvg('<circle cx="50" cy="50" r="50" fill="url(#rg-glow)"/><circle cx="50" cy="50" r="5" fill="url(#lg-gold)"/>', 'fx-mote', {
            left: `${rand(8, Math.max(24, r.width - 44))}px`,
            top: `${rand(8, Math.max(20, r.height - 60))}px`,
            width: '18px',
            height: '18px',
          }));
          s.style.setProperty('--tx', `${r.width / 2 - parseFloat(s.style.left) - 24}px`);
          s.style.setProperty('--ty', `${r.height / 2 - parseFloat(s.style.top) - 24}px`);
        }
        add(this.fxSvg(HEART('url(#lg-gold)'), 'fx-gather-heart', { left: `${r.width / 2 - 27}px`, top: `${r.height / 2 - 27}px`, width: '54px', height: '54px' }));
        break;
      }
      case 'cloud': {
        add(this.fxSvg('<ellipse cx="45" cy="42" rx="28" ry="18" fill="url(#lg-cream)"/><ellipse cx="72" cy="36" rx="24" ry="15" fill="url(#lg-cream)"/><ellipse cx="58" cy="48" rx="30" ry="14" fill="#fff" opacity=".95"/>', 'fx-cloud', { top: '16%' }));
        break;
      }
      case 'sun':
        add(this.fxSvg('<circle cx="50" cy="50" r="47" fill="url(#rg-glow)"/><circle cx="50" cy="50" r="26" fill="url(#lg-gold)"/><circle cx="40" cy="40" r="7" fill="#fff" opacity=".85"/>', 'fx-sun'));
        break;
      case 'dawn': {
        const d = document.createElement('span');
        d.className = 'light-fx fx-dawn';
        layer.appendChild(d);
        setTimeout(() => d.remove(), 5400);
        add(this.fxSvg('<circle cx="50" cy="50" r="47" fill="url(#rg-glow)"/><circle cx="50" cy="50" r="26" fill="url(#lg-gold)"/><circle cx="40" cy="40" r="7" fill="#fff" opacity=".85"/>', 'fx-sun', { animationDelay: '1.3s' }));
        break;
      }
      case 'hand':
        add(this.fxSvg('<ellipse cx="50" cy="58" rx="26" ry="24" fill="url(#lg-peach)"/><ellipse cx="32" cy="32" rx="11" ry="14" fill="url(#lg-peach)"/><ellipse cx="50" cy="26" rx="11" ry="14" fill="url(#lg-peach)"/><ellipse cx="68" cy="32" rx="11" ry="14" fill="url(#lg-peach)"/><ellipse cx="50" cy="54" rx="9" ry="8" fill="#fff" opacity=".65"/>', 'fx-paw'));
        add(this.fxSvg('<path class="fx-steam" d="M30 26 q8 -12 0 -22 M50 26 q8 -12 0 -22" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".8"/><path d="M22 42 h40 v8 a20 16 0 0 1 -40 0 z" fill="url(#lg-cream)"/><path d="M22 46 h40" stroke="#e8c49a" stroke-width="2"/><path d="M62 46 h7 a7 7 0 0 1 0 12 h-7" fill="none" stroke="#e8c49a" stroke-width="4"/>', 'fx-tea', { left: '68%', bottom: '16%', width: '58px', height: '58px' }));
        break;
      case 'plant': {
        add(this.fxSvg('<path class="fx-stem" d="M50 118 C48 92 52 74 50 54" stroke="#9cbb8a" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="33" cy="94" rx="17" ry="7" fill="#a8c68f" transform="rotate(-26 33 94)"/><ellipse cx="67" cy="84" rx="17" ry="7" fill="#a8c68f" transform="rotate(26 67 84)"/><g class="fx-flower" transform="translate(50 50)"><ellipse cx="0" cy="-15" rx="8" ry="15" fill="url(#lg-gold)"/><ellipse cx="0" cy="-15" rx="8" ry="15" fill="url(#lg-gold)" transform="rotate(60)"/><ellipse cx="0" cy="-15" rx="8" ry="15" fill="url(#lg-gold)" transform="rotate(120)"/><ellipse cx="0" cy="-15" rx="8" ry="15" fill="url(#lg-gold)" transform="rotate(180)"/><ellipse cx="0" cy="-15" rx="8" ry="15" fill="url(#lg-gold)" transform="rotate(240)"/><ellipse cx="0" cy="-15" rx="8" ry="15" fill="url(#lg-gold)" transform="rotate(300)"/><circle cx="0" cy="0" r="9" fill="#a86b33"/></g>', 'fx-plant', { left: '44%', bottom: '8%', width: '78px', height: '96px' }));
        break;
      }
      case 'tissue':
        add(this.fxSvg('<rect x="24" y="52" width="52" height="34" rx="9" fill="url(#lg-peach)"/><path d="M36 52 q-3 -20 14 -22 q16 4 14 22" fill="url(#lg-cream)"/><rect x="24" y="50" width="52" height="8" rx="4" fill="#fff" opacity=".55"/>', 'fx-tissue'));
        for (let i = 0; i < 5; i++) {
          add(this.fxSvg(SPARK, 'fx-star', { left: cx() + '%', animationDelay: `${(0.6 + i * 0.16).toFixed(2)}s` }));
        }
        break;
      case 'mirror': {
        const s = add(this.fxSvg('<circle cx="50" cy="42" r="30" fill="#e8d9c0"/><circle cx="50" cy="42" r="24" fill="url(#rg-glow)"/><g class="fx-face" opacity="0"><circle cx="42" cy="40" r="3" fill="#6b4a3a"/><circle cx="58" cy="40" r="3" fill="#6b4a3a"/><path d="M40 50 q10 10 20 0" stroke="#6b4a3a" stroke-width="3" fill="none" stroke-linecap="round"/></g><path d="M45 70 l3 12 l10 -7 l-13 -5 z" fill="url(#lg-gold)"/>', 'fx-mirror'));
        setTimeout(() => {
          const face = s.querySelector('.fx-face');
          if (face) face.style.opacity = '1';
        }, 1300);
        break;
      }
      case 'blanket': {
        const d = document.createElement('span');
        d.className = 'light-fx fx-blanket';
        layer.appendChild(d);
        setTimeout(() => d.remove(), 5400);
        add(this.fxSvg(HEART('url(#lg-peach)'), 'fx-heart', { left: '46%', top: '38%', animationDelay: '0.5s' }));
        break;
      }
      case 'turtle':
        add(this.fxSvg('<ellipse cx="58" cy="44" rx="32" ry="21" fill="url(#lg-gold)"/><path d="M58 23 q-6 -12 4 -16 q12 -4 16 8" fill="url(#lg-cream)" opacity=".9"/><circle cx="94" cy="44" r="9" fill="url(#lg-cream)"/><circle cx="97" cy="41" r="1.8" fill="#6b4a3a"/><ellipse class="fx-leg" cx="36" cy="62" rx="8" ry="5" fill="url(#lg-peach)"/><ellipse class="fx-leg" cx="78" cy="62" rx="8" ry="5" fill="url(#lg-peach)"/><path d="M40 38 q10 6 20 0 M46 48 q8 5 16 0" stroke="#ffffff" stroke-width="3" fill="none" opacity=".55"/>', 'fx-turtle'));
        break;
      case 'check':
        add(this.fxSvg('<circle cx="50" cy="50" r="38" fill="none" stroke="url(#lg-gold)" stroke-width="3" opacity=".55"/><circle cx="50" cy="50" r="28" fill="url(#lg-cream)"/><path class="fx-check" d="M34 52 L46 64 L68 36" fill="none" stroke="#c99a4a" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>', 'fx-badge'));
        add(this.fxSvg(SPARK, 'fx-star', { left: '30%', top: '26%' }));
        add(this.fxSvg(SPARK, 'fx-star', { left: '60%', top: '24%' }));
        break;
      case 'signal': {
        ['', '0.45s', '0.9s'].forEach((dly, i) => {
          add(this.fxSvg('<circle cx="50" cy="50" r="26" fill="none" stroke="url(#lg-gold)" stroke-width="3"/>', 'fx-ring', { left: '42%', top: '30%', width: '52px', height: '52px', animationDelay: dly }));
        });
        add(this.fxSvg(HEART('url(#lg-peach)'), 'fx-heart', { left: '45%', top: '35%' }));
        break;
      }
      case 'pairs':
        add(this.fxSvg('<path class="fx-trail" d="M8 64 Q40 54 70 60 T116 56" fill="none" stroke="url(#lg-gold)" stroke-width="3" stroke-linecap="round" opacity=".6"/><g class="fx-fig a"><circle cx="34" cy="36" r="13" fill="url(#lg-gold)"/><ellipse cx="34" cy="66" rx="17" ry="12" fill="url(#lg-gold)" opacity=".9"/></g><g class="fx-fig b"><circle cx="86" cy="36" r="13" fill="url(#lg-peach)"/><ellipse cx="86" cy="66" rx="17" ry="12" fill="url(#lg-peach)" opacity=".9"/></g>', 'fx-pairs'));
        break;
      default:
        add(this.fxSvg(SPARK, 'fx-star', { left: '46%', top: '30%' }));
    }
    if (type !== 'stars') {
      for (let i = 0; i < 3; i++) {
        add(this.fxSvg(SPARK, 'fx-star', {
          left: `${rand(8, 76)}%`,
          top: `${rand(14, 48)}%`,
          width: '20px',
          height: '20px',
          animationDelay: `${(0.55 + i * 0.3).toFixed(2)}s`,
        }));
      }
    }
    card.appendChild(scene);
    this.bindLightPointer(card);
    this.startLightAmbient(scene, cfg);
  },

  /* 爱心粒子雨（借鉴 Love-Code 的爱心动画思路） */
  fxHeartCanvas(host) {
    const canvas = document.createElement('canvas');
    canvas.className = 'light-fx fx-canvas';
    canvas.width = Math.max(80, host.clientWidth);
    canvas.height = Math.max(80, host.clientHeight);
    host.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const colors = ['255,122,150', '255,168,132', '255,204,160', '255,220,200'];
    const hearts = Array.from({ length: 14 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 50,
      size: 10 + Math.random() * 15,
      speed: 0.45 + Math.random() * 1.0,
      sway: Math.random() * Math.PI * 2,
      alpha: 0.5 + Math.random() * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    const drawHeart = (x, y, s, a, c) => {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.shadowColor = `rgba(${c},0.9)`;
      ctx.shadowBlur = 16;
      ctx.fillStyle = `rgba(${c},1)`;
      ctx.beginPath();
      ctx.moveTo(x, y + s * 0.3);
      ctx.bezierCurveTo(x, y, x - s * 0.5, y - s * 0.3, x - s * 0.5, y - s * 0.1);
      ctx.bezierCurveTo(x - s * 0.5, y + s * 0.25, x, y + s * 0.55, x, y + s * 0.75);
      ctx.bezierCurveTo(x, y + s * 0.55, x + s * 0.5, y + s * 0.25, x + s * 0.5, y - s * 0.1);
      ctx.bezierCurveTo(x + s * 0.5, y - s * 0.3, x, y, x, y + s * 0.3);
      ctx.fill();
      // 高光小点
      ctx.beginPath();
      ctx.arc(x - s * 0.18, y - s * 0.02, s * 0.09, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.globalAlpha = a * 0.9;
      ctx.fill();
      ctx.restore();
    };
    let raf = null;
    const t0 = performance.now();
    const step = (t) => {
      if (!canvas.isConnected) return;
      const elapsed = (t - t0) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hearts.forEach((h) => {
        h.y -= h.speed;
        h.sway += 0.03;
        const x = h.x + Math.sin(h.sway) * 9;
        const fade = h.alpha * Math.min(1, Math.max(0, (canvas.height - h.y) / 70));
        drawHeart(x, h.y, h.size, fade, h.color);
        if (h.y < -30) {
          h.y = canvas.height + 12;
          h.x = Math.random() * canvas.width;
        }
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    setTimeout(() => { cancelAnimationFrame(raf); canvas.remove(); }, 6500);
  },

  /* 常驻环境粒子：微光漂浮 + 跟随光标/手指 */
  startLightAmbient(host, cfg) {
    if (prefersReducedMotion()) return;
    this.stopLightAmbient();
    let canvas = host.querySelector('.light-ambient');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'light-ambient';
      host.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;
    const resize = () => {
      W = host.clientWidth;
      H = host.clientHeight;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const n = Math.min(30, 12 + Math.round(W / 46));
    const motes = Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 1 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -(0.18 + Math.random() * 0.42),
      ph: Math.random() * Math.PI * 2,
      tw: 0.6 + Math.random() * 1.6,
      a: 0.28 + Math.random() * 0.5,
      c: cfg.c[Math.floor(Math.random() * cfg.c.length)],
    }));
    const step = (t) => {
      if (!host.isConnected) { this.lightAmbientRaf = null; return; }
      if (host.getClientRects().length === 0) {
        this.lightAmbientRaf = requestAnimationFrame(step);
        return;
      }
      ctx.clearRect(0, 0, W, H);
      const pt = this.lightPointer;
      motes.forEach((m) => {
        m.ph += 0.028;
        m.x += m.vx + Math.sin(m.ph * 1.3) * 0.22;
        m.y += m.vy;
        if (pt && t - pt.t < 900) {
          const dx = pt.x - m.x;
          const dy = pt.y - m.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 6400 && d2 > 1) {
            const d = Math.sqrt(d2);
            const pull = (1 - d / 80) * 0.9;
            m.x += (dx / d) * pull;
            m.y += (dy / d) * pull;
          }
        }
        if (m.y < -10) { m.y = H + 8; m.x = Math.random() * W; }
        if (m.x < -10) m.x = W + 8;
        if (m.x > W + 10) m.x = -8;
        const tw = 0.55 + 0.45 * Math.sin(t / 1000 * m.tw + m.ph);
        const alpha = m.a * tw;
        if (alpha < 0.03) return;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${m.c},${alpha.toFixed(3)})`;
        ctx.shadowColor = `rgba(${m.c},0.85)`;
        ctx.shadowBlur = 7;
        ctx.fill();
      });
      if (pt && t - pt.t < 260 && Math.random() < 0.55) {
        ctx.beginPath();
        ctx.arc(pt.x + (Math.random() - 0.5) * 14, pt.y + (Math.random() - 0.5) * 14, 1 + Math.random() * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,250,225,${(0.5 + Math.random() * 0.4).toFixed(3)})`;
        ctx.shadowColor = 'rgba(255,240,200,0.95)';
        ctx.shadowBlur = 9;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      this.lightAmbientRaf = requestAnimationFrame(step);
    };
    this.lightAmbientRaf = requestAnimationFrame(step);
  },

  stopLightAmbient() {
    if (this.lightAmbientRaf) {
      cancelAnimationFrame(this.lightAmbientRaf);
      this.lightAmbientRaf = null;
    }
  },

  /* 光标/手指：视差 + 点击爆裂 */
  bindLightPointer(card) {
    if (this.lightPointerBound === card) return;
    this.lightPointerBound = card;
    const onMove = (e) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      this.lightPointer = { x, y, t: performance.now() };
      card.style.setProperty('--mx', (x / r.width).toFixed(3));
      card.style.setProperty('--my', (y / r.height).toFixed(3));
    };
    const onLeave = () => { this.lightPointer = null; };
    const onDown = (e) => {
      const r = card.getBoundingClientRect();
      this.burstLight(e.clientX - r.left, e.clientY - r.top);
    };
    card.addEventListener('pointermove', onMove, { passive: true });
    card.addEventListener('pointerleave', onLeave);
    card.addEventListener('pointerdown', onDown);
  },

  burstLight(x, y) {
    const scene = document.querySelector('#lightCard .light-scene');
    if (!scene || prefersReducedMotion()) return;
    const cfg = LIGHT_FX_CFG[this.currentFxType] || LIGHT_FX_CFG.stars;
    const marks = cfg.marks || ['✦', '✧', '✦'];
    const r = scene.getBoundingClientRect();
    const bx = r.left + x;
    const by = r.top + y;
    for (let i = 0; i < 12; i++) {
      const s = document.createElement('span');
      s.className = 'ls-burst';
      s.textContent = marks[i % marks.length];
      s.style.left = `${bx}px`;
      s.style.top = `${by}px`;
      const ang = Math.random() * Math.PI * 2;
      const dist = 26 + Math.random() * 54;
      s.style.setProperty('--dx', `${Math.round(Math.cos(ang) * dist)}px`);
      s.style.setProperty('--dy', `${Math.round(Math.sin(ang) * dist) - 16}px`);
      s.style.setProperty('--rot', `${Math.round(Math.random() * 200 - 100)}deg`);
      s.style.setProperty('--c', cfg.c[i % cfg.c.length]);
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1200);
    }
  },


  ignite() {
    const el = $('#lightCard');
    if (el.classList.contains('lit')) return;
    el.classList.add('lit');
    el.classList.remove('unlit');
    const hint = el.querySelector('.light-hint');
    if (hint) hint.remove();

    const list = Store.light.list();
    const item = list.find((l) => l.date === todayStr());
    if (item) {
      item.lit = true;
      Store.set('light', list);
    }

    if (!prefersReducedMotion()) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const marks = ['✦', '✧', '✦', '✧', '✦'];
      for (let i = 0; i < 7; i++) {
        const sp = document.createElement('span');
        sp.className = 'spark';
        sp.textContent = marks[i % marks.length];
        sp.style.left = `${cx}px`;
        sp.style.top = `${cy}px`;
        const ang = Math.random() * Math.PI * 2;
        const dist = 50 + Math.random() * 90;
        sp.style.setProperty('--dx', `${Math.round(Math.cos(ang) * dist)}px`);
        sp.style.setProperty('--dy', `${Math.round(Math.sin(ang) * dist)}px`);
        sp.style.setProperty('--rot', `${Math.round(Math.random() * 160 - 80)}deg`);
        sp.style.setProperty('--dur', `${(0.8 + Math.random() * 0.6).toFixed(2)}s`);
        document.body.appendChild(sp);
        setTimeout(() => sp.remove(), 1600);
      }
    }
    toast('今日微光已点亮 ✨');
  },

  renderHistory() {
    const el = $('#lightHistory');
    const list = Store.light.list().slice().reverse().slice(1, 15);
    if (!list.length) {
      el.innerHTML = '<div class="empty-state">明天早上，迪迪的心屿会依据你的记录，为你准备第一束微光。</div>';
      return;
    }
    el.innerHTML = list.map((l) => `
      <div class="light-item">
        <span class="li-emoji">${l.morning ? '☀️' : '🌙'}</span>
        <span class="li-text">${esc(l.text)}</span>
        <span class="li-date">${l.date.slice(5)}</span>
      </div>`).join('');
  },

  checkMorning() {
    const hour = new Date().getHours();
    if (hour < 5 || hour >= 12) return;
    const fresh = this.renderLight();
    if (fresh) {
      toast('☀️ 早上好，迪迪的心屿为你带来了今日微光');
    }
  },
};
