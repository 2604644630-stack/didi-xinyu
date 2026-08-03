'use strict';

/* ============ 🧘 着陆：自适应安抚舱 ============ */
const GROUND_SENSES = {
  5: { icon: '👀', color: '#93c2e2', soft: '#e6f1fa', name: '看', examples: ['窗帘', '水杯', '你的手', '窗外的一棵树'] },
  4: { icon: '✋', color: '#eeb594', soft: '#fcefe7', name: '触', examples: ['衣料的触感', '桌面的凉意', '吹过的风', '沙发的柔软'] },
  3: { icon: '👂', color: '#a99ac9', soft: '#efebf7', name: '听', examples: ['空调的嗡嗡声', '窗外的车流', '自己的呼吸', '键盘的轻响'] },
  2: { icon: '👃', color: '#92c58e', soft: '#eaf5e8', name: '闻', examples: ['空气的味道', '衣领上的气息', '一杯茶', '雨后的泥土'] },
  1: { icon: '👅', color: '#ecc66a', soft: '#fcf4dd', name: '尝', examples: ['一口温水', '茶的余味', '一颗薄荷糖', '呼吸里的凉意'] },
};

const SCAN_PROMPTS = {
  head: '轻轻感受头皮的重量与温度，不评价，只是注意到。',
  shoulder: '让肩膀松一点，感受它们慢慢沉下去。',
  chest: '把手放在胸口，感受心跳的节奏，不快不慢。',
  belly: '吸气时肚子轻轻鼓起，呼气时放下。',
  palm: '感受手心此刻的温度，凉或暖都可以。',
  sole: '感受脚底与地面接触的地方，稳稳的。',
};
const SOUND_CHOICES = ['空调声', '窗外风声', '自己的呼吸', '键盘声', '鸟叫', '远处车流', '心跳声', '脚步声'];
const TOUCH_CHOICES = ['衣料的触感', '桌面的凉意', '沙发的柔软', '自己的手温', '吹过的风', '水杯的温度'];

const Grounding = {
  urgency: 3,
  mode: 'mild',        // mild | quick | breath
  steps: [],
  stepIdx: 0,
  prepareTimer: null,
  breathActive: false,
  breathTimer: null,
  soundOn: false,
  audioCtx: null,
  recheckBound: false,
  afterUrgency: null,
  scanDone: {},
  sensesDone: [],
  boxRunning: false,
  boxTimer: null,
  boxRound: 0,
  boxPhase: 0,

  init() {
    const slider = $('#urgency');
    slider.addEventListener('input', () => {
      this.urgency = Number(slider.value);
      this.updateHint();
    });
    this.updateHint();

    $('#startGround').addEventListener('click', () => this.start());
    $('#groundNext').addEventListener('click', () => this.nextStep());
    $('#groundAgain').addEventListener('click', () => this.resetToIntro());
    $('#prepareSkip').addEventListener('click', () => this.skipPrepare());
    $('#breathSkip').addEventListener('click', () => this.endBreath());
    $('#breathSound').addEventListener('click', () => this.toggleSound());
    this.initToolbox();
  },

  /* ---------- 着陆工具箱 ---------- */
  initToolbox() {
    $$('.toolbox-tab').forEach((tab) => tab.addEventListener('click', () => {
      $$('.toolbox-tab').forEach((t) => t.classList.toggle('active', t === tab));
      $$('.tool-stage').forEach((s) => s.classList.toggle('active', s.id === 'tool' + tab.dataset.tool.slice(0, 1).toUpperCase() + tab.dataset.tool.slice(1)));
    }));
    this.initScan();
    this.renderSenses();
    this.renderBreathQuick();
    this.updateStats();
  },

  updateStats() {
    const week = Store.ground.list().filter((g) => Date.now() - g.ts < 7 * 86400000).length;
    $('#groundStats').textContent = week ? `本周已着陆 ${week} 次 🌿` : '本周还没有着陆记录';
  },

  /* 身体扫描 */
  initScan() {
    const spots = $$('.scan-spot');
    spots.forEach((sp) => sp.addEventListener('click', () => {
      const part = sp.dataset.part;
      this.scanDone[part] = true;
      sp.classList.add('done');
      $('#scanPrompt').textContent = SCAN_PROMPTS[part];
      const doneCount = Object.keys(this.scanDone).length;
      $('#scanProgress').textContent = `已完成 ${doneCount} / ${spots.length} 个部位`;
      if (doneCount >= spots.length) {
        $('#scanPrompt').textContent = '身体扫描完成，你回到身体里了 🫀';
        $('#scanReset').classList.remove('hidden');
      }
    }));
    $('#scanReset').addEventListener('click', () => {
      this.scanDone = {};
      spots.forEach((s) => s.classList.remove('done'));
      $('#scanPrompt').textContent = '点一点身体上的光点，把注意力带回来。';
      $('#scanProgress').textContent = '';
      $('#scanReset').classList.add('hidden');
    });
    $('#scanProgress').textContent = '';
  },

  /* 三听一触 */
  renderSenses() {
    const wrap = $('#toolSenses');
    const slots = [
      { key: 's1', label: '第 1 个声音', choices: SOUND_CHOICES },
      { key: 's2', label: '第 2 个声音', choices: SOUND_CHOICES },
      { key: 's3', label: '第 3 个声音', choices: SOUND_CHOICES },
      { key: 't1', label: '一种触感', choices: TOUCH_CHOICES },
    ];
    wrap.innerHTML = slots.map((s) => `
      <div class="sense-slot" data-key="${s.key}">
        <button class="sense-slot-btn" type="button">👆 ${s.label}</button>
        <div class="sense-options hidden">${s.choices.map((c) => `<button class="sense-opt" type="button">${c}</button>`).join('')}</div>
      </div>`).join('');
    wrap.addEventListener('click', (e) => {
      const opt = e.target.closest('.sense-opt');
      const slotBtn = e.target.closest('.sense-slot-btn');
      if (opt) {
        const slot = opt.closest('.sense-slot');
        const key = slot.dataset.key;
        if (this.sensesDone.includes(key)) return;
        this.sensesDone.push(key);
        slot.classList.add('done');
        slot.querySelector('.sense-options').classList.add('hidden');
        slot.querySelector('.sense-slot-btn').textContent = `✓ ${opt.textContent}`;
        this.checkSensesDone();
        return;
      }
      if (slotBtn) {
        const slot = slotBtn.closest('.sense-slot');
        if (slot.classList.contains('done')) return;
        slot.querySelector('.sense-options').classList.toggle('hidden');
      }
    });
  },

  checkSensesDone() {
    if (this.sensesDone.length < 4) return;
    const done = document.createElement('p');
    done.className = 'sense-complete';
    done.textContent = '三听一触完成，你被这里稳稳接住了 🌿';
    $('#toolSenses').appendChild(done);
  },

  /* 快速呼吸：复用全屏呼吸泡泡，两轮 */
  renderBreathQuick() {
    $('#quickBreath').addEventListener('click', () => {
      this.startBreath(2);
      toast('跟着呼吸，两轮就好 🫧');
    });
  },

  updateHint() {
    const u = this.urgency;
    const el = $('#urgencyPill');
    if (u <= 4) {
      this.mode = 'mild';
      el.className = 'urgency-pill mode-mild';
      el.innerHTML = `<span class="pill-emoji">🌱</span>轻度（${u}分）· 完整五步，慢慢来`;
    } else if (u <= 7) {
      this.mode = 'quick';
      el.className = 'urgency-pill mode-quick';
      el.innerHTML = `<span class="pill-emoji">🍃</span>中度（${u}分）· 3-2-1 快速版，降低负担`;
    } else {
      this.mode = 'breath';
      el.className = 'urgency-pill mode-breath';
      el.innerHTML = `<span class="pill-emoji">🫧</span>高度（${u}分）· 全屏呼吸泡泡，只跟随呼吸`;
    }
  },

  stepsFor() {
    if (this.mode === 'mild') {
      return [
        { num: 5, sense: 5, text: '环顾四周，说出 5 样你能看到的东西' },
        { num: 4, sense: 4, text: '感受 4 种你触摸得到的触感' },
        { num: 3, sense: 3, text: '仔细听，说出 3 种你此刻能听到的声音' },
        { num: 2, sense: 2, text: '说出 2 种你闻得到的气味' },
        { num: 1, sense: 1, text: '说出 1 种你尝得到的味道' },
      ];
    }
    if (this.mode === 'quick') {
      return [
        { num: 3, sense: 5, text: '环顾四周，说出 3 样你能看到的东西' },
        { num: 2, sense: 3, text: '仔细听，说出 2 种你听到的声音' },
        { num: 1, sense: 4, text: '感受 1 种你触碰得到的触感' },
      ];
    }
    return [];
  },

  start() {
    this.updateHint();
    if (this.mode === 'breath') {
      this.startBreath();
      return;
    }
    this.steps = this.stepsFor();
    this.stepIdx = 0;
    $('#groundDone').classList.add('hidden');
    $('#groundStartArea').classList.add('hidden');
    this.showPrepare();
  },

  showPrepare() {
    const prepare = $('#groundPrepare');
    const stepWrap = $('#groundStepWrap');
    prepare.classList.remove('hidden');
    stepWrap.classList.add('hidden');
    let n = 3;
    const text = $('#prepareText');
    text.textContent = String(n);
    clearInterval(this.prepareTimer);
    this.prepareTimer = setInterval(() => {
      n--;
      if (n <= 0) {
        clearInterval(this.prepareTimer);
        this.startSteps();
        return;
      }
      text.textContent = String(n);
    }, 950);
  },

  skipPrepare() {
    clearInterval(this.prepareTimer);
    this.startSteps();
  },

  startSteps() {
    $('#groundPrepare').classList.add('hidden');
    $('#groundStepWrap').classList.remove('hidden');
    $('#groundDots').innerHTML = this.steps
      .map((s, i) => `<span class="ground-dot">${i + 1}</span>`)
      .join('');
    this.renderStep();
  },

  renderStep() {
    const step = this.steps[this.stepIdx];
    const sense = GROUND_SENSES[step.sense] || { icon: '🌿', color: 'var(--sage)', soft: 'var(--sage-soft)', name: '', examples: [] };
    $('#groundNum').textContent = step.num;
    $('#groundTask').textContent = step.text;
    $('#groundSense').textContent = sense.icon;
    $('#groundCabin').style.setProperty('--sense-color', sense.color);
    $('#groundCabin').style.setProperty('--sense-soft', sense.soft);
    $('#groundExamples').innerHTML = sense.examples
      .map((ex) => `<span class="ground-example">比如：${ex}</span>`)
      .join('');
    $('#groundCounter').textContent = `已完成 ${this.stepIdx} / ${this.steps.length}`;
    $('#groundProgressBar').style.width =
      ((this.stepIdx / this.steps.length) * 100) + '%';
    $$('.ground-dot', $('#groundDots')).forEach((d, i) => {
      d.classList.toggle('done', i < this.stepIdx);
      d.classList.toggle('active', i === this.stepIdx);
    });
    const wrap = $('#groundStep');
    wrap.classList.remove('swap');
    void wrap.offsetWidth;
    wrap.classList.add('swap');
    const prog = $('.ground-progress');
    prog.classList.remove('pulse');
    void prog.offsetWidth;
    prog.classList.add('pulse');
    setTimeout(() => prog.classList.remove('pulse'), 550);
  },

  nextStep() {
    this.stepIdx++;
    if (this.stepIdx >= this.steps.length) {
      this.complete();
    } else {
      this.renderStep();
    }
  },

  complete() {
    $('#groundStartArea').classList.add('hidden');
    $('#groundPrepare').classList.add('hidden');
    $('#groundStepWrap').classList.add('hidden');
    $('#groundDone').classList.remove('hidden');
    const encouragements = {
      mild: {
        title: '你稳稳地走完了五步。',
        text: '现在的你，已经比一分钟前更靠近当下。把这种感觉记住，它是你的锚。',
      },
      quick: {
        title: '即使很快，你也把自己带回来了。',
        text: '深呼吸，你在。哪怕只有一瞬的安定，也值得被珍惜。',
      },
    };
    const msg = encouragements[this.mode] || encouragements.mild;
    $('#groundDoneTitle').textContent = msg.title;
    $('#groundDoneText').textContent = msg.text;

    const doneChips = this.steps.map((s) => {
      const sense = GROUND_SENSES[s.sense] || { icon: '🌿', name: '' };
      return `<span class="done-chip"><span class="done-x">✓</span>${sense.icon} ${sense.name}</span>`;
    }).join('');
    $('#groundDoneList').innerHTML = doneChips;

    $('#groundRecheck').classList.remove('hidden');
    $('#recheckSlider').value = this.urgency;
    $('#recheckNote').textContent = '';
    this.afterUrgency = null;
    if (!this.recheckBound) {
      this.recheckBound = true;
      $('#recheckSlider').addEventListener('input', () => this.onRecheck());
    }

    Store.ground.add({
      id: uid(),
      date: todayStr(),
      ts: Date.now(),
      urgency: this.urgency,
      mode: this.mode,
      senses: this.steps.map((s) => s.sense),
    });
    this.updateStats();
  },

  resetToIntro() {
    clearInterval(this.prepareTimer);
    $('#groundDone').classList.add('hidden');
    $('#groundPrepare').classList.add('hidden');
    $('#groundStepWrap').classList.add('hidden');
    $('#groundStartArea').classList.remove('hidden');
    $('#groundProgressBar').style.width = '0%';
  },

  onRecheck() {
    const v = Number($('#recheckSlider').value);
    this.afterUrgency = v;
    const note = $('#recheckNote');
    if (v < this.urgency) {
      note.textContent = `紧急程度从 ${this.urgency} 降到了 ${v}。你看，它真的在流动——你把它带了回来。`;
    } else if (v === this.urgency) {
      note.textContent = `还是 ${v} 分，没关系。着陆不是比赛，再陪它一会儿就好。`;
    } else {
      note.textContent = `现在感到 ${v} 分。允许它这样，情绪没有标准答案，你已经做得很好了。`;
    }
    const list = Store.ground.list();
    const rec = list[list.length - 1];
    if (rec) {
      rec.after = v;
      Store.set('ground', list);
    }
  },

  /* ---- 呼吸泡泡全屏沉浸 ---- */
  startBreath(maxRounds = 4) {
    this.breathActive = true;
    this.breathMax = maxRounds;
    this.breathCycle = 0;
    this.breathStart = null;
    $('#breathOverlay').classList.remove('hidden');
    this.soundOn = false;
    this.updateSoundBtn();
    this.spawnBubbles();
    const circle = $('#breathCircle');
    const text = $('#breathText');
    const countEl = $('#breathCount');
    const IN = 4000, OUT = 6000;

    const tick = (now) => {
      if (!this.breathActive) return;
      if (!this.breathStart) this.breathStart = now;
      const t = now - this.breathStart;
      const total = IN + OUT;
      const phase = t % total;
      const cycle = Math.floor(t / total);

      if (phase < IN) {
        const p = phase / IN;
        const eased = 1 - Math.pow(1 - p, 3);
        circle.style.transform = `scale(${0.85 + eased * 0.75})`;
        text.textContent = '吸 气…';
        if (this.soundOn) this.breathTone(cycle, true, p);
      } else {
        const p = (phase - IN) / OUT;
        const eased = 1 - Math.pow(1 - p, 2.6);
        circle.style.transform = `scale(${1.6 - eased * 0.75})`;
        text.textContent = '呼 气…';
        if (this.soundOn) this.breathTone(cycle, false, p);
      }
      countEl.textContent = `${Math.min(cycle + 1, this.breathMax)} / ${this.breathMax}`;
      const overlay = $('#breathOverlay');
      overlay.classList.remove('tone1', 'tone2', 'tone3');
      if (cycle % 4 !== 0) overlay.classList.add('tone' + (cycle % 4));
      if (cycle >= this.breathMax) {
        this.endBreath(true);
        return;
      }
      this.breathTimer = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(this.breathTimer);
    this.breathTimer = requestAnimationFrame(tick);
  },

  endBreath(completed = false) {
    this.breathActive = false;
    cancelAnimationFrame(this.breathTimer);
    this.stopTone();
    $('#breathOverlay').classList.add('hidden');
    $('#breathOverlay').classList.remove('tone1', 'tone2', 'tone3');
    $('#breathBubbles').innerHTML = '';
    $('#breathCircle').style.transform = 'scale(0.85)';
    Store.ground.add({
      id: uid(),
      date: todayStr(),
      ts: Date.now(),
      urgency: this.urgency,
      mode: 'breath',
      completed,
    });
    this.updateStats();
    $('#groundDone').classList.remove('hidden');
    $('#groundDoneTitle').textContent = completed ? '你刚刚做到了最难的事。' : '练习暂时结束，随时可以再来。';
    $('#groundDoneText').textContent = completed
      ? '在风暴里陪住自己，是很了不起的能力。此刻的你，已经回到这里。'
      : '哪怕只跟着呼吸了一小会儿，也是在照顾自己。';
    $('#groundDoneList').innerHTML = '';
    $('#groundRecheck').classList.add('hidden');
    $('#groundStartArea').classList.add('hidden');
    $('#groundPrepare').classList.add('hidden');
    $('#groundStepWrap').classList.add('hidden');
  },

  spawnBubbles() {
    const wrap = $('#breathBubbles');
    wrap.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const b = document.createElement('span');
      b.className = 'breath-bubble';
      const size = 6 + Math.random() * 14;
      b.style.width = b.style.height = `${size}px`;
      b.style.left = `${5 + Math.random() * 90}%`;
      b.style.animationDuration = `${6 + Math.random() * 5}s`;
      b.style.animationDelay = `${(Math.random() * 6).toFixed(2)}s`;
      b.style.setProperty('--sway', `${Math.round(Math.random() * 40 - 20)}px`);
      wrap.appendChild(b);
    }
  },

  toggleSound() {
    this.soundOn = !this.soundOn;
    this.updateSoundBtn();
    if (this.soundOn) {
      this.audioCtx = this.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      this.audioCtx.resume && this.audioCtx.resume();
    } else {
      this.stopTone();
    }
  },

  updateSoundBtn() {
    $('#breathSound').textContent = this.soundOn ? '🔊 引导音' : '🔇 引导音';
  },

  breathTone(cycle, inhale, progress) {
    if (!this.audioCtx || this.audioCtx.state !== 'running') return;
    // 仅在阶段开头重建振荡器
    if (this.toneKey === `${cycle}-${inhale}`) return;
    this.stopTone();
    this.toneKey = `${cycle}-${inhale}`;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = inhale ? 220 : 196;
    const target = inhale ? 0.055 : 0.03;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(target, ctx.currentTime + (inhale ? 3.4 : 5.2));
    gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + (inhale ? 4 : 6));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + (inhale ? 4 : 6));
    this.toneOsc = osc;
    this.toneGain = gain;
  },

  stopTone() {
    if (this.toneOsc) {
      try { this.toneOsc.stop(); } catch (e) { /* ignore */ }
      try { this.toneOsc.disconnect(); } catch (e) { /* ignore */ }
    }
    if (this.toneGain) {
      try { this.toneGain.disconnect(); } catch (e) { /* ignore */ }
    }
    this.toneOsc = null;
    this.toneGain = null;
    this.toneKey = null;
  },
};
