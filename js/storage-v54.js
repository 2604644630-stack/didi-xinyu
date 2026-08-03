'use strict';

/* ---------- LocalStorage 封装 ---------- */
const Store = {
  PREFIX: 'xy_',

  key(name) {
    return this.PREFIX + name;
  },

  get(name, fallback) {
    try {
      const raw = localStorage.getItem(this.key(name));
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  },

  set(name, value) {
    try {
      localStorage.setItem(this.key(name), JSON.stringify(value));
      return true;
    } catch (e) {
      // 存储满时，先裁剪最旧记录再重试一次
      this.trim(name);
      try {
        localStorage.setItem(this.key(name), JSON.stringify(value));
        return true;
      } catch (e2) {
        toast('存储空间不足，部分历史记录未能保存');
        return false;
      }
    }
  },

  trim(name, cap = 60) {
    const arr = this.get(name, []);
    if (arr.length > cap) {
      const kept = arr.slice(arr.length - cap);
      try {
        localStorage.setItem(this.key(name), JSON.stringify(kept));
      } catch (e) { /* ignore */ }
    }
  },

  /* ---- 情绪记录 ---- */
  emotions: {
    list() { return Store.get('emotions', []); },
    add(entry) {
      const list = Store.emotions.list();
      list.push(entry);
      if (list.length > 300) list.splice(0, list.length - 300);
      return Store.set('emotions', list);
    },
  },

  /* ---- 着陆记录 ---- */
  ground: {
    list() { return Store.get('ground', []); },
    add(entry) {
      const list = Store.ground.list();
      list.push(entry);
      if (list.length > 120) list.splice(0, list.length - 120);
      return Store.set('ground', list);
    },
  },

  /* ---- 心镜日记 ---- */
  diary: {
    list() { return Store.get('diary', []); },
    add(entry) {
      const list = Store.diary.list();
      list.push(entry);
      if (list.length > 30) list.splice(0, list.length - 30); // 图片占空间，限制条数
      return Store.set('diary', list);
    },
    remove(id) {
      const list = Store.diary.list().filter((e) => e.id !== id);
      Store.set('diary', list);
    },
  },

  /* ---- 共感留言 ---- */
  garden: {
    list() { return Store.get('garden', []); },
    add(entry) {
      const list = Store.garden.list();
      list.push(entry);
      if (list.length > 200) list.splice(0, list.length - 200);
      Store.set('garden', list);
    },
    hug(id) {
      const list = Store.garden.list();
      const item = list.find((e) => e.id === id);
      if (item) item.hugs = (item.hugs || 0) + 1;
      Store.set('garden', list);
    },
  },

  /* ---- 明日微光 ---- */
  light: {
    list() { return Store.get('light', []); },
    add(entry) {
      const list = Store.light.list();
      list.push(entry);
      if (list.length > 30) list.splice(0, list.length - 30);
      Store.set('light', list);
    },
  },

  /* ---- PHQ-9 抑郁自评 ---- */
  phq: {
    list() { return Store.get('phq', []); },
    add(entry) {
      const list = Store.phq.list();
      list.push(entry);
      if (list.length > 40) list.splice(0, list.length - 40);
      Store.set('phq', list);
    },
  },

  /* ---- 安全计划 ---- */
  safetyplan: {
    get() { return Store.get('safetyplan', null); },
    set(plan) { return Store.set('safetyplan', plan); },
  },

  /* ---- 行为激活：小事行动 ---- */
  ba: {
    list() { return Store.get('ba', []); },
    add(entry) {
      const list = Store.ba.list();
      list.push(entry);
      if (list.length > 120) list.splice(0, list.length - 120);
      Store.set('ba', list);
    },
    update(id, patch) {
      const list = Store.ba.list();
      const item = list.find((e) => e.id === id);
      if (item) Object.assign(item, patch);
      Store.set('ba', list);
    },
  },

  /* ---- 思维记录 / 自我关怀信件 ---- */
  thoughts: {
    list() { return Store.get('thoughts', []); },
    add(entry) {
      const list = Store.thoughts.list();
      list.push(entry);
      if (list.length > 80) list.splice(0, list.length - 80);
      Store.set('thoughts', list);
    },
    remove(id) {
      Store.set('thoughts', Store.thoughts.list().filter((e) => e.id !== id));
    },
  },

  /* ---- 睡眠记录 ---- */
  sleep: {
    list() { return Store.get('sleep', []); },
    add(entry) {
      const list = Store.sleep.list();
      list.push(entry);
      if (list.length > 120) list.splice(0, list.length - 120);
      Store.set('sleep', list);
    },
  },

  /* ---- 高风险关怀标记（用于次日回访） ---- */
  careflags: {
    list() { return Store.get('careflags', []); },
    add() {
      const list = Store.careflags.list();
      if (!list.includes(todayStr())) list.push(todayStr());
      if (list.length > 14) list.splice(0, list.length - 14);
      Store.set('careflags', list);
    },
    hasRecent(days = 2) {
      const list = Store.careflags.list();
      const now = Date.now();
      return list.some((d) => {
        const t = new Date(d + 'T00:00:00').getTime();
        return Number.isFinite(t) && now - t < days * 86400000;
      });
    },
  },

  /* ---- 提醒设置 ---- */
  remind: {
    get() { return Store.get('remind', { enabled: false, hour: 21 }); },
    set(v) { return Store.set('remind', v); },
  },
};
