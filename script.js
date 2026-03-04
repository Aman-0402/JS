"use strict";

/* ── Utilities ── */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

/* ════════════════════════════════════════════
   1. CUSTOM CURSOR
   ════════════════════════════════════════════ */
(function () {
  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');
  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function tick() {
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    rx = lerp(rx, mx, 0.14); ry = lerp(ry, my, 0.14);
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(tick);
  })();

  $$('button, .book-3d, .float-badge').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });
})();

/* ════════════════════════════════════════════
   2. SPOTLIGHT
   ════════════════════════════════════════════ */
document.addEventListener('mousemove', e => {
  const sp = $('#spotlight');
  if (sp) sp.style.background =
    `radial-gradient(circle 300px at ${e.clientX}px ${e.clientY}px, rgba(247,223,30,0.05) 0%, transparent 70%)`;
});

/* ════════════════════════════════════════════
   3. GRID CANVAS
   ════════════════════════════════════════════ */
(function () {
  const canvas = $('#grid-canvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sp = 54;
    ctx.strokeStyle = 'rgba(247,223,30,0.045)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width;  x += sp) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
    for (let y = 0; y <= canvas.height; y += sp) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
    ctx.fillStyle = 'rgba(247,223,30,0.13)';
    for (let x = 0; x <= canvas.width;  x += sp * 4)
      for (let y = 0; y <= canvas.height; y += sp * 4) {
        ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fill();
      }
  }
  resize();
  window.addEventListener('resize', resize);
})();

/* ════════════════════════════════════════════
   4. PARTICLE CANVAS
   ════════════════════════════════════════════ */
(function () {
  const canvas = $('#particle-canvas');
  const ctx    = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({ length: 70 }, () => ({
    x: rand(0, canvas.width),
    y: rand(0, canvas.height),
    size: rand(1, 2.2),
    speed: rand(0.18, 0.7),
    drift: rand(-0.18, 0.18),
    opacity: rand(0.08, 0.45),
    reset() { this.y = canvas.height + 8; this.x = rand(0, canvas.width); }
  }));

  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.y -= p.speed; p.x += p.drift;
      if (p.y < -8) p.reset();
      ctx.save(); ctx.globalAlpha = p.opacity;
      ctx.fillStyle = '#F7DF1E';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(loop);
  })();

  /* click burst */
  document.addEventListener('click', e => {
    for (let i = 0; i < 10; i++) {
      const b = { x: e.clientX, y: e.clientY, vx: rand(-4, 4), vy: rand(-5, 1), life: 1, size: rand(2, 4) };
      const burst = setInterval(() => {
        b.x += b.vx; b.y += b.vy; b.vy += 0.15; b.life -= 0.05;
        if (b.life <= 0) { clearInterval(burst); return; }
        ctx.save(); ctx.globalAlpha = b.life;
        ctx.fillStyle = '#F7DF1E';
        ctx.beginPath(); ctx.arc(b.x, b.y, b.size * b.life, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }, 16);
    }
  });
})();

/* ════════════════════════════════════════════
   5. 3D BOOK TILT
   ════════════════════════════════════════════ */
(function () {
  const scene  = $('#bookScene');
  const book   = $('#book3d');
  const shadow = $('#bookShadow');
  if (!scene || !book) return;

  let cRY = -25, cRX = 5, tRY = -25, tRX = 5;

  scene.addEventListener('mousemove', e => {
    const r = scene.getBoundingClientRect();
    const dx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
    const dy = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
    tRY = clamp(-25 + dx * 20, -46, 4);
    tRX = clamp(5   - dy * 12, -10, 18);
  });

  scene.addEventListener('mouseenter', () => book.classList.add('tilt-active'));
  scene.addEventListener('mouseleave', () => {
    book.classList.remove('tilt-active');
    tRY = -25; tRX = 5;
  });

  (function animTilt() {
    cRY = lerp(cRY, tRY, 0.1);
    cRX = lerp(cRX, tRX, 0.1);
    book.style.transform   = `rotateY(${cRY}deg) rotateX(${cRX}deg)`;
    shadow.style.transform = `translateX(-50%) scaleX(${0.8 + (cRY + 45) * 0.004})`;
    requestAnimationFrame(animTilt);
  })();
})();

/* ════════════════════════════════════════════
   6. TERMINAL TYPING
   ════════════════════════════════════════════ */
(function () {
  const staticLines = [
    { id: 'termLine1', html: '<span class="cm">// Chapter 4: Closures</span>',         delay: 350 },
    { id: 'termLine2', html: '<span class="kw">const</span> <span class="fn">makeCounter</span> = () => {', delay: 800 },
    { id: 'termLine3', html: '&nbsp;&nbsp;<span class="kw">return</span> () => ++<span class="num">count</span>;', delay: 1200 },
  ];
  const cycling = [
    '};',
    '',
    'const counter = makeCounter();',
    'counter(); // → 1',
    'counter(); // → 2  ← magic!',
  ];

  staticLines.forEach(({ id, html, delay }) =>
    setTimeout(() => { const el = $('#' + id); if (el) el.innerHTML = html; }, delay)
  );

  let si = 0, ci = 0;
  setTimeout(function type() {
    const userInput = $('#userInput');
    if (!userInput) return;
    const snippet = cycling[si];
    if (ci <= snippet.length) {
      userInput.textContent = snippet.slice(0, ci++);
      setTimeout(type, ci > snippet.length ? 750 : 52);
    } else {
      setTimeout(() => {
        ci = 0; si = (si + 1) % cycling.length;
        userInput.textContent = '';
        type();
      }, 1100);
    }
  }, 1600);
})();

/* ════════════════════════════════════════════
   7. MAGNETIC BUTTONS
   ════════════════════════════════════════════ */
$$('[data-magnetic]').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) * 0.28;
    const dy = (e.clientY - r.top  - r.height / 2) * 0.28;
    btn.style.transform = `translate(${dx}px,${dy}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

/* ════════════════════════════════════════════
   8. REVEALS (fire immediately for fixed page)
   ════════════════════════════════════════════ */
$$('.reveal').forEach(el => {
  const delay = parseInt(el.dataset.delay || 0);
  setTimeout(() => el.classList.add('visible'), delay);
});

/* ════════════════════════════════════════════
   9. STAT COUNTERS — trigger after reveals settle
   ════════════════════════════════════════════ */
setTimeout(() => {
  $$('.stat-val[data-count]').forEach(el => {
    const end = parseFloat(el.dataset.count);
    const decimal = 'decimal' in el.dataset;
    const duration = 1600;
    const start = performance.now();
    (function step(now) {
      const t   = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      const val  = end * ease;
      el.textContent = decimal ? val.toFixed(1)
        : end >= 1000 ? (val / 1000).toFixed(1) + 'K'
        : Math.floor(val);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = decimal ? end.toFixed(1) : end >= 1000 ? (end / 1000).toFixed(1) + 'K' : end;
    })(performance.now());
  });
}, 500);

/* ════════════════════════════════════════════
   10. PROGRESS RING
   ════════════════════════════════════════════ */
setTimeout(() => {
  const fill = $('#prFill');
  const pct  = $('#prPct');
  if (!fill) return;
  const circ = 2 * Math.PI * 25;
  fill.style.strokeDasharray  = circ;
  fill.style.strokeDashoffset = circ;
  const target = 35;
  setTimeout(() => {
    fill.style.strokeDashoffset = circ - (target / 100) * circ;
    let cur = 0;
    const t = setInterval(() => {
      if (cur >= target) { clearInterval(t); return; }
      pct.textContent = (++cur) + '%';
    }, 1500 / target);
  }, 300);
}, 600);

/* ════════════════════════════════════════════
   11. TICKER DUPLICATE
   ════════════════════════════════════════════ */
const track = $('#tickerTrack');
if (track) track.innerHTML += track.innerHTML;

/* ════════════════════════════════════════════
   12. GLITCH SETUP
   ════════════════════════════════════════════ */
const gl = $('#glitchLine');
if (gl) { gl.classList.add('glitch'); gl.setAttribute('data-text', gl.textContent); }

/* ════════════════════════════════════════════
   13. CODE STRIP CYCLING
   ════════════════════════════════════════════ */
(function () {
  const strip = $('#codeStrip');
  if (!strip) return;
  const sets = [
    ['async/await','Closures','Proxies','Modules'],
    ['Generators','WeakRef','Iterators','Symbols'],
    ['Event Loop','Microtasks','Workers','WASM'],
    ['Destructuring','Spread','Opt. Chain','Nullish'],
  ];
  let idx = 0;
  setInterval(() => {
    strip.style.opacity = '0';
    setTimeout(() => {
      idx = (idx + 1) % sets.length;
      strip.innerHTML = sets[idx].map((s, i) =>
        `<span class="bcs-item"><span class="${i % 2 ? 'fn' : 'kw'}">${s}</span></span>` +
        (i < 3 ? '<span class="bcs-sep">•</span>' : '')
      ).join('');
      strip.style.transition = 'opacity .4s';
      strip.style.opacity = '1';
    }, 380);
  }, 3000);
})();

/* ════════════════════════════════════════════
   14. BOOK LOGO HOVER GLOW
   ════════════════════════════════════════════ */
const bookLogo = $('#bookLogo');
if (bookLogo) {
  bookLogo.addEventListener('mouseenter', () => {
    bookLogo.style.boxShadow = '0 0 50px rgba(247,223,30,0.6),0 0 100px rgba(247,223,30,0.25)';
    bookLogo.style.transform = 'scale(1.05)'; bookLogo.style.transition = 'all .3s';
  });
  bookLogo.addEventListener('mouseleave', () => {
    bookLogo.style.boxShadow = ''; bookLogo.style.transform = '';
  });
}

/* ════════════════════════════════════════════
   15. KONAMI CODE EASTER EGG
   ════════════════════════════════════════════ */
(function () {
  const code = [38,38,40,40,37,39,37,39,66,65];
  const hint  = $('#easterHint');
  const modal = $('#easterModal');
  const close = $('#emClose');
  let prog = 0;

  document.addEventListener('keydown', e => {
    if (e.keyCode === code[prog]) {
      prog++;
      if (hint) hint.classList.add('active');
      if (prog === code.length) {
        prog = 0;
        if (modal) modal.classList.add('show');
        setTimeout(() => hint && hint.classList.remove('active'), 2000);
      }
    } else {
      prog = 0;
      if (hint) hint.classList.remove('active');
    }
  });
  if (close) close.addEventListener('click', () => modal.classList.remove('show'));
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('show'); });
})();

/* ════════════════════════════════════════════
   16. PAGE TRANSITION → Content.html
   ════════════════════════════════════════════ */
function goToContents() {
  const overlay = $('#pageTransition');
  if (!overlay) { window.location.href = 'Content.html'; return; }
  overlay.classList.add('active');
  setTimeout(() => { window.location.href = 'Content.html'; }, 650);
}
window.goToContents = goToContents;

/* ── Console Easter Egg ── */
console.log('%c{js} The Infinite Loop — by Aman', 'font-size:20px;font-family:monospace;color:#F7DF1E;background:#000;padding:10px 22px;');
console.log('%cWelcome, student! This ebook was built for YOU. 🎓', 'color:#00FFA3;font-family:monospace;font-size:11px;');
console.log('%cTry: ↑↑↓↓←→←→BA on the page for a surprise!', 'color:rgba(255,255,255,0.35);font-family:monospace;font-size:10px;');