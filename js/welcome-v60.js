'use strict';

/* =========================================================
 * 进入后的温暖引导（光遇风 + Awesome-Love-Code Web/030）
 * 星域背景与粒子文字引擎改编自 sun0225SUN/Awesome-Love-Code
 * （MIT License），并保留小猫「发财」的互动。
 * ========================================================= */

/* 粒子文字排版：始终保持一行显示，字体尽量大，装不下时按比例缩小 */
function welcomeTextLayout(ctx, text, W, H) {
  const fontFor = (size) =>
    `700 ${size}px "PingFang SC","Microsoft YaHei","SimHei","Avenir","Helvetica Neue",sans-serif`;
  const str = String(text);
  let size = H * 0.72;
  ctx.font = fontFor(size);
  while (size > 12 && ctx.measureText(str).width > W - 24) {
    size -= 1;
    ctx.font = fontFor(size);
  }
  return { size, lines: [str] };
}

const Welcome = {
  started: false,
  done: false,
  raf: null,          // 文字粒子动画
  rafUniverse: null,  // 星域动画
  fadeTimer: null,
  catBusy: false,
  phase: 'idle',      // idle | dissolve | assemble | scatter
  textIndex: 0,
  advancing: false,
  particles: [],

  LINES: [
    '你说很久没见过星星了。',
    '可那些你以为消失的光，一直都在。',
    '它们走了几亿光年才到这里，',
    '不是为了证明自己够亮，',
    '只是为了告诉你——',
    '再微弱的光，也能穿越整个宇宙，',
    '抵达另一双眼睛。',
    '有些星星在被人看见之前就已经死了。',
    '可它们的光还在赶路，',
    '还在温暖素未谋面的人。',
    '所以，如果你觉得自己已经熄灭，',
    '请相信——你的光，也在路上，',
    '正在未来的某个夜晚，等着照亮你自己。',
    '看不见星星的时候，',
    '星星也在看着你。',
    '它们见过无数个这样的夜晚，',
    '见过无数个低着头的人，',
    '然后沉默地，固执地，',
    '为他们亮了一整夜。',
    '如果以后还是会害怕夜晚太长，',
    '就让我做你的星光。',
    '不需要很亮，够你看清脚下就好。',
    '不需要很远，够陪你走到黎明就好。',
    '一步，再一步，',
    '我们会走完这个你曾以为走不出去的，',
    '漫漫黑夜。',
  ],

  start() {
    if (this.started) return;
    this.started = true;
    const el = $('#welcome');
    if (!el) return;
    el.classList.remove('hidden');
    $('#welcomeSkip').addEventListener('click', (e) => {
      e.stopPropagation();
      this.finish();
    });
    $('#welcomeEnter').addEventListener('click', (e) => {
      e.stopPropagation();
      this.finish();
    });
    this.bindCat();
    this.playMusic();
    this.startUniverse();
    this.startParticleText();
  },

  /* ---------- 背景音乐（030 同款音轨） ---------- */
  playMusic() {
    const audio = $('#welcomeMusic');
    const btn = $('#welcomeMusicBtn');
    if (!audio) return;
    const setIcon = () => {
      if (btn) btn.textContent = audio.paused ? '🔇' : '🔊';
    };
    audio.volume = 0.8;
    audio.loop = true;
    const p = audio.play();
    if (p) p.catch(() => setIcon());
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (audio.paused) {
          audio.play().catch(() => {});
        } else {
          audio.pause();
        }
        setIcon();
      });
      audio.addEventListener('play', setIcon);
      audio.addEventListener('pause', setIcon);
    }
    setIcon();
  },

  /* ---------- 小猫「发财」互动 ---------- */
  bindCat() {
    const cat = document.querySelector('.welcome-cat');
    if (!cat) return;
    cat.addEventListener('click', (e) => {
      e.stopPropagation();
      this.catReact(cat, e);
    });
    window.addEventListener('pointermove', (e) => {
      if (this.done || !document.getElementById('welcome')) return;
      this.catLook(cat, e);
    }, { passive: true });
    this.startIdle();
  },

  catLook(cat, e) {
    const r = cat.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.42;
    const dx = (e.clientX - cx) / r.width;
    const dy = (e.clientY - cy) / r.height;
    const lx = Math.max(-3.4, Math.min(3.4, dx * 5));
    const ly = Math.max(-2.6, Math.min(2.6, dy * 4));
    cat.querySelectorAll('.cat-pupils').forEach((p) => {
      p.style.transform = `translate(${lx.toFixed(2)}px, ${ly.toFixed(2)}px)`;
    });
  },

  startIdle() {
    const loop = () => {
      if (this.done || !document.getElementById('welcome')) return;
      const wait = 5000 + Math.random() * 6000;
      this.idleTimer = setTimeout(() => {
        if (this.done) return;
        const cat = document.querySelector('.welcome-cat');
        if (!cat) return;
        const roll = Math.random();
        if (roll < 0.38) {
          cat.classList.add('cat-wave-up');
          this.burstAt(cat, ['✦', '✧', '✦'], 4, 'left');
          setTimeout(() => cat.classList.remove('cat-wave-up'), 1300);
        } else if (roll < 0.7) {
          this.catSpeak(cat, ['喵～', '我在陪你呢', '慢慢来，不急', '今天也辛苦啦'][Math.floor(Math.random() * 4)]);
        } else {
          const r = cat.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height * 0.42;
          const ang = Math.random() * Math.PI * 2;
          cat.querySelectorAll('.cat-pupils').forEach((p) => {
            p.style.transform = `translate(${(Math.cos(ang) * 2.4).toFixed(2)}px, ${(Math.sin(ang) * 1.8).toFixed(2)}px)`;
          });
          setTimeout(() => {
            cat.querySelectorAll('.cat-pupils').forEach((p) => { p.style.transform = 'translate(0,0)'; });
          }, 1400);
        }
        loop();
      }, wait);
    };
    loop();
  },

  catSpeak(cat, text) {
    const r = cat.getBoundingClientRect();
    const bubble = document.createElement('div');
    bubble.className = 'cat-speech';
    bubble.textContent = text;
    bubble.style.left = `${r.left + r.width / 2}px`;
    bubble.style.top = `${r.top - 18}px`;
    document.body.appendChild(bubble);
    setTimeout(() => bubble.remove(), 1700);
  },

  burstAt(cat, marks, count, side) {
    const r = cat.getBoundingClientRect();
    const cx = r.left + (side === 'left' ? r.width * 0.3 : r.width * 0.7);
    const cy = r.top + r.height * (side === 'left' ? 0.55 : 0.45);
    for (let i = 0; i < count; i++) {
      const h = document.createElement('span');
      h.className = 'cat-heart';
      h.textContent = marks[i % marks.length];
      h.style.left = `${cx}px`;
      h.style.top = `${cy}px`;
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const dist = 30 + Math.random() * 46;
      h.style.setProperty('--dx', `${Math.round(Math.cos(ang) * dist)}px`);
      h.style.setProperty('--dy', `${Math.round(Math.sin(ang) * dist)}px`);
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 1500);
    }
  },

  catReact(cat, e) {
    if (this.catBusy) return;
    this.catBusy = true;
    const r = cat.getBoundingClientRect();
    const relY = (e.clientY - r.top) / r.height;
    const relX = (e.clientX - r.left) / r.width;
    if (relY < 0.42) {
      // 摸头
      cat.classList.add('cat-happy');
      this.burstAt(cat, ['💛', '✨', '💛'], 5, 'top');
      this.catSpeak(cat, '喵～ 摸摸头好舒服');
    } else if (relY < 0.78) {
      // 摸肚子
      cat.classList.add('cat-purr');
      this.burstAt(cat, ['🫧', '💛', '🫧'], 4, 'top');
      this.catSpeak(cat, '咕噜咕噜…');
    } else {
      // 击掌
      cat.classList.add('cat-wave-up');
      this.burstAt(cat, ['✦', '✧', '💛'], 6, 'left');
      this.catSpeak(relX < 0.5 ? '喵！击掌！' : '发财击掌成功！');
    }
    setTimeout(() => {
      cat.classList.remove('cat-happy');
      cat.classList.remove('cat-purr');
      cat.classList.remove('cat-wave-up');
      this.catBusy = false;
    }, 1300);
  },

  /* ---------- 星域背景（030 universe.js 改编，暖色星尘） ---------- */
  startUniverse() {
    const canvas = $('#welcomeUniverse');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let stars = [];
    let first = true;

    const rand = (min, max) => Math.random() * (max - min) + min;
    const chance = (percents) => Math.floor(Math.random() * 1000) + 1 < percents * 10;

    const makeStar = () => {
      const s = {
        reset() {
          this.giant = chance(3);
          this.comet = this.giant || first ? false : chance(10);
          this.x = rand(0, width - 10);
          this.y = rand(0, height);
          this.r = rand(1.1, 2.6);
          this.dx = rand(0.05, 0.3) + (this.comet ? 1 : 0) * rand(2.5, 6) + 0.1;
          this.dy = -rand(0.05, 0.3) - (this.comet ? 1 : 0) * rand(2.5, 6);
          this.tw = rand(0.6, 2.0);
          this.twPh = rand(0, Math.PI * 2);
          this.fadingOut = null;
          this.fadingIn = true;
          this.opacity = 0;
          this.opacityTresh = rand(0.2, 1 - (this.comet ? 1 : 0) * 0.4);
          this.do = rand(0.0005, 0.002) + (this.comet ? 1 : 0) * 0.001;
        },
        fadeIn() {
          if (this.fadingIn) {
            this.fadingIn = this.opacity > this.opacityTresh ? false : true;
            this.opacity += this.do;
          }
        },
        fadeOut() {
          if (this.fadingOut) {
            this.fadingOut = this.opacity < 0 ? false : true;
            this.opacity -= this.do / 2;
            if (this.x > width || this.y < 0) {
              this.fadingOut = false;
              this.reset();
            }
          }
        },
        draw() {
          const tw = 0.6 + 0.4 * Math.sin(performance.now() / 1000 * this.tw + this.twPh);
          const a = Math.max(0, Math.min(1, this.opacity * tw));
          ctx.beginPath();
          if (this.giant) {
            ctx.fillStyle = `rgba(180,184,240,${a})`;
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2, false);
          } else if (this.comet) {
            ctx.fillStyle = `rgba(226,225,224,${a})`;
            ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2, false);
            for (let i = 0; i < 30; i++) {
              ctx.fillStyle = `rgba(226,225,224,${Math.max(0, a - (a / 20) * i)})`;
              ctx.rect(this.x - this.dx / 4 * i, this.y - this.dy / 4 * i - 2, 2, 2);
              ctx.fill();
            }
          } else {
            ctx.fillStyle = `rgba(226,225,142,${a})`;
            ctx.rect(this.x, this.y, this.r, this.r);
          }
          ctx.closePath();
          ctx.fill();
        },
        move() {
          this.x += this.dx;
          this.y += this.dy;
          if (this.fadingOut === false) this.reset();
          if (this.x > width - width / 4 || this.y < 0) this.fadingOut = true;
        },
      };
      s.reset();
      return s;
    };

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const count = Math.max(80, Math.round(width * 0.27));
      stars = Array.from({ length: count }, makeStar);
    };
    const draw = () => {
      if (this.done || !document.getElementById('welcome')) return;
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.move();
        s.fadeIn();
        s.fadeOut();
        s.draw();
      }
      this.rafUniverse = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    setTimeout(() => { first = false; }, 50);
    draw();
  },

  /* ---------- 粒子文字（030 main.js 改编，暖金色） ---------- */
  startParticleText() {
    const canvas = $('#welcomeFx');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    let W = 0;
    let H = 0;
    let dpr = 1;
    const overlay = $('#welcome');

    const fit = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      W = Math.min(window.innerWidth - 20, 940);
      H = Math.round(Math.min(Math.max(W * 0.16, 104), 150));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.particleCount = Math.min(15000, Math.max(2600, Math.round((W * H) / 16)));
    };

    const drawGlyphs = (text) => {
      ctx.clearRect(0, 0, W, H);
      const { size, lines } = welcomeTextLayout(ctx, text, W, H);
      ctx.font = `700 ${size}px "PingFang SC","Microsoft YaHei","SimHei","Avenir","Helvetica Neue",sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,255,255,0.98)';
      const lh = size * 1.3;
      let y = (H - lines.length * lh) / 2 + size * 0.72;
      for (const ln of lines) {
        ctx.fillText(ln, W / 2, y);
        y += lh;
      }
      return ctx.getImageData(0, 0, W, H);
    };

    const sampleTargets = (imgData) => {
      const step = 2;
      const pts = [];
      for (let x = W - step; x > 0; x -= step) {
        for (let y = 0; y < H; y += step) {
          const idx = (x + y * W) * 4;
          if (imgData.data[idx + 3] > 8) pts.push([x, y]);
        }
      }
      return pts;
    };

    const buildParticles = () => {
      const n = this.particleCount;
      const arr = [];
      for (let i = 0; i < n; i++) {
        arr.push({
          px: Math.random() * W,
          py: Math.random() * H,
          mx: 0,
          my: 0,
          vx: 0,
          vy: 0,
          size: Math.random() * 1.0 + 0.4,
          opacity: 0,
        });
      }
      return arr;
    };

    const assignTargets = (targets) => {
      const list = targets.slice();
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        if (i < list.length) {
          p.mx = list[i][0];
          p.my = list[i][1];
        } else {
          p.mx = randOffX();
          p.my = H + 10 + Math.random() * 60;
        }
      }
    };
    const randOffX = () => Math.random() * W;

    fit();
    this.particles = buildParticles();
    assignTargets(sampleTargets(drawGlyphs(this.LINES[0])));
    this.phase = 'assemble';
    for (const p of this.particles) p.opacity = 0;

    const step = () => {
      if (this.done || !document.getElementById('welcome')) return;
      ctx.clearRect(0, 0, W, H);
      const now = performance.now();

      if (this.phase === 'dissolve' && now >= this.swapAt) {
        this.phase = 'assemble';
        assignTargets(sampleTargets(drawGlyphs(this.LINES[this.textIndex])));
        for (const p of this.particles) p.opacity = Math.max(0, p.opacity * 0.25);
      }

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        if (this.phase === 'dissolve') {
          p.px += p.vx;
          p.py += p.vy;
          p.opacity = Math.max(0, p.opacity - 0.05);
        } else if (this.phase === 'assemble') {
          const dx = p.mx - p.px;
          const dy = p.my - p.py;
          const d = Math.hypot(dx, dy) || 1;
          const pull = Math.min(1, d * 0.06);
          p.px += dx * pull + (Math.random() - 0.5) * 1.1;
          p.py += dy * pull + (Math.random() - 0.5) * 1.1;
          p.opacity = Math.min(1, p.opacity + 0.035);
          if (d < 1.3) p.opacity = 1;
        } else if (this.phase === 'scatter') {
          p.px += p.vx;
          p.py += p.vy;
          p.opacity = Math.max(0, p.opacity - 0.014);
        }
        if (p.opacity > 0.02) {
          ctx.fillStyle = `rgba(226,225,142,${p.opacity.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(p.px, p.py, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      this.raf = requestAnimationFrame(step);
    };

    const advance = () => {
      if (this.done || this.advancing) return;
      if (this.textIndex >= this.LINES.length - 1) {
        this.textIndex++;
        this.phase = 'scatter';
        for (const p of this.particles) {
          const a = Math.random() * Math.PI * 2;
          const sp = 0.5 + Math.random() * 1.7;
          p.vx = Math.cos(a) * sp;
          p.vy = Math.sin(a) * sp - 0.35;
        }
        this.fadeTimer = setTimeout(() => {
          $('#welcomeEnter').classList.remove('hidden');
          this.advancing = false;
        }, 720);
        return;
      }
      this.advancing = true;
      this.phase = 'dissolve';
      for (const p of this.particles) {
        const a = Math.random() * Math.PI * 2;
        const sp = 0.35 + Math.random() * 1.15;
        p.vx = Math.cos(a) * sp;
        p.vy = Math.sin(a) * sp - 0.2;
      }
      this.textIndex++;
      this.swapAt = performance.now() + 430;
      this.fadeTimer = setTimeout(() => { this.advancing = false; }, 640);
    };

    overlay.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('.welcome-cat')) return;
      advance();
    });

    window.addEventListener('resize', () => {
      fit();
      this.particles = buildParticles();
      const idx = Math.min(this.textIndex, this.LINES.length - 1);
      assignTargets(sampleTargets(drawGlyphs(this.LINES[idx])));
      this.phase = 'assemble';
      for (const p of this.particles) p.opacity = 0;
    });

    this.raf = requestAnimationFrame(step);
  },

  /* 减少动态偏好时：静态发光文字 */
  staticText(canvas, ctx) {
    const overlay = $('#welcome');
    let i = 0;
    const draw = () => {
      const W = Math.min(window.innerWidth - 20, 940);
      const H = Math.round(Math.min(Math.max(W * 0.16, 104), 150));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const { size, lines } = welcomeTextLayout(ctx, this.LINES[i], W, H);
      ctx.font = `700 ${size}px "PingFang SC","Microsoft YaHei","SimHei","Avenir","Helvetica Neue",sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255,240,210,0.95)';
      ctx.shadowColor = 'rgba(255,205,130,0.8)';
      ctx.shadowBlur = 18;
      const lh = size * 1.3;
      let y = (H - lines.length * lh) / 2 + size * 0.72;
      for (const ln of lines) {
        ctx.fillText(ln, W / 2, y);
        y += lh;
      }
    };
    const advance = () => {
      if (this.done) return;
      if (i >= this.LINES.length - 1) {
        $('#welcomeEnter').classList.remove('hidden');
        return;
      }
      i++;
      canvas.style.opacity = '0';
      setTimeout(() => {
        draw();
        canvas.style.opacity = '1';
      }, 380);
    };
    overlay.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('.welcome-cat')) return;
      advance();
    });
    draw();
  },

  finish() {
    if (this.done) return;
    this.done = true;
    clearTimeout(this.fadeTimer);
    clearTimeout(this.idleTimer);
    cancelAnimationFrame(this.raf);
    cancelAnimationFrame(this.rafUniverse);
    const audio = $('#welcomeMusic');
    if (audio) audio.pause();
    const el = $('#welcome');
    if (el) {
      el.classList.add('hide');
      setTimeout(() => el.remove(), 950);
    }
  },
};
