(function () {
  'use strict';

  /* ---------------------------------------------------------------
     Data: seven cards, straight from Figma node 1334:15910.
     levels order = side panel rows 0..6:
     smooth, driving, uv, blue, smudge, scratch, anti-glare
     0 = none, 1 = Included (one tick), 2 = Enhanced (two ticks), string = text
  ---------------------------------------------------------------- */
  var FEATURES = ['Smooth Power Transition', 'Confident Driving Vision', 'UV 400 Sun Protection',
                  'Blue Light Block', 'Smudge Resistant', 'Scratch Resistant', 'Anti-Glare'];

  var FLAG = '<span class="flag" role="img" aria-label="German flag"><svg viewBox="0 0 5 3" preserveAspectRatio="none" aria-hidden="true">' +
    '<rect width="5" height="1" fill="#000"/><rect y="1" width="5" height="1" fill="#dd0000"/><rect y="2" width="5" height="1" fill="#ffce00"/></svg></span>';

  var CARDS = [
    { id: 'anti-glare', name: ['Lenskart', 'Anti-Glare'], view: 'Normal View', x: 1, gif: '1x', index: '1.56', price: '2,000', addon: '1,200',
      levels: [0, 0, 0, 0, 1, 1, 1], bar: 'FREE LENS WITH 1 FRAME', label: 'Lenskart Anti-Glare' },
    { id: 'blu', name: ['Lenskart', '<span class="c-blue">BLU</span>'], view: 'Normal View', x: 1, gif: '1x', index: '1.56', price: '3,000', addon: '1,500',
      levels: [0, 0, 0, 1, 1, 1, 1], label: 'Lenskart BLU' },
    { id: 'blu-thin', name: ['Lenskart', '<span class="c-blue">BLU</span> Thin'], view: 'Normal View', x: 1, gif: '1x', index: '1.67', price: '4,600', addon: '2,000',
      levels: [0, 2, 2, 2, 1, 1, 1], label: 'Lenskart BLU Thin' },
    { id: 'blu-plus-thin', tag: { text: '100 Day fitting guarantee', tone: 'blue' }, name: ['Lenskart', '<span class="c-blue">BLU+ </span>Thin'],
      view: 'Normal View', x: 3, gif: '3x', index: '1.67', price: '6,600', addon: '2,500', levels: [2, 2, 2, 2, 1, 1, 1], night: true,
      label: 'Lenskart BLU+ Thin' },
    { id: 'owndays-ishield', tag: { text: 'Recommended : 100 Day fitting guarantee', tone: 'green' }, jp: true, mint: true,
      name: ['Owndays <span class="c-jp">Japan</span>', 'iShield <span class="c-blue">BLU+</span>'],
      view: 'Wide View', x: 5, gif: '5x', index: '1.56', price: '10,600', addon: '3,000', levels: [2, 2, 2, 2, 1, 1, 1], night: true,
      label: 'Owndays Japan iShield BLU+' },
    { id: 'owndays-blu-thin', tag: { text: 'Bestseller : 100 Day fitting guarantee', tone: 'green' }, jp: true, mint: true,
      name: ['Owndays <span class="c-jp">Japan</span>', '<span class="c-blue">BLU</span> Thin'],
      view: 'Wider+ Adaptive', x: 7, gif: '7x', index: '1.74', price: '15,600', addon: '3,500', levels: ['Fast Adoption', 2, 2, 2, 1, 1, 1],
      label: 'Owndays Japan BLU Thin' },
    { id: 'rodenstock-tokai', tag: { text: '100 Day fitting guarantee', tone: 'blue' }, jp: true,
      name: ['Rodenstock ' + FLAG + ' or', 'Tokai <span class="c-jp">Japan</span>'],
      view: 'AI Adaptive View', x: 10, gif: '10x', index: '1.67', price: '35,600', addon: '4,000', levels: ['Fast Adoption', 2, 2, 2, 1, 1, 1],
      label: 'Rodenstock or Tokai Japan' }
  ];

  var TICK_TOP = [254, 300, 346, 392];       // rows 0..3 (double ticks)
  var SINGLE_TOP = [436, 482, 528];          // rows 4..6 (single ticks)

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function cardHTML(c, i) {
    var cls = 'card' + (c.tag ? ' card--tagged' : '') + (c.jp ? ' card--jp' : '') + (c.mint ? ' card--mint' : '') + (c.gif === '3x' ? ' card--s3' : '');
    var h = '';
    h += '<article class="' + cls + '" data-i="' + i + '" tabindex="0" aria-roledescription="lens card" aria-label="' + esc(c.label + ', ' + c.view + ', ' + c.x + 'X corridor, ' + c.index + ' index, rupees ' + c.price.replace(',', '')) + '">';
    h += '<div class="card__band"></div><div class="card__lines"></div><div class="card__head"></div>';
    if (c.tag) h += '<div class="card__tag card__tag--' + c.tone_ + '"><span>' + esc(c.tag.text) + '</span></div>';
    h += '<div class="card__name"><div class="n">' + c.name.map(function (l) { return '<i>' + l + '</i>'; }).join('') + '</div><div class="v">' + esc(c.view) + '</div></div>';
    h += '<div class="strip" style="background-image:url(assets/strip-' + c.gif + '.png)"><img src="gifs/corridor-' + c.gif + '.gif" width="150" height="90" alt="" draggable="false" decoding="async">' +
         '<a class="gifdl" href="gifs/dl/lenskart-progressive-' + c.id + '-' + c.gif + '-corridor.gif" download="lenskart-progressive-' + c.id + '-' + c.gif + '-corridor.gif" aria-label="Download GIF: ' + esc(c.label) + ', ' + c.x + 'X corridor" title="Download GIF">' +
         '<svg viewBox="0 0 10 10" width="8" height="8" aria-hidden="true"><path d="M5 1v5.6M2.4 4.4 5 7l2.6-2.6M1.6 9h6.8" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span>GIF</span></a></div>';
    h += '<div class="card__info"><div class="chip' + (c.x >= 5 ? ' chip--mint' : '') + '">' + c.x + 'X CORRIDOR</div><div class="card__index">' + c.index + ' index</div>' +
         '<div class="price"><img src="assets/rupee.svg" width="6.33" height="15.9" alt=""><b>' + c.price + '</b></div></div>';
    if (c.bar) h += '<div class="freebar">' + esc(c.bar) + '</div>';
    if (c.night) h += '<div class="night">+ Night Drive</div>';
    var sr = [];
    c.levels.forEach(function (lv, r) {
      var top;
      if (typeof lv === 'string') {
        h += '<div class="fast">' + esc(lv) + '</div>';
        sr.push(FEATURES[r] + ': ' + lv);
      } else if (lv === 2) {
        h += '<img class="tick2" style="top:' + TICK_TOP[r] + 'px" src="assets/tick-2.svg" alt="">';
        sr.push(FEATURES[r] + ': enhanced');
      } else if (lv === 1) {
        top = r >= 4 ? SINGLE_TOP[r - 4] : TICK_TOP[r];
        if (c.id === 'anti-glare' && r === 4) top = 438;
        h += '<img class="tick" style="top:' + top + 'px" src="assets/tick-1.svg" alt="">';
        sr.push(FEATURES[r] + ': included');
      }
    });
    h += '<div class="addon"><i>+</i><b>₹' + c.addon + '</b></div>';
    h += '<span class="sr">' + esc(sr.join('. ')) + '. Add-on photochromatic coating: plus rupees ' + c.addon.replace(',', '') + '.</span>';
    h += '</article>';
    return h;
  }

  CARDS.forEach(function (c) { if (c.tag) c.tone_ = c.tag.tone; });
  var track = document.getElementById('track');
  track.innerHTML = CARDS.map(cardHTML).join('');

  /* a missing GIF must never break the card: the static Figma strip stays as the background */
  Array.prototype.forEach.call(track.querySelectorAll('.strip img'), function (img) {
    img.addEventListener('error', function () { img.remove(); });
  });

  /* ---------------------------------------------------------------
     Fit the 1080x810 stage to the window (keeps 4:3, centred)
  ---------------------------------------------------------------- */
  var scale = 1;
  function fit() {
    var vv = window.visualViewport;
    var w = vv ? vv.width : window.innerWidth, h = vv ? vv.height : window.innerHeight;
    var m = w >= 700 ? 16 : 6;
    scale = Math.max(0.1, Math.min((w - 2 * m) / 1080, (h - 2 * m) / 810));
    var root = document.documentElement.style;
    root.setProperty('--s', scale.toFixed(5));
    root.setProperty('--k', Math.max(1, Math.min(2.2, 1 / scale)).toFixed(3));   /* keep arrow buttons finger-sized on small screens */
  }
  fit();
  window.addEventListener('resize', fit);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);

  /* ---------------------------------------------------------------
     Scroller: native scroll-snap for touch / trackpad, plus a small
     controller for mouse drag + inertia, vertical wheel, keys, arrows.
  ---------------------------------------------------------------- */
  var sc = document.getElementById('scroller');
  var prev = document.getElementById('prev');
  var next = document.getElementById('next');
  var PITCH = 170;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function maxScroll() { return Math.max(0, sc.scrollWidth - sc.clientWidth); }
  function clamp(v) { return Math.max(0, Math.min(maxScroll(), v)); }
  function snaps() {
    var m = maxScroll(), a = [];
    for (var i = 0; i < CARDS.length; i++) { var p = Math.min(i * PITCH, m); if (a.indexOf(p) < 0) a.push(p); }
    return a;
  }
  function nearestIndex(x) {
    var s = snaps(), best = 0, d = Infinity;
    for (var i = 0; i < s.length; i++) { var dd = Math.abs(s[i] - x); if (dd < d) { d = dd; best = i; } }
    return best;
  }

  /* one eased "follow" loop drives every programmatic move */
  var target = null, raf = 0, lastT = 0, idleTimer = 0, rate = 0.17;
  function free(on) { sc.classList.toggle('is-free', on); }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; target = null; clearTimeout(idleTimer); }
  function tick(t) {
    var dt = Math.min(48, t - lastT); lastT = t;
    var cur = sc.scrollLeft, diff = target - cur;
    if (Math.abs(diff) < 1.5) { sc.scrollLeft = target; raf = 0; target = null; free(false); return; }
    var k = 1 - Math.pow(1 - rate, dt / 16.667);
    var step = diff * k;
    if (Math.abs(step) < 1) step = diff > 0 ? 1 : -1;   /* scrollLeft is quantised to device pixels: never stall */
    sc.scrollLeft = cur + step;
    raf = requestAnimationFrame(tick);
  }
  function glideTo(x, fast) {
    x = clamp(x);
    rate = fast ? 0.34 : 0.17;
    if (reduce) { stop(); free(true); sc.scrollLeft = x; free(false); return; }
    free(true);
    target = x;
    if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(tick); }
  }
  function currentIndex() { return nearestIndex(target != null ? target : sc.scrollLeft); }
  function stepIndex(n, fast) {
    var s = snaps(), i = Math.max(0, Math.min(s.length - 1, currentIndex() + n));
    glideTo(s[i], fast);
  }
  function stepPx(px) { glideTo(clamp((target != null ? target : sc.scrollLeft) + px)); }

  /* edge fade + arrow visibility */
  function sync() {
    var m = maxScroll(), x = sc.scrollLeft;
    var fl = Math.max(0, Math.min(1, x / 40)) * 36;
    var fr = Math.max(0, Math.min(1, (m - x) / 40)) * 36;
    sc.style.setProperty('--fl', fl.toFixed(1) + 'px');
    sc.style.setProperty('--fr', fr.toFixed(1) + 'px');
    prev.hidden = x < 2;
    next.hidden = x > m - 2;
    sc.dataset.pos = x < 2 ? 'start' : (x > m - 2 ? 'end' : 'mid');
  }
  sc.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();

  prev.addEventListener('click', function () { stepPx(-2 * PITCH); });
  next.addEventListener('click', function () { stepPx(2 * PITCH); });

  /* keyboard (document-wide, unless typing in a field) */
  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); stepIndex(1, true); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); stepIndex(-1, true); }
    else if (e.key === 'Home') { e.preventDefault(); glideTo(0, true); }
    else if (e.key === 'End') { e.preventDefault(); glideTo(maxScroll(), true); }
  });

  /* wheel: vertical wheel -> horizontal; native horizontal (trackpad) keeps native snap */
  sc.addEventListener('wheel', function (e) {
    if (e.ctrlKey) return;
    var ax = Math.abs(e.deltaX), ay = Math.abs(e.deltaY);
    if (ax >= ay) { stop(); free(false); return; }
    e.preventDefault();
    var d = (e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 300 : e.deltaY) / scale;
    var base = target != null ? target : sc.scrollLeft;
    free(true);
    rate = 0.2;
    target = clamp(base + d);
    if (!raf && !reduce) { lastT = performance.now(); raf = requestAnimationFrame(tick); }
    if (reduce) { sc.scrollLeft = target; }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { glideTo(snaps()[nearestIndex(target != null ? target : sc.scrollLeft)]); }, 130);
  }, { passive: false });

  /* mouse drag with inertia (touch and pen use native scrolling) */
  var drag = null, justDragged = false;
  sc.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    stop();
    drag = { x: e.clientX, sl: sc.scrollLeft, moved: false, pts: [{ t: performance.now(), x: e.clientX }], id: e.pointerId };
  });
  window.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dxs = e.clientX - drag.x;
    if (!drag.moved) {
      if (Math.abs(dxs) < 5) return;
      drag.moved = true; free(true); sc.classList.add('is-dragging');
      try { sc.setPointerCapture(drag.id); } catch (_) {}
    }
    var raw = drag.sl - dxs / scale, m = maxScroll();
    sc.scrollLeft = clamp(raw);
    var over = raw < 0 ? -raw : (raw > m ? raw - m : 0);
    var pull = 46 * (1 - Math.exp(-over / 90));            /* friction instead of a hard stop */
    track.style.transition = 'none';
    track.style.transform = over ? 'translateX(' + ((raw < 0 ? 1 : -1) * pull).toFixed(1) + 'px)' : '';
    var now = performance.now();
    drag.pts.push({ t: now, x: e.clientX });
    while (drag.pts.length > 2 && now - drag.pts[0].t > 90) drag.pts.shift();
  });
  function endDrag() {
    if (!drag) return;
    var d = drag; drag = null;
    sc.classList.remove('is-dragging');
    if (track.style.transform) {
      track.style.transition = 'transform .38s cubic-bezier(.23,1,.32,1)';
      track.style.transform = '';
    }
    if (!d.moved) return;
    justDragged = true; setTimeout(function () { justDragged = false; }, 0);
    var a = d.pts[0], b = d.pts[d.pts.length - 1];
    var dt = Math.max(1, b.t - a.t);
    var v = -((b.x - a.x) / dt) / scale;          // content px per ms
    if (performance.now() - b.t > 80) v = 0;       // paused before release: no fling
    var projected = sc.scrollLeft + Math.max(-1600, Math.min(1600, v * 420));
    free(true);
    glideTo(snaps()[nearestIndex(clamp(projected))]);
  }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  sc.addEventListener('dragstart', function (e) { e.preventDefault(); });

  /* touch / native scroll: cancel any running glide as soon as the finger lands */
  sc.addEventListener('touchstart', function () { stop(); free(false); }, { passive: true });

  /* tap / click: gently lift the card and light up its rows */
  var selected = null;
  function select(card) {
    if (selected) { selected.classList.remove('is-selected'); }
    selected = (card && card !== selected) ? card : null;
    if (selected) { selected.classList.add('is-selected'); }
  }
  track.addEventListener('click', function (e) {
    if (justDragged) return;
    if (e.target.closest('.gifdl')) return;      /* downloading must not select the card */
    var card = e.target.closest('.card');
    if (card) select(card);
  });
  track.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('card')) { e.preventDefault(); select(e.target); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') select(null); });

  window.__v4 = { glideTo: glideTo, snaps: snaps, sc: sc };
})();
