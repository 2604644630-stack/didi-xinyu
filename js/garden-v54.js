'use strict';

/* ============ 🌊 共感：匿名互助花园 ============ */
const Garden = {
  chosenEmotion: '',

  /* 模拟“同城/同时段”的基线人数，让聚类看起来真实且稳定 */
  baseSim() {
    const seed = ['sad', 'anxiety', 'joy', 'calm', 'anger', 'tired', 'fear', 'gratitude', 'neutral'];
    const map = {};
    seed.forEach((k, i) => {
      // 以日期做哈希，让数字每天略有浮动
      const h = [...todayStr()].reduce((a, c) => a + c.charCodeAt(0), 0);
      map[k] = 3 + ((h + i * 7) % 9);
    });
    return map;
  },

  init() {
    this.renderEmotionChips();
    this.bindPost();
    this.renderWall();
    this.renderCluster();

    $('#gardenText').addEventListener('input', (e) => {
      $('#gardenCount').textContent = `${e.target.value.length}/60`;
    });
  },

  renderEmotionChips() {
    const wrap = $('#gardenEmotions');
    wrap.innerHTML = '<button class="garden-emotion selected" data-key="" type="button">自动识别</button>' +
      EMOTION_KEYS.map((k) =>
        `<button class="garden-emotion" data-key="${k}" type="button" style="--ge-color:${EMOTIONS[k].color}">${EMOTIONS[k].emoji} ${EMOTIONS[k].name}</button>`
      ).join('');
    wrap.addEventListener('click', (e) => {
      const chip = e.target.closest('.garden-emotion');
      if (!chip) return;
      this.chosenEmotion = chip.dataset.key;
      $$('.garden-emotion', wrap).forEach((c) => c.classList.toggle('selected', c === chip));
    });
  },

  bindPost() {
    $('#postGarden').addEventListener('click', () => this.post());
  },

  post() {
    const text = $('#gardenText').value.trim();
    if (!text) {
      toast('留下一句话吧，哪怕只有一个词');
      return;
    }
    if (isRisky(text)) {
      this.showCare();
      return;
    }
    const emotion = this.chosenEmotion || detectEmotion(text) || 'neutral';
    Store.garden.add({
      id: uid(),
      ts: Date.now(),
      date: todayStr(),
      text,
      emotion,
      hugs: 0,
    });
    $('#gardenText').value = '';
    $('#gardenCount').textContent = '0/60';
    toast('你的蒲公英飘出去了 🌼');
    this.renderCluster();
    this.renderWall(true);
    this.burstSeeds();
  },

  burstSeeds() {
    if (prefersReducedMotion()) return;
    const first = $('#gardenWall .garden-item');
    if (!first) return;
    const r = first.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const marks = ['✿', '❀', '﹡', '˖', '✧'];
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('span');
      s.className = 'seed';
      s.textContent = marks[i % marks.length];
      s.style.left = `${cx}px`;
      s.style.top = `${cy}px`;
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.9;
      const dist = 40 + Math.random() * 85;
      s.style.setProperty('--dx', `${Math.round(Math.cos(ang) * dist)}px`);
      s.style.setProperty('--dy', `${Math.round(Math.sin(ang) * dist)}px`);
      s.style.setProperty('--rot', `${Math.round(Math.random() * 140 - 70)}deg`);
      s.style.setProperty('--dur', `${(1.1 + Math.random() * 0.8).toFixed(2)}s`);
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 2100);
    }
  },

  showCare() {
    $('#careTitle').textContent = '🛟 停一下，我们很担心你';
    $('#careText').textContent = '你刚才的文字里有让人担心的信号。这条留言没有被发布，但你的感受值得被认真对待。请联系专业支持：';
    $('#crisisOverlay').classList.remove('hidden');
  },

  todayCounts() {
    const counts = {};
    Store.garden.list().forEach((g) => {
      if (g.date === todayStr()) counts[g.emotion] = (counts[g.emotion] || 0) + 1;
    });
    return counts;
  },

  syncCount(emotion) {
    const base = this.baseSim();
    return (base[emotion] || 3) + (this.todayCounts()[emotion] || 0);
  },

  renderCluster() {
    const el = $('#clusterBar');
    const counts = this.todayCounts();
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) {
      el.classList.add('hidden');
      el.innerHTML = '';
      return;
    }
    const ranked = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k, n]) => {
        const em = EMOTIONS[k];
        const totalN = this.syncCount(k);
        return `<span class="cluster-chip">${em.emoji} ${em.name} · 此刻约 ${totalN} 人同频</span>`;
      })
      .join('');
    el.innerHTML = `<h4>🌸 情绪聚类</h4><p class="mini-note">今天本地共感花园有 ${total} 条留言，系统将相近的感受聚在一起：</p><div class="cluster-chips">${ranked}</div>`;
    el.classList.remove('hidden');
  },

  renderWall(pop = false) {
    const el = $('#gardenWall');
    const list = Store.garden.list().slice().reverse();
    if (!list.length) {
      el.innerHTML = '<div class="empty-state">花园还空着。写下此刻的感受，第一朵蒲公英会从这里飘起。</div>';
      return;
    }
    el.innerHTML = list.map((g, idx) => {
      const em = EMOTIONS[g.emotion] || EMOTIONS.neutral;
      const syncN = this.syncCount(g.emotion);
      return `<div class="garden-item ${pop && idx === 0 ? 'pop' : ''}" data-id="${g.id}" style="--gi-color:${em.color};--gi-delay:${(idx % 5) * 0.5}s">
        <p class="gi-text">${esc(g.text)}</p>
        <div class="gi-meta">
          <span>${fmtTime(g.ts)}</span>
          <span class="gi-sync">此刻约 ${syncN} 人与你同频</span>
          <button class="gi-hug" data-hug="${g.id}" type="button">🤍 拍拍 ${g.hugs || 0}</button>
        </div>
      </div>`;
    }).join('');
    el.addEventListener('click', (e) => {
      const hug = e.target.closest('[data-hug]');
      if (!hug) return;
      Store.garden.hug(hug.dataset.hug);
      const btn = hug;
      const n = (parseInt(btn.textContent.match(/\d+/)?.[0] || '0', 10) || 0) + 1;
      btn.textContent = `🤍 拍拍 ${n}`;
      btn.style.transform = 'scale(1.25)';
      setTimeout(() => { btn.style.transform = ''; }, 180);
      toast('你轻轻拍了拍 ta 🌿');
    });
  },
};
