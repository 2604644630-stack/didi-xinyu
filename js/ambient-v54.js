'use strict';

/* =========================================================
 * 内容页背景：伪 3D 星河（借鉴 Mineradio 的背景星河粒子）
 * 星星带景深（近大远小）、缓慢靠近、指针视差、闪烁；
 * 流星照常划过。纯 Canvas 实现，保持轻量。
 * ========================================================= */
const Ambient = (() => {
  const canvas = document.getElementById('particles');
  if (!canvas) return {};

  const ctx = canvas.getContext('2d');
  const TAU = Math.PI * 2;
  const COLORS = ['#ffffff', '#f4d28a', '#7ad7c2', '#9db8cf'];
  const COMET_COLORS = ['#ffffff', '#f4d28a', '#7ad7c2'];
  let W = 0;
  let H = 0;
  let dpr = 1;
  let stars = [];
  let comets = [];
  let raf = null;
  let nextCometAt = 0;
  const pointer = { x: 0, y: 0, active: false };

  const starCount = () => Math.min(360, Math.max(140, Math.floor(W / 3.4)));

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeStar(anywhere) {
    const z = 0.18 + Math.random() * 0.82;
    return {
      x: (Math.random() * 2 - 1) * (0.42 + 0.5 * (1 - z)),
      y: (Math.random() * 2 - 1) * (0.3 + 0.36 * (1 - z)),
      z,
      vx: (Math.random() - 0.5) * 0.0009,
      vy: (Math.random() - 0.5) * 0.0007,
      vz: 0.07 + Math.random() * 0.14,
      tw: Math.random() * TAU,
      twSpeed: 0.8 + Math.random() * 2.2,
      alpha: 0.3 + Math.random() * 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  function project(s) {
    const z = s.z;
    const px = pointer.active ? pointer.x : 0;
    const py = pointer.active ? pointer.y : 0;
    const x = W / 2 + ((s.x / z) * W * 0.28) + px * (1 - z) * 46;
    const y = H / 2 + ((s.y / z) * H * 0.28) + py * (1 - z) * 34;
    const size = Math.max(0.35, (0.45 + (1 - z) * 2.1) * 0.75);
    return { x, y, size };
  }

  function drawStar(s, t) {
    const tw = 0.55 + 0.45 * Math.sin((t / 1000) * s.twSpeed + s.tw);
    const a = s.alpha * tw;
    const p = project(s);
    if (p.x < -24 || p.x > W + 24 || p.y < -24 || p.y > H + 24) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.shadowBlur = p.size * 4.5;
    ctx.shadowColor = s.color;
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function makeComet() {
    const dir = Math.random() < 0.5 ? -1 : 1;
    return {
      x: Math.random() * W,
      y: -30 - Math.random() * 140,
      vx: dir * (0.5 + Math.random() * 0.8),
      vy: 1.6 + Math.random() * 2.0,
      len: 70 + Math.random() * 130,
      life: 0,
      max: 230 + Math.random() * 120,
      color: COMET_COLORS[Math.floor(Math.random() * COMET_COLORS.length)],
    };
  }

  function drawComet(c) {
    const t = c.life / c.max;
    const tailX = c.x + c.vx * c.life;
    const tailY = c.y + c.vy * c.life;
    const headX = tailX + c.vx * c.len * 0.5;
    const headY = tailY + c.vy * c.len * 0.5;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - t * t) * 0.8;
    const g = ctx.createLinearGradient(tailX, tailY, headX, headY);
    g.addColorStop(0, c.color + '00');
    g.addColorStop(1, c.color);
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.2;
    ctx.shadowBlur = 16;
    ctx.shadowColor = c.color;
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(headX, headY);
    ctx.stroke();
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(headX, headY, 1.6, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawHalo() {
    if (!pointer.active) return;
    const r = 150;
    const g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, r);
    g.addColorStop(0, 'rgba(190, 225, 255, 0.08)');
    g.addColorStop(0.6, 'rgba(190, 225, 255, 0.03)');
    g.addColorStop(1, 'rgba(190, 225, 255, 0)');
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, r, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function step(now) {
    ctx.clearRect(0, 0, W, H);
    drawHalo();

    const dt = Math.min(0.05, (now - (step.last || now)) / 1000 || 0.016);
    step.last = now;

    stars.forEach((s) => {
      s.z -= s.vz * dt;
      s.x += s.vx * dt * 8;
      s.y += s.vy * dt * 8;
      s.tw += s.twSpeed * dt;
      if (s.z < 0.18) {
        Object.assign(s, makeStar(true));
        s.z = 0.95 + Math.random() * 0.05;
      }
      drawStar(s, now);
    });

    if (now > nextCometAt) {
      if (comets.length < 8) comets.push(makeComet());
      nextCometAt = now + 450 + Math.random() * 900;
    }
    comets = comets.filter((c) => c.life < c.max);
    comets.forEach((c) => {
      c.life += 1;
      drawComet(c);
    });

    raf = requestAnimationFrame(step);
  }

  function start() {
    resize();
    stars = Array.from({ length: starCount() }, () => makeStar(true));
    comets = [];
    nextCometAt = performance.now() + 700;
    step.last = performance.now();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(step);
  }

  function stop() {
    cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, W, H);
  }

  window.addEventListener('resize', () => resize());
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / W - 0.5) * 2;
    pointer.y = (e.clientY / H - 0.5) * 2;
    pointer.active = true;
  }, { passive: true });
  window.addEventListener('pointerleave', () => {
    pointer.active = false;
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  document.addEventListener('DOMContentLoaded', start);
  return { start, stop };
})();
