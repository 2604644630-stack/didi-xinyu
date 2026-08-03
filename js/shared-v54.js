'use strict';

/* ---------- 工具函数 ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const pad2 = (n) => String(n).padStart(2, '0');

const dateKeyOf = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const todayStr = () => dateKeyOf(new Date());

const daysAgoStr = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateKeyOf(d);
};

const fmtTime = (ts) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

const esc = (s) =>
  String(s == null ? '' : s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

/* 全站关闭“减少动态效果”降级：所有特效始终完整运行（按需求调整） */
const prefersReducedMotion = () => false;

let toastTimer = null;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* 无障碍：Toast 播报给屏幕阅读器 */
document.addEventListener('DOMContentLoaded', () => {
  const t = $('#toast');
  if (t) t.setAttribute('aria-live', 'polite');
});

/* ---------- 情绪定义 ---------- */
const EMOTIONS = {
  calm:      { name: '平静', emoji: '😌', color: '#8dbcd6', soft: 'rgba(141,188,214,0.18)', val: 5.4 },
  joy:       { name: '喜悦', emoji: '😊', color: '#ecc66a', soft: 'rgba(236,198,106,0.20)', val: 8.0 },
  neutral:   { name: '中性', emoji: '😐', color: '#b0b8a6', soft: 'rgba(176,184,166,0.18)', val: 5.0 },
  gratitude: { name: '感激', emoji: '🥹', color: '#92c58e', soft: 'rgba(146,197,142,0.20)', val: 8.2 },
  anxiety:   { name: '焦虑', emoji: '😰', color: '#e6a36e', soft: 'rgba(230,163,110,0.18)', val: 2.8 },
  sad:       { name: '低落', emoji: '😢', color: '#7da7d4', soft: 'rgba(125,167,212,0.18)', val: 2.2 },
  anger:     { name: '愤怒', emoji: '😡', color: '#dd7d6d', soft: 'rgba(221,125,109,0.18)', val: 2.6 },
  fear:      { name: '害怕', emoji: '😨', color: '#a696c0', soft: 'rgba(166,150,192,0.20)', val: 2.4 },
  tired:     { name: '疲惫', emoji: '😴', color: '#a2947d', soft: 'rgba(162,148,125,0.20)', val: 3.4 },
};

const EMOTION_KEYS = Object.keys(EMOTIONS);

/* ---------- 高风险关键词（自伤 / 自杀） ---------- */
const RISK_KEYWORDS = [
  '自杀', '自残', '不想活', '不想活了', '结束生命', '结束自己',
  '伤害自己', '了结', '跳楼', '割腕', '安眠药', '活不下去',
  '想死', '去死', '轻生', '自尽', '了断',
  '跳桥', '跳江', '跳河', '上吊', '割手', '割脉', '吞药', '吃安眠药',
  '遗书', '一了百了', '撑不下去', '坚持不住', '活腻了', '不想存在',
  '了结自己', '结束这一切', '解脱了', '消失算了', '没有活下去的意义',
];

const isRisky = (text) =>
  RISK_KEYWORDS.some((k) => (text || '').includes(k));

/* ---------- 情绪关键词识别（用于共感墙聚类） ---------- */
const EMOTION_KEYWORD_MAP = [
  { key: 'fear', words: ['害怕', '恐惧', '心惊', '恐慌'] },
  { key: 'anxiety', words: ['焦虑', '紧张', '担心', '不安', '慌', '压力', '烦心', '焦躁', '着急'] },
  { key: 'sad', words: ['低落', '难过', '伤心', '想哭', '孤独', '沮丧', 'emo', '失望', '悲伤', '委屈', '郁闷'] },
  { key: 'joy', words: ['开心', '高兴', '快乐', '喜悦', '棒', '太好了', '幸福', '愉快', '满足', '兴奋'] },
  { key: 'anger', words: ['愤怒', '生气', '烦', '暴躁', '火大', '恼火', '气死'] },
  { key: 'tired', words: ['累', '疲惫', '困', '没力气', '精疲力尽', '透支'] },
  { key: 'calm', words: ['平静', '安稳', '踏实', '放松', '舒服', '从容'] },
  { key: 'gratitude', words: ['感激', '感恩', '谢谢', '温暖', '感动', '幸运'] },
  { key: 'neutral', words: ['还行', '一般', '平常', '普通'] },
];

function detectEmotion(text) {
  for (const group of EMOTION_KEYWORD_MAP) {
    if (group.words.some((w) => text.includes(w))) return group.key;
  }
  return null;
}
