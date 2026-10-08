/* The app scenes of the Home that are still own code on Webflow (webflow/CUSTOM-CODE.md): the Oracle's plan and the
   Focus Mode screen follow the scroll (prototype webflow/src/js/phones.js, parts 5 and 7), the archetype band moves
   sideways while pinned (olimpo.js, part 8), and the Curfew clock plays its three states once (olimpo.js, the SVG
   state machine; the Rive file it could load never existed, webflow/MAPA-NATIVO.md). The opening goal card and the
   method rows of phones.js are native (ix3 and Finsweet) and stay out. Only the Focus Mode mockup has visitor text.
   Built by webflow/build-home-body.mjs into page-code-home-body.html. Reduced motion: final states, no movement. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.min(Math.max(v, a), b); };
  var gsap = window.gsap || null;

  /* the visitor text of the Focus Mode mockup, by phase, in the page's language (the Home is English, /es and /pt its
     copies, 08/10/2026; Spanish and Portuguese from the prototypes' phones.js) */
  var LANG = /^\/(es|pt)(\/|$)/.test(location.pathname) ? location.pathname.slice(1, 3) : 'en';
  var FOCUS_TEXT = {
    en: {
      focus: { phase: 'FOCUS', label: 'Pause', icon: '❚❚', task: 'Add up the fixed costs', meta: '🏠 Apartment down payment · Phase 1' },
      rest: { phase: '🌿 BREAK', label: 'Resume', icon: '▶', task: 'Breathe, stretch', meta: 'Short break · 2 min' }
    },
    es: {
      focus: { phase: 'FOCO', label: 'Pausar', icon: '❚❚', task: 'Sumar los gastos fijos', meta: '🏠 Pago inicial del departamento · Fase 1' },
      rest: { phase: '🌿 DESCANSO', label: 'Reanudar', icon: '▶', task: 'Respirar, estirarse', meta: 'Pausa corta · 2 min' }
    },
    pt: {
      focus: { phase: 'FOCO', label: 'Pausar', icon: '❚❚', task: 'Somar os gastos fixos', meta: '🏠 Entrada do apartamento · Fase 1' },
      rest: { phase: '🌿 DESCANSO', label: 'Retomar', icon: '▶', task: 'Respirar, alongar', meta: 'Pausa curta · 2 min' }
    }
  }[LANG];

  var onceVisible = function (els, cb, opts) {
    if (!('IntersectionObserver' in window)) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { io.unobserve(en.target); cb(en.target); } });
    }, opts || { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    els.forEach(function (el) { if (el) io.observe(el); });
  };

  /* progress from 0 to 1 of an element passing on screen */
  function scrollProgress(el, startFrac, endFrac) {
    var r = el.getBoundingClientRect(), vh = innerHeight;
    var a = vh * startFrac, b = -r.height + vh * endFrac;
    return Math.min(1, Math.max(0, (a - r.top) / (a - b)));
  }
  var scrollFns = [], pending = false;
  var runAll = function () { pending = false; scrollFns.forEach(function (f) { f(); }); };
  addEventListener('scroll', function () { if (!pending) { pending = true; requestAnimationFrame(runAll); } }, { passive: true });
  addEventListener('resize', runAll);

  /* 5 · Oracle: the scroll types the request (0 to .16), then each step with data-show (and data-hide) appears; the
     feed moves up so its end is always in view */
  (function oracle() {
    var rail = $('[data-oracle-section]'), m = $('[data-oracle]'); if (!rail || !m) return;
    var goal = m.dataset.goal || '', it = $('[data-itext]', m), typed = $('[data-typed]', m);
    var feed = $('[data-feed]', m), body = $('.oracle-mockup_body', m), bg = $('[data-oracle-bg]');
    if (!it || !typed || !feed || !body) return;
    var ph = it.textContent, steps = $$('.is-step', m);
    var run = function (p) {
      var n = p < .16 ? Math.round(Math.max(0, p / .16) * goal.length) : 0;
      it.textContent = n > 0 ? goal.slice(0, n) : ph; it.classList.toggle('is-placeholder', !(n > 0));
      typed.textContent = goal;
      steps.forEach(function (el) {
        var on = p >= +el.dataset.show, off = el.dataset.hide ? p >= +el.dataset.hide : false;
        el.classList.toggle('is-on', on && !off); el.classList.toggle('is-hidden', off);
      });
      feed.style.transform = 'translateY(' + (-Math.max(0, feed.scrollHeight - body.clientHeight)).toFixed(0) + 'px)';
    };
    if (reduce) { run(1); return; }
    scrollFns.push(function () {
      run(scrollProgress(rail, 0, 1) * 1.08); /* the plan is complete a little before the scene lets go */
      if (bg) bg.style.setProperty('--p', scrollProgress(rail, 1, 0).toFixed(3));
    });
  })();

  /* 7 · Focus Mode: the scroll moves the clock and the phases of the app, and lights the step of the text */
  (function focusMode() {
    var rail = $('[data-focus-track]'), el = $('[data-focus]'); if (!rail || !el) return;
    var steps = $$('[data-step]', rail);
    var CIRC = 2 * Math.PI * 100, total = 25 * 60, pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
    var set = function (s, v) { var n = $(s, el); if (n) n.textContent = v; };
    function runFocus(p) {
      var cur, t = FOCUS_TEXT.focus;
      if (p < .20) cur = Math.round(total - 40 * (p / .20));
      else if (p < .55) { cur = 24 * 60 + 20; t = FOCUS_TEXT.rest; }
      else if (p < .75) cur = Math.round(24 * 60 + 20 - 40 * ((p - .55) / .20));
      else cur = Math.round(23 * 60 + 40 - 40 * ((p - .75) / .25));
      set('[data-focus-time]', pad2(Math.floor(cur / 60)) + ':' + pad2(cur % 60));
      set('[data-focus-pct]', Math.round((1 - cur / total) * 100) + '%');
      var ring = $('[data-focus-ring]', el); if (ring) ring.style.strokeDashoffset = (CIRC * (cur / total)).toFixed(1);
      set('[data-focus-phase]', t.phase); el.classList.toggle('is-resting', t === FOCUS_TEXT.rest);
      var music = $('[data-focus-music]', el); if (music) music.classList.toggle('is-show', p >= .40);
      set('[data-focus-pauseicon]', t.icon); set('[data-focus-pauselabel]', t.label);
      set('[data-focus-task]', t.task); set('[data-focus-task-meta]', t.meta);
    }
    var desktop = matchMedia('(min-width: 992px)');
    if (reduce) { runFocus(1); steps.forEach(function (p) { p.classList.add('is-on'); }); return; }
    scrollFns.push(function () {
      var p = desktop.matches ? scrollProgress(rail, 0, 1) : scrollProgress(el, .9, .3);
      runFocus(p);
      var n = Math.min(4, 1 + Math.floor(p * 4));
      steps.forEach(function (x) { x.classList.toggle('is-on', desktop.matches ? +x.dataset.step === n : true); });
    });
  })();

  /* 8 · archetype band: the track gets the height of the sideways path, the stage stays pinned (sticky) and the
     vertical scroll becomes a sideways shift. Reduced motion: the native sideways scroll stays. Keyboard focus brings
     the band to the focused panel. */
  $$('[data-hscroll]').forEach(function (rail) {
    var track = $('[data-hscroll-track]', rail), vp = track && track.parentElement;
    if (!track || reduce) return;
    rail.classList.add('is-hscroll');
    var dist = 0, raf = 0;
    var move = function () {
      raf = 0;
      track.style.transform = 'translate3d(' + (-clamp(-rail.getBoundingClientRect().top, 0, dist)) + 'px,0,0)';
    };
    var measure = function () {
      dist = Math.max(0, track.scrollWidth - vp.clientWidth);
      rail.style.height = 'calc(100vh + ' + dist + 'px)';
      move();
      if (window.ScrollTrigger) window.ScrollTrigger.refresh(); /* the page got taller: the ix3 triggers below move */
    };
    addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(move); }, { passive: true });
    addEventListener('resize', measure);
    addEventListener('load', measure);
    measure();
    track.addEventListener('focusin', function (e) {
      var li = e.target.closest('li'); if (!li) return;
      var pos = clamp(li.offsetLeft - (vp.clientWidth - li.offsetWidth) / 2, 0, dist);
      scrollTo({ top: rail.getBoundingClientRect().top + scrollY + pos, behavior: 'instant' });
    });
  });

  /* 9 · Curfew clock: the 12 marks (the top one is 11 pm), then, once it is on screen, one pass through the states:
     day completed, streak broken, and 89 to 90 days (celestial) */
  (function curfewClock() {
    var host = $('[data-tap]'); if (!host) return;
    var svg = $('.curfew-clock_graphic', host); if (!svg) return;
    var num = $('.curfew-clock_number', svg), arc = $('.curfew-clock_arc', svg), hand = $('.curfew-clock_hand', svg);
    var mark = $('.curfew-clock_mark', svg), check = $('.curfew-clock_check', svg), strike = $('.curfew-clock_strike', svg);
    var ticks = $('.curfew-clock_ticks', svg);
    if (!num || !arc || !hand || !mark || !check || !strike || !ticks) return;
    if (!ticks.children.length) for (var i = 0; i < 12; i++) {
      var a = i / 12 * Math.PI * 2, r1 = i === 0 ? 86 : 92, r2 = 100;
      var l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', 120 + Math.sin(a) * r1); l.setAttribute('y1', 120 - Math.cos(a) * r1);
      l.setAttribute('x2', 120 + Math.sin(a) * r2); l.setAttribute('y2', 120 - Math.cos(a) * r2);
      if (i === 0) l.setAttribute('class', 'is-23');
      ticks.appendChild(l);
    }
    var C = 628.3, seq = 29, tl = null;
    var arcFor = function (n) { return C * (1 - clamp(n / 90, 0, 1)); };
    var markAt40 = function () { mark.setAttribute('cx', 120 + Math.sin(40 * Math.PI / 180) * 100); mark.setAttribute('cy', 120 - Math.cos(40 * Math.PI / 180) * 100); };
    function paintStatic(st, n) {
      num.textContent = n;
      arc.style.strokeDashoffset = arcFor(n);
      hand.style.transform = 'rotate(' + (st === 'broken' ? 40 : st === 'idle' ? 200 : 350) + 'deg)';
      check.style.strokeDashoffset = (st === 'completed' || st === 'celestial') ? 0 : 48;
      strike.style.strokeDashoffset = st === 'broken' ? 0 : 56;
      mark.style.opacity = st === 'broken' ? 1 : 0;
      if (st === 'broken') markAt40();
    }
    function setState(st) { host.dataset.state = st; }
    function play(st) {
      if (tl) tl.kill();
      var from = seq;
      if (st === 'completed') seq = Math.min(90, seq + 1);
      if (st === 'broken') seq = 0;
      if (st === 'celestial') seq = 90;
      var to = seq, final = st === 'completed' && to >= 90 ? 'celestial' : st;
      if (!gsap || reduce) { setState(final); paintStatic(final, to); return Promise.resolve(); }
      return new Promise(function (res) {
        var o = { n: from };
        var count = function () { num.textContent = o.n; };
        tl = gsap.timeline({ onComplete: res });
        if (st === 'completed' || st === 'celestial') {
          strike.style.strokeDashoffset = 56; mark.style.opacity = 0;
          tl.set(check, { strokeDashoffset: 48 })
            .fromTo(hand, { rotation: 200, transformOrigin: '120px 120px' }, { rotation: 350, duration: .8, ease: 'power2.inOut' })
            .add(function () { setState(final); })
            .to(check, { strokeDashoffset: 0, duration: .5, ease: 'power2.out' })
            .to(o, { n: to, duration: .5, ease: 'power2.out', snap: { n: 1 }, onUpdate: count }, '<')
            .to(arc, { strokeDashoffset: arcFor(to), duration: .5, ease: 'power2.inOut' }, '<');
        } else if (st === 'broken') {
          tl.set(check, { strokeDashoffset: 48 })
            .fromTo(hand, { rotation: 300, transformOrigin: '120px 120px' }, { rotation: 400, duration: .9, ease: 'power2.in' })
            .add(function () { setState('broken'); markAt40(); })
            .to(mark, { opacity: 1, duration: .2 })
            .to(strike, { strokeDashoffset: 0, duration: .35, ease: 'power2.out' })
            .to(o, { n: 0, duration: .5, ease: 'power2.in', snap: { n: 1 }, onUpdate: count })
            .to(arc, { strokeDashoffset: C, duration: .5, ease: 'power2.in' }, '<');
        } else { setState(st); paintStatic(st, seq); res(); }
      });
    }
    var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
    function demo() {
      if (reduce) return play('celestial');
      return play('completed').then(function () { return wait(900); }).then(function () { return play('broken'); })
        .then(function () { return wait(900); }).then(function () {
          seq = 89; num.textContent = 89; arc.style.strokeDashoffset = arcFor(89);
          return play('completed');
        });
    }
    paintStatic('idle', seq); setState('idle');
    onceVisible([host], demo, { threshold: .5 });
    window.OlimpoTap = { play: play, state: function () { return { state: host.dataset.state, days: seq, number: num.textContent }; } };
  })();

  /* 11 · plans: the names Monthly and Yearly are the native Tab Links, and the switch belongs to neither; each tap
     goes to the tab that is not open, as the prototype's switch did (olimpo.js, part 11). The switch sits inside the
     Yearly link because the Tabs Menu takes only Tab Links, so its click stops before Webflow's tab handler (João,
     28/09/2026: "o togle n pertence a ninguem, vc toca nele muda, toca de novo muda pro outro") */
  document.addEventListener('click', function (ev) {
    var sw = ev.target.closest && ev.target.closest('.pricing_switch'); if (!sw) return;
    var other = $('.pricing_billing-toggle .w-tab-link:not(.w--current)'); if (!other) return;
    ev.preventDefault(); ev.stopPropagation(); other.click();
  }, true);

  /* 12 · cursor dot, as the prototype moved it (js/olimpo.js, cursor()): fixed to the screen and brought to the
     pointer's screen position with gsap.quickTo (0.12s, power2.out), so a scroll with the mouse still leaves it where it
     is. The native Follow mouse it replaces works in page coordinates (core/webflow-paste/ERROS.md E19 and E35; João,
     28/09/2026: "ao fazer scroll o mouse sobe" and "resolva corrigindo a causa do erro, sem gambiarra"). Same media
     query as the CSS that shows the dot */
  (function cursorDot() {
    var dot = $('.cursor_dot');
    if (!dot || !gsap || !matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference) and (min-width: 992px)').matches) return;
    gsap.set(dot, { x: -100, y: -100 });
    var qx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power2.out' }), qy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power2.out' });
    addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') { qx(e.clientX); qy(e.clientY); } }, { passive: true });
  })();

  runAll();
})();
