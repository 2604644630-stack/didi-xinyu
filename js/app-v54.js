'use strict';

/* ============ 应用主入口 ============ */
const App = {
  views: ['now', 'ground', 'mirror', 'garden', 'island'],

  init() {
    $('#todayLabel').textContent = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
    });
    this.setGreeting();

    this.bindTabs();
    this.bindSidebar();
    this.bindCrisis();

    this.bindRipple();
    this.bindTilt();

    Emotion.init();
    Grounding.init();
    Mirror.init();
    Garden.init();
    Island.init();
    document.addEventListener('splash-dismissed', () => Welcome.start());

    // 路由
    const initial = (location.hash || '#now').replace('#', '');
    this.show(this.views.includes(initial) ? initial : 'now', true);

    window.addEventListener('hashchange', () => {
      const name = (location.hash || '').replace('#', '');
      if (this.views.includes(name)) this.show(name, true);
    });

    Island.checkMorning();
  },

  setGreeting() {
    const h = new Date().getHours();
    let text = '';
    if (h >= 5 && h < 11) text = '早上好 ☀️ 新的一天，慢慢来';
    else if (h >= 11 && h < 14) text = '中午好 🍃 记得给自己留一点空隙';
    else if (h >= 14 && h < 18) text = '下午好 🌿 累了就停下来喘口气';
    else if (h >= 18 && h < 23) text = '晚上好 🌙 今天辛苦了';
    else text = '夜深了 🌙 该好好休息了';
    $('#todayGreeting').textContent = text;
  },

  bindTabs() {
    $$('.tab').forEach((tab) => {
      tab.addEventListener('click', () => this.show(tab.dataset.view));
    });
  },

  bindSidebar() {
    $$('.side-tab').forEach((tab) => {
      tab.addEventListener('click', () => this.show(tab.dataset.view));
    });
  },

  bindRipple() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn || prefersReducedMotion()) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const span = document.createElement('span');
      span.className = 'ripple';
      span.style.width = span.style.height = `${size}px`;
      span.style.left = `${e.clientX - rect.left - size / 2}px`;
      span.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(span);
      setTimeout(() => span.remove(), 650);
    });
  },

  bindTilt() {
    if (!window.matchMedia('(hover: hover) and (min-width: 960px)').matches) return;
    document.addEventListener('pointermove', (e) => {
      const card = e.target instanceof Element ? e.target.closest('.card') : null;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform =
        `perspective(900px) rotateY(${(px * 4).toFixed(2)}deg) rotateX(${(-py * 4).toFixed(2)}deg)`;
    });
    document.addEventListener('pointerout', (e) => {
      const card = e.target instanceof Element ? e.target.closest('.card') : null;
      if (card) card.style.transform = '';
    });
  },

  bindCrisis() {
    const open = () => {
      $('#careTitle').textContent = '🆘 你不需要独自承受';
      $('#careText').textContent = '如果此刻你感到难以承受，请立即联系专业支持：';
      $('#crisisOverlay').classList.remove('hidden');
    };
    $('#crisisBtn').addEventListener('click', open);
    $('#sideCrisis').addEventListener('click', open);
    $('#islandCrisisBtn').addEventListener('click', open);
    $('#crisisClose').addEventListener('click', () => {
      $('#crisisOverlay').classList.add('hidden');
    });
    $('#crisisOverlay').addEventListener('click', (e) => {
      if (e.target === $('#crisisOverlay')) $('#crisisOverlay').classList.add('hidden');
    });
  },

  show(name, fromHash = false) {
    if (!this.views.includes(name)) return;
    this.views.forEach((v) => {
      $(`#view-${v}`).classList.toggle('active', v === name);
    });
    $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.view === name));
    $$('.side-tab').forEach((t) => t.classList.toggle('active', t.dataset.view === name));
    if (!fromHash) history.replaceState(null, '', `#${name}`);

    const tab = $(`.tab[data-view="${name}"]`);
    if (tab) {
      tab.classList.remove('pulse');
      void tab.offsetWidth;
      tab.classList.add('pulse');
    }

    if (name === 'now') Emotion.refresh();
    if (name === 'garden') Garden.renderCluster();
    if (name === 'island') Island.renderLight();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
