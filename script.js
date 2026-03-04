/* ════════════════════════════════════════════════════
   JAVASCRIPT EBOOK FRONTPAGE — script.js
   Features:
     - Custom cursor + magnetic buttons
     - Particle canvas system
     - Grid canvas background
     - 3D Book tilt on mouse move
     - Live typing terminal demo
     - Animated stat counters
     - Intersection Observer reveals
     - Ticker duplication
     - Progress ring animation
     - Konami code easter egg
     - Spotlight cursor effect
     - Click particle burst
   ════════════════════════════════════════════════════ */

"use strict";

/* ─────────────────────────────────────────────
   1.  UTILITY
───────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (min, max) => Math.random() * (max - min) + min;

/* ─────────────────────────────────────────────
   2.  CUSTOM CURSOR
───────────────────────────────────────────── */
(function initCursor() {
  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');
  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function tick() {
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    rx = lerp(rx, mx, 0.14);
    ry = lerp(ry, my, 0.14);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(tick);
  }
  tick();

  const hoverEls = $$('button, a, .hn-link, .chap-dot, .book-3d');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });
})();

/* ─────────────────────────────────────────────
   3.  SPOTLIGHT
───────────────────────────────────────────── */
(function initSpotlight() {
  const sp = $('#spotlight');
  document.addEventListener('mousemove', e => {
    sp.style.background = `radial-gradient(circle 320px at ${e.clientX}px ${e.clientY}px, rgba(247,223,30,0.05) 0%, transparent 70%)`;
  });
})();

/* ─────────────────────────────────────────────
   4.  GRID CANVAS
───────────────────────────────────────────── */
(function initGrid() {
  const canvas = $('#grid-canvas');
  const ctx    = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const spacing = 52;
    ctx.strokeStyle = 'rgba(247,223,30,0.04)';
    ctx.lineWidth   = 1;

    // vertical lines
    for (let x = 0; x <= canvas.width; x += spacing) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    // horizontal lines
    for (let y = 0; y <= canvas.height; y += spacing) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // accent dots at intersections (sparse)
    ctx.fillStyle = 'rgba(247,223,30,0.12)';
    for (let x = 0; x <= canvas.width; x += spacing * 4) {
      for (let y = 0; y <= canvas.height; y += spacing * 4) {
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  resize();
  window.addEventListener('resize', resize);
})();

/* ─────────────────────────────────────────────
   5.  PARTICLE CANVAS
───────────────────────────────────────────── */
(function initParticles() {
  const canvas = $('#particle-canvas');
  const ctx    = canvas.getContext('2d');
  const TOTAL  = 80;
  const particles = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x    = rand(0, canvas.width);
      this.y    = initial ? rand(0, canvas.height) : canvas.height + 10;
      this.size = rand(1, 2.5);
      this.speed= rand(0.2, 0.8);
      this.opacity = rand(0.1, 0.5);
      this.drift= rand(-0.2, 0.2);
    }
    update() {
      this.y -= this.speed;
      this.x += this.drift;
      if (this.y < -10) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = '#F7DF1E';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < TOTAL; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();

  /* Click burst */
  document.addEventListener('click', e => {
    for (let i = 0; i < 12; i++) {
      const burst = {
        x: e.clientX, y: e.clientY,
        vx: rand(-4, 4), vy: rand(-4, 4),
        life: 1, size: rand(2, 4),
        draw() {
          this.x += this.vx; this.y += this.vy; this.vy += 0.1;
          this.life -= 0.04;
          ctx.save();
          ctx.globalAlpha = Math.max(0, this.life);
          ctx.fillStyle = '#F7DF1E';
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      };
      particles.push(burst);
    }
    // clean up dead burst particles
    setTimeout(() => {
      const base = particles.splice(0, 12);
      void base;
    }, 1500);
  });
})();

/* ─────────────────────────────────────────────
   6.  3D BOOK TILT
───────────────────────────────────────────── */
(function initBookTilt() {
  const scene  = $('#bookScene');
  const book   = $('#book3d');
  const shadow = $('#bookShadow');
  if (!scene || !book) return;

  let currentRY = -25, currentRX = 5;
  let targetRY  = -25, targetRX  = 5;

  scene.addEventListener('mousemove', e => {
    const rect = scene.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);
    targetRY = clamp(-25 + dx * 20, -45, 5);
    targetRX = clamp(5  - dy * 12, -10, 18);
  });

  scene.addEventListener('mouseenter', () => book.classList.add('tilt-active'));
  scene.addEventListener('mouseleave', () => {
    book.classList.remove('tilt-active');
    targetRY = -25; targetRX = 5;
  });

  function animTilt() {
    currentRY = lerp(currentRY, targetRY, 0.1);
    currentRX = lerp(currentRX, targetRX, 0.1);
    const translateY = book.classList.contains('tilt-active') ? 0 : 0;
    book.style.transform   = `rotateY(${currentRY}deg) rotateX(${currentRX}deg)`;
    shadow.style.transform = `translateX(-50%) scaleX(${0.8 + (currentRY + 45) * 0.004})`;
    requestAnimationFrame(animTilt);
  }
  animTilt();
})();

/* ─────────────────────────────────────────────
   7.  TERMINAL TYPING DEMO
───────────────────────────────────────────── */
(function initTerminal() {
  const lines = [
    { id: 'termLine1', html: '<span class="cm">// Chapter 4: Closures</span>', delay: 400 },
    { id: 'termLine2', html: '<span class="kw">const</span> <span class="fn">makeCounter</span> = () => {', delay: 900 },
    { id: 'termLine3', html: '&nbsp;&nbsp;<span class="kw">let</span> count = <span class="num">0</span>;', delay: 1300 },
    { id: 'termLine4', html: '&nbsp;&nbsp;<span class="kw">return</span> () => ++count;', delay: 1700 },
  ];

  const activeSnippets = [
    { text: '};', delay: 400 },
    { text: '', delay: 700 },
    { text: 'const counter = makeCounter();', delay: 1100 },
    { text: 'counter(); // 1', delay: 1600 },
    { text: 'counter(); // 2  ← magic!', delay: 2100 },
  ];

  let snippetIdx  = 0;
  let charIdx     = 0;
  let phase       = 'static'; // static → typing → pause → clear → typing

  // Reveal static lines
  lines.forEach(({ id, html, delay }) => {
    setTimeout(() => {
      const el = $('#' + id);
      if (el) el.innerHTML = html;
    }, delay);
  });

  // Start cycling active line after all static lines appear
  setTimeout(startTypingCycle, 2200);

  function startTypingCycle() {
    const userInput = $('#userInput');
    const caret     = $('#caret');
    if (!userInput) return;

    function typeNext() {
      const snippet = activeSnippets[snippetIdx];
      if (!snippet) return;

      if (charIdx <= snippet.text.length) {
        userInput.textContent = snippet.text.slice(0, charIdx++);
        setTimeout(typeNext, charIdx > snippet.text.length ? 700 : 55);
      } else {
        // done typing this snippet — wait then clear
        setTimeout(() => {
          charIdx = 0;
          snippetIdx = (snippetIdx + 1) % activeSnippets.length;
          userInput.textContent = '';
          typeNext();
        }, 1200);
      }
    }
    typeNext();
  }
})();

/* ─────────────────────────────────────────────
   8.  MAGNETIC BUTTONS
───────────────────────────────────────────── */
(function initMagnetic() {
  $$('[data-magnetic]').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * 0.3;
      const dy   = (e.clientY - cy) * 0.3;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ─────────────────────────────────────────────
   9.  INTERSECTION OBSERVER — REVEALS & COUNTERS
───────────────────────────────────────────── */
(function initReveal() {
  // Reveal elements
  const revealEls = $$('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      const delay = parseInt(target.dataset.delay || 0);
      setTimeout(() => target.classList.add('visible'), delay);
      revealObs.unobserve(target);
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObs.observe(el));

  // Stat counters
  const statEls = $$('.stat-val[data-count]');
  const statObs = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      const end     = parseFloat(target.dataset.count);
      const decimal = target.dataset.decimal !== undefined;
      const duration = 1800;
      const start    = performance.now();

      function step(now) {
        const t   = Math.min((now - start) / duration, 1);
        const ease= 1 - Math.pow(1 - t, 4);
        const val = end * ease;
        target.textContent = decimal
          ? val.toFixed(1)
          : end >= 1000
            ? (val / 1000).toFixed(1) + 'K'
            : Math.floor(val);
        if (t < 1) requestAnimationFrame(step);
        else target.textContent = decimal ? end.toFixed(1) : end >= 1000 ? (end / 1000).toFixed(1) + 'K' : end;
      }
      requestAnimationFrame(step);
      statObs.unobserve(target);
    });
  }, { threshold: 0.5 });
  statEls.forEach(el => statObs.observe(el));
})();

/* ─────────────────────────────────────────────
   10. PROGRESS RING ANIMATION
───────────────────────────────────────────── */
(function initProgressRing() {
  const fill = $('#prFill');
  const pct  = $('#prPct');
  if (!fill) return;

  const circumference = 2 * Math.PI * 25; // r=25
  fill.style.strokeDasharray  = circumference;
  fill.style.strokeDashoffset = circumference;

  const obs = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    const target = 35; // 35% preview progress
    const offset = circumference - (target / 100) * circumference;
    fill.style.strokeDashoffset = offset;

    // Count up %
    let current = 0;
    const timer = setInterval(() => {
      if (current >= target) { clearInterval(timer); return; }
      current++;
      pct.textContent = current + '%';
    }, 1500 / target);

    obs.unobserve(entry.target);
  }, { threshold: 0.5 });
  obs.observe($('#progressRingWrap'));
})();

/* ─────────────────────────────────────────────
   11. TICKER — DUPLICATE FOR SEAMLESS LOOP
───────────────────────────────────────────── */
(function initTicker() {
  const track = $('#tickerTrack');
  if (!track) return;
  // Clone content for seamless loop
  track.innerHTML += track.innerHTML;
})();

/* ─────────────────────────────────────────────
   12. GLITCH TEXT SETUP
───────────────────────────────────────────── */
(function initGlitch() {
  const el = $('#glitchLine');
  if (!el) return;
  el.classList.add('glitch');
  el.setAttribute('data-text', el.textContent);
})();

/* ─────────────────────────────────────────────
   13. HEADER SCROLL EFFECT
───────────────────────────────────────────── */
(function initHeaderScroll() {
  const header = $('#siteHeader');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.style.borderBottomColor = 'rgba(247,223,30,0.2)';
    } else {
      header.style.borderBottomColor = 'rgba(247,223,30,0.1)';
    }
  });
})();

/* ─────────────────────────────────────────────
   14. BOOK LOGO HOVER — extra glow effect
───────────────────────────────────────────── */
(function initBookLogoHover() {
  const logo = $('#bookLogo');
  if (!logo) return;

  logo.addEventListener('mouseenter', () => {
    logo.style.boxShadow = '0 0 60px rgba(247,223,30,0.6), 0 0 120px rgba(247,223,30,0.3)';
    logo.style.transform = 'scale(1.04)';
    logo.style.transition = 'all 0.3s';
  });
  logo.addEventListener('mouseleave', () => {
    logo.style.boxShadow = '';
    logo.style.transform = '';
  });
})();

/* ─────────────────────────────────────────────
   15. KONAMI CODE EASTER EGG
───────────────────────────────────────────── */
(function initKonami() {
  const code = [38,38,40,40,37,39,37,39,66,65];
  const hint  = $('#easterHint');
  const modal = $('#easterModal');
  const close = $('#emClose');
  let progress = 0;

  document.addEventListener('keydown', e => {
    if (e.keyCode === code[progress]) {
      progress++;
      if (hint) hint.classList.add('active');
      if (progress === code.length) {
        progress = 0;
        if (modal) modal.classList.add('show');
        setTimeout(() => { if (hint) hint.classList.remove('active'); }, 2000);
      }
    } else {
      progress = 0;
      if (hint) hint.classList.remove('active');
    }
  });

  if (close) close.addEventListener('click', () => modal.classList.remove('show'));
  if (modal) modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('show');
  });
})();

/* ─────────────────────────────────────────────
   16. READ BUTTON — ripple on click
───────────────────────────────────────────── */
(function initRipple() {
  const btn = $('#readBtn');
  if (!btn) return;
  btn.addEventListener('click', function(e) {
    const ripple = this.querySelector('.btn-ripple');
    if (!ripple) return;
    ripple.style.opacity = '1';
    setTimeout(() => ripple.style.opacity = '0', 400);
  });
})();

/* ─────────────────────────────────────────────
   17. CODE STRIP CYCLING on book cover
───────────────────────────────────────────── */
(function initCodeStrip() {
  const strip = $('#codeStrip');
  if (!strip) return;

  const sets = [
    ['async / await', 'Closures', 'Proxies', 'Modules'],
    ['Generators', 'WeakRef', 'Iterators', 'Symbols'],
    ['Event Loop', 'Microtasks', 'Web Workers', 'WASM'],
    ['Destructuring', 'Spread', 'Optional Chain', 'Nullish'],
  ];
  let setIdx = 0;

  function updateStrip() {
    const s = sets[setIdx];
    strip.style.opacity = '0';
    strip.style.transition = 'opacity 0.4s';
    setTimeout(() => {
      strip.innerHTML = s.map((item, i) =>
        `<span class="bcs-item"><span class="${i % 2 === 0 ? 'kw' : 'fn'}">${item}</span></span>` +
        (i < s.length - 1 ? '<span class="bcs-sep">•</span>' : '')
      ).join('');
      strip.style.opacity = '1';
    }, 400);
    setIdx = (setIdx + 1) % sets.length;
  }

  setInterval(updateStrip, 3000);
})();

/* ─────────────────────────────────────────────
   18. NAV LINK ACTIVE HIGHLIGHT
───────────────────────────────────────────── */
(function initNavHighlight() {
  $$('.hn-link').forEach(link => {
    link.addEventListener('click', function() {
      $$('.hn-link').forEach(l => l.style.color = '');
      this.style.color = 'var(--yellow)';
      setTimeout(() => this.style.color = '', 1000);
    });
  });
})();

console.log('%c{js} The Infinite Loop', 'font-size:22px;font-family:monospace;color:#F7DF1E;background:#000;padding:12px 24px;');
console.log('%cYou found the console — you\'re going to enjoy this book.', 'color:#00FFA3;font-family:monospace;font-size:12px;');
console.log('%cTry the Konami code on the page ↑↑↓↓←→←→BA', 'color:rgba(255,255,255,0.4);font-family:monospace;font-size:10px;');