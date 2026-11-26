/* V1 · Cinematic. Plain JS, no build. Depends on ../shared/data.js (window.LK) and ../shared/corridor.js (window.Corridor). */
(function () {
  'use strict';
  const LK = window.LK;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const lenses = LK.lenses, features = LK.features;
  const maxX = Math.max.apply(null, lenses.map((l) => l.x));
  const SCENES = ['road_day', 'street_day', 'desk_day', 'road_day', 'street_day', 'desk_day', 'road_day', 'street_day'];
  const DEFAULT_ID = 'l5';
  const plainAddon = (n) => '+₹' + n;
  const lensName = (l) => `${l.brand} ${l.name}`;
  const clipSrc = (c) => '../' + c.src;
  const clipPoster = (c) => '../' + c.poster;
  const scoreOf = (l) => features.reduce((s, f) => s + l.f[f.id], 0);

  const ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" fill="currentColor"/></svg>',
    grid: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.8" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.8" fill="none" stroke="currentColor" stroke-width="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.8" fill="none" stroke="currentColor" stroke-width="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.8" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  };
  const ticks = (lvl) => lvl === 2 ? '<span class="dbl"><i class="tk"></i><i class="tk"></i></span>' : lvl === 1 ? '<i class="tk"></i>' : '<i class="tk none"></i>';

  const state = { id: DEFAULT_ID };
  const tiles = {};
  let hero = null;

  /* ---------- helpers ---------- */
  function popEl(el) {
    if (reduceMotion || !el) return;
    el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  }
  const counters = new WeakMap();
  function countTo(el, to) {
    const from = counters.has(el) ? counters.get(el).v : to;
    const prev = counters.get(el);
    if (prev && prev.raf) cancelAnimationFrame(prev.raf);
    if (reduceMotion || from === to) { el.textContent = LK.inr(to); counters.set(el, { v: to }); return; }
    const t0 = performance.now(), dur = 420, rec = { v: from, raf: 0 };
    counters.set(el, rec);
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      rec.v = Math.round(from + (to - from) * e);
      el.textContent = LK.inr(rec.v);
      if (p < 1) rec.raf = requestAnimationFrame(step); else rec.v = to;
    };
    rec.raf = requestAnimationFrame(step);
  }
  function fromLabel(fid, cur) {
    const l = lenses.find((x) => x.f[fid] > 0);
    if (!l) return '';
    return `${l.x}X` + (l.x === cur.x ? ' ' + l.name : '');
  }
  function listJoin(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function nextStep(l) {
    const i = lenses.indexOf(l), sc = scoreOf(l);
    const n = lenses.slice(i + 1).find((x) => scoreOf(x) > sc);
    if (!n) return null;
    const added = features.filter((f) => l.f[f.id] === 0 && n.f[f.id] > 0).map((f) => f.label);
    const up = features.filter((f) => l.f[f.id] === 1 && n.f[f.id] === 2).map((f) => f.label);
    const parts = [];
    if (added.length) parts.push('adds ' + listJoin(added));
    if (up.length) parts.push('lifts ' + listJoin(up) + ' to best level');
    return { lens: n, text: parts.join(' and ') };
  }

  /* ---------- build carousel ---------- */
  function tagChips(l) {
    const out = [];
    if (l.tags.includes('free-lens')) out.push('<span class="chip chip-free">Free lens with 1 frame</span>');
    if (l.tags.includes('recommended')) out.push('<span class="chip chip-rec">Recommended</span>');
    if (l.tags.includes('bestseller')) out.push('<span class="chip chip-best">Bestseller</span>');
    return out.join('');
  }
  function cardHtml(l) {
    return `<article class="card" data-id="${l.id}">
      <button class="card-hit" type="button" aria-pressed="false" tabindex="-1" aria-label="Select ${l.x}X, ${l.view}, ${lensName(l)}, ${LK.inr(l.price)}"></button>
      <div class="card-tags">${tagChips(l)}</div>
      <div class="card-x">${l.x}X</div>
      <div class="card-view">${l.view}</div>
      <div class="card-name">${lensName(l)}</div>
      <span class="idx">${LK.indexText(l)}</span>
      <div class="tile" data-tile="${l.id}"></div>
      <div class="card-price">${LK.inr(l.price)}</div>
      <button class="addon" type="button" data-addon="${l.id}" aria-label="Photochromatic add-on ${plainAddon(l.addon)}. See it in real life">${ICON.play}<span>Photochromatic ${plainAddon(l.addon)}</span></button>
      <div class="card-chips">${l.warranty ? '<span class="pill">100 Days fitting warranty</span>' : ''}${l.nightDrive ? '<span class="pill">+ Night Drive</span>' : ''}</div>
    </article>`;
  }
  function buildTrack() {
    const track = $('#track');
    track.setAttribute('role', 'group');
    track.innerHTML = LK.groups.map((g) => {
      const ls = lenses.filter((l) => l.group === g.id);
      const xs = ls.map((l) => l.x), lo = Math.min.apply(null, xs), hi = Math.max.apply(null, xs);
      const title = g.id === 'everyday' ? 'Everyday' : 'Special purpose';
      return `<div class="grp" data-g="${g.id}"><div class="grp-label"><b>${title}</b><small>${lo}X to ${hi}X</small></div><div class="grp-cards">${ls.map(cardHtml).join('')}</div></div>`;
    }).join('');
    lenses.forEach((l, i) => {
      const el = $(`[data-tile="${l.id}"]`, track);
      if (window.Corridor) tiles[l.id] = Corridor.mount(el, { x: l.x, scene: SCENES[i % SCENES.length], guide: true, chip: false, pan: true });
    });
  }

  /* ---------- hero ---------- */
  function initHero() {
    const l = LK.byId(state.id);
    if (window.Corridor) hero = Corridor.mount($('#heroCx'), { x: l.x, scene: 'road_day', guide: true, chip: true, pan: true });
    $('#heroRange').textContent = `1X to ${maxX}X`;
    $('#maxX').textContent = maxX + 'X';
    paintHero(l, false);
  }
  function paintHero(l, animate) {
    $('#heroX').textContent = `${l.x}X`;
    $('#heroView').textContent = l.view;
    $('#heroName').textContent = lensName(l);
    $('#heroIndex').textContent = LK.indexText(l);
    countTo($('#heroPrice'), l.price);
    if (animate) { popEl($('#heroX')); popEl($('#heroMeta')); }
    if (hero) hero.setX(l.x);
  }

  /* ---------- detail ---------- */
  function renderDetail(l, animate) {
    const incl = LK.included(l), best = features.filter((f) => l.f[f.id] === 2);
    const sum = best.length === features.length
      ? `<b>All ${features.length}</b> features at best level`
      : `<b>${incl.length} of ${features.length}</b> features included${best.length ? ` · ${best.length} at best level` : ''}`;
    const rows = features.map((f, i) => {
      const lvl = l.f[f.id], note = l.note && l.note[f.id];
      const sub = lvl ? f.blurb : `Not in ${l.x}X${fromLabel(f.id, l) ? ' · from ' + fromLabel(f.id, l) : ''}`;
      return `<button class="feat ${lvl ? 'on' : 'off'}" type="button" data-f="${f.id}" style="--i:${i}" aria-label="${f.label}: ${lvl === 2 ? 'best level' : lvl === 1 ? 'included' : 'not included'} in ${l.x}X. Play real-life clip">
        <span class="f-ticks">${ticks(lvl)}</span>
        <span class="f-txt"><span class="f-label">${f.label}${note ? `<span class="f-note">${note}</span>` : ''}</span><span class="f-sub">${sub}</span></span>
        <span class="f-play" aria-hidden="true">${ICON.play}</span>
      </button>`;
    }).join('');
    const nx = nextStep(l);
    const hint = nx
      ? `<button class="cell-hint" type="button" data-next="${nx.lens.id}" style="--i:7"><small>Next step · ${nx.lens.x}X</small><span><b>${nx.lens.x}X</b> ${nx.text}.</span></button>`
      : `<div class="cell-hint" style="--i:7"><small>Best level</small><span>Every feature at its best level. Nothing left to add.</span></div>`;
    const strip = incl.map((f, i) => `<button class="rl-th" type="button" data-rl="${f.id}" style="--i:${i}" title="${f.label}" aria-label="Play real-life clip: ${f.label}"><img src="${clipPoster(LK.clips[f.id])}" alt="" loading="lazy" draggable="false">${ICON.play}</button>`).join('');

    $('#detail').innerHTML = `
      <div class="d-id">
        <span class="d-eyebrow">What you get at</span>
        <div class="d-head swap"><span class="d-x">${l.x}X</span><div><div class="d-view">${l.view}</div><div class="d-name">${lensName(l)}</div></div></div>
        <p class="d-sum swap">${sum}</p>
        <button class="d-addon" type="button" data-addon="${l.id}" aria-label="Photochromatic add-on ${plainAddon(l.addon)}. See it in real life">${ICON.play}<span>Photochromatic add-on <b>${plainAddon(l.addon)}</b></span></button>
        <div class="rl"><div class="rl-label"><i></i>Real life</div><div class="rl-row">${strip}</div></div>
      </div>
      <div class="d-main">
        <div class="d-top">
          <div class="d-title"><span>Included in ${l.x}X</span>
            <span class="legend" aria-hidden="true"><span><i class="tk"></i>Included</span><span><span class="dbl"><i class="tk"></i><i class="tk"></i></span>Best level</span></span>
          </div>
          <button class="btn-compare" id="compareBtn" type="button"><span>Compare all</span><span class="bi">${ICON.grid}</span></button>
        </div>
        <div class="feats">${rows}${hint}</div>
      </div>`;
    if (!animate) $$('.feat,.rl-th,.cell-hint', $('#detail')).forEach((e) => (e.style.animation = 'none'));
  }

  /* ---------- select ---------- */
  function select(id, opts) {
    opts = opts || {};
    const l = LK.byId(id); if (!l) return;
    const changed = state.id !== id;
    state.id = id;
    $$('.card', $('#track')).forEach((c) => {
      const on = c.dataset.id === id, hit = $('.card-hit', c);
      c.classList.toggle('is-sel', on);
      hit.setAttribute('aria-pressed', on ? 'true' : 'false');
      hit.tabIndex = on ? 0 : -1;
    });
    paintHero(l, changed);
    renderDetail(l, true);
    updateCmpSel();
    if (opts.scroll !== false) ensureVisible($(`.card[data-id="${id}"]`));
    if (opts.focus) { const h = $(`.card[data-id="${id}"] .card-hit`); if (h) h.focus({ preventScroll: true }); }
  }
  function step(dir) {
    const i = lenses.findIndex((l) => l.id === state.id);
    const n = Math.max(0, Math.min(lenses.length - 1, i + dir));
    if (n === i) return;
    const inTrack = document.activeElement && document.activeElement.closest && document.activeElement.closest('#track');
    select(lenses[n].id, { focus: !!inTrack });
  }

  /* ---------- carousel ---------- */
  const track = $('#track');
  function maxScroll() { return track.scrollWidth - track.clientWidth; }
  function updateEdges() {
    const s = track.scrollLeft, m = maxScroll();
    track.classList.toggle('can-left', s > 4);
    track.classList.toggle('can-right', s < m - 4);
    const p = $('#prevBtn'), n = $('#nextBtn');
    p.setAttribute('aria-disabled', s <= 4 ? 'true' : 'false');
    n.setAttribute('aria-disabled', s >= m - 4 ? 'true' : 'false');
  }
  function ensureVisible(card) {
    if (!card) return;
    const tr = track.getBoundingClientRect(), cr = card.getBoundingClientRect(), pad = 12;
    let d = 0;
    if (cr.left < tr.left + pad) d = cr.left - tr.left - pad;
    else if (cr.right > tr.right - pad) d = cr.right - tr.right + pad;
    if (d) track.scrollBy({ left: d, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  function cardStops() {
    const tr = track.getBoundingClientRect();
    return $$('.card', track).map((c) => c.getBoundingClientRect().left - tr.left + track.scrollLeft - 16);
  }
  function initCarousel() {
    const setVw = () => track.style.setProperty('--vw', track.clientWidth + 'px');
    setVw();
    if (window.ResizeObserver) new ResizeObserver(() => { setVw(); updateEdges(); }).observe(track);
    addEventListener('resize', () => { setVw(); updateEdges(); });
    track.addEventListener('scroll', updateEdges, { passive: true });
    $('#prevBtn').addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * 0.72, behavior: 'smooth' }));
    $('#nextBtn').addEventListener('click', () => track.scrollBy({ left: track.clientWidth * 0.72, behavior: 'smooth' }));

    let suppress = false;
    track.addEventListener('click', (e) => {
      if (suppress) { e.preventDefault(); e.stopPropagation(); return; }
      const ad = e.target.closest('[data-addon]');
      if (ad) { openPhoto(LK.byId(ad.dataset.addon), ad); return; }
      const hit = e.target.closest('.card-hit');
      if (hit) select(hit.parentElement.dataset.id, { scroll: true });
    }, true);

    // mouse drag (touch uses native momentum scrolling)
    let drag = null;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = { x: e.clientX, left: track.scrollLeft, moved: false, lx: e.clientX, lt: performance.now(), v: 0 };
    });
    addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 6) { drag.moved = true; track.classList.add('dragging'); }
      if (!drag.moved) return;
      const now = performance.now(), dt = Math.max(1, now - drag.lt);
      drag.v = 0.8 * drag.v + 0.2 * ((e.clientX - drag.lx) / dt);
      drag.lx = e.clientX; drag.lt = now;
      track.scrollLeft = drag.left - dx;
    });
    const end = () => {
      if (!drag) return;
      const d = drag; drag = null;
      if (!d.moved) return;
      suppress = true; setTimeout(() => (suppress = false), 60);
      const stops = cardStops();
      const proj = track.scrollLeft - d.v * 260;
      const target = Math.max(0, Math.min(maxScroll(), stops.reduce((b, s) => (Math.abs(s - proj) < Math.abs(b - proj) ? s : b), stops[0])));
      track.scrollTo({ left: target, behavior: reduceMotion ? 'auto' : 'smooth' });
      let done = false;
      const fin = () => { if (done) return; done = true; track.classList.remove('dragging'); };
      track.addEventListener('scrollend', fin, { once: true });
      setTimeout(fin, 650);
    };
    addEventListener('pointerup', end);
    addEventListener('pointercancel', end);

    // vertical wheel -> horizontal on desktop
    track.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && !e.ctrlKey && matchMedia('(min-width:901px)').matches) {
        e.preventDefault();
        track.scrollLeft += e.deltaY;
      }
    }, { passive: false });
    updateEdges();
  }

  /* ---------- real-life lightbox ---------- */
  const lb = { open: false, list: [], i: 0, ret: null };
  function featClip(l, f) {
    const lvl = l.f[f.id], c = LK.clips[f.id];
    let status, off = false;
    if (lvl === 2) status = `${ticks(2)}<span><b>Best level</b> in ${l.x}X ${l.name}</span>`;
    else if (lvl === 1) status = `${ticks(1)}<span><b>Included</b> in ${l.x}X ${l.name}</span>`;
    else { off = true; const fl = fromLabel(f.id, l); status = `${ticks(0)}<span><b>Not in ${l.x}X ${l.name}</b>${fl ? ` · comes with ${fl}` : ''}</span>`; }
    return { key: f.id, title: c.title || f.label, blurb: f.blurb, status, off, src: clipSrc(c), poster: clipPoster(c) };
  }
  function openFeature(fid, scope, from) {
    const l = LK.byId(state.id);
    const fs = scope === 'included' ? LK.included(l) : features;
    const list = fs.map((f) => featClip(l, f));
    openLb(list, Math.max(0, fs.findIndex((f) => f.id === fid)), from);
  }
  function openPhoto(l, from) {
    const c = LK.clips.photo;
    openLb([{ key: 'photo', title: c.title, blurb: `Optional add-on for ${l.x}X ${l.name}.`, status: `<span><b>Add-on ${plainAddon(l.addon)}</b> on top of ${LK.inr(l.price)}</span>`, off: false, src: clipSrc(c), poster: clipPoster(c) }], 0, from);
  }
  function showClip() {
    const it = lb.list[lb.i], v = $('#lbVideo');
    $('#lbEye').textContent = lb.list.length > 1 ? `See it in real life · ${lb.i + 1} of ${lb.list.length}` : 'See it in real life';
    $('#lbTitle').textContent = it.title;
    $('#lbBlurb').textContent = it.blurb;
    const st = $('#lbStatus'); st.innerHTML = it.status; st.classList.toggle('off', it.off);
    $('#lbNav').style.display = lb.list.length > 1 ? '' : 'none';
    $('#lbDots').innerHTML = lb.list.map((_, k) => `<i class="${k === lb.i ? 'on' : ''}"></i>`).join('');
    v.pause();
    v.poster = it.poster;
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
    v.preload = 'auto';
    const tryPlay = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    v.src = it.src;
    v.load();
    tryPlay();
    v.addEventListener('canplay', tryPlay, { once: true });
    popEl($('#lbTitle'));
  }
  function openLb(list, i, from) {
    lb.list = list; lb.i = i; lb.ret = from || document.activeElement; lb.open = true;
    const el = $('#lb'); el.hidden = false; void el.offsetWidth; el.classList.add('open');
    showClip();
    $('#lbClose').focus({ preventScroll: true });
  }
  function closeLb() {
    if (!lb.open) return;
    lb.open = false;
    const el = $('#lb'), v = $('#lbVideo');
    el.classList.remove('open'); v.pause();
    setTimeout(() => { if (!lb.open) { el.hidden = true; v.removeAttribute('src'); v.load(); } }, reduceMotion ? 0 : 240);
    if (lb.ret && document.contains(lb.ret)) lb.ret.focus({ preventScroll: true });
    else { const h = $(`.card[data-id="${state.id}"] .card-hit`); if (h) h.focus({ preventScroll: true }); }
  }
  function stepLb(d) { if (lb.list.length < 2) return; lb.i = (lb.i + d + lb.list.length) % lb.list.length; showClip(); }
  function initLb() {
    $('#lbClose').addEventListener('click', closeLb);
    $('#lb [data-close]').addEventListener('click', closeLb);
    $('#lbPrev').addEventListener('click', () => stepLb(-1));
    $('#lbNext').addEventListener('click', () => stepLb(1));
    $('#lbVideo').addEventListener('click', () => {
      const v = $('#lbVideo');
      if (v.paused) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause();
    });
    document.addEventListener('visibilitychange', () => {
      const v = $('#lbVideo');
      if (!lb.open) return;
      if (document.hidden) v.pause(); else { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
    });
  }

  /* ---------- compare ---------- */
  let cmpHov = -1;
  function buildCmp() {
    const L = lenses;
    const gcounts = LK.groups.map((g) => ({ g, n: L.filter((l) => l.group === g.id).length }));
    const colTag = (l) => (l.tags.includes('recommended') ? '<span class="chip chip-rec">Recommended</span>' : l.tags.includes('bestseller') ? '<span class="chip chip-best">Bestseller</span>' : l.tags.includes('free-lens') ? '<span class="chip chip-free">Free lens</span>' : '');
    const cell = (l, html, cls) => `<td class="${cls || ''}" data-l="${l.id}">${html}</td>`;
    const head = `<colgroup><col class="c0">${L.map(() => '<col>').join('')}</colgroup>
      <thead>
        <tr class="g-row"><th></th>${gcounts.map((x) => `<th colspan="${x.n}">${x.g.label}</th>`).join('')}</tr>
        <tr class="hd"><th></th>${L.map((l) => `<th class="lens" data-l="${l.id}" scope="col"><button class="col-btn" type="button" data-pick="${l.id}" aria-label="Show ${l.x}X ${lensName(l)}">
          <span class="col-tag">${colTag(l)}</span><span class="col-x">${l.x}X</span><span class="col-name">${lensName(l)}</span><span class="col-price">${LK.inr(l.price)}</span><span class="col-sel">Selected</span></button></th>`).join('')}</tr>
      </thead>`;
    const rows = [];
    rows.push(`<tr><th scope="row">Corridor</th>${L.map((l, i) => cell(l, `<div class="bar"><i style="width:${(l.x / maxX) * 100}%;animation-delay:${i * 40}ms"></i></div>`)).join('')}</tr>`);
    rows.push(`<tr><th scope="row">Lens index</th>${L.map((l) => cell(l, LK.indexText(l).replace('Upto ', 'up to ').replace(' index', ''))).join('')}</tr>`);
    features.forEach((f) => {
      rows.push(`<tr><th scope="row">${f.label}</th>${L.map((l) => {
        const note = l.note && l.note[f.id];
        return cell(l, note ? `<span class="noteTxt">${note}</span>` : l.f[f.id] ? ticks(l.f[f.id]) : '<span class="dash" aria-label="Not included"></span>');
      }).join('')}</tr>`);
    });
    rows.push(`<tr class="sep"><th scope="row">Photochromatic add-on</th>${L.map((l) => cell(l, `<b>${plainAddon(l.addon)}</b>`)).join('')}</tr>`);
    $('#cmpTable').innerHTML = `<table class="mx" aria-label="Compare all lenses">${head}<tbody>${rows.join('')}</tbody></table>`;
    $('#cmpCount').textContent = L.length;
    const tbl = $('#cmpTable');
    tbl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pick]'); if (!b) return;
      select(b.dataset.pick, { scroll: true });
      closeCmp();
    });
    tbl.addEventListener('mouseover', (e) => {
      const c = e.target.closest('[data-l]'); const id = c ? c.dataset.l : null;
      if (id === cmpHov) return; cmpHov = id;
      $$('[data-l]', tbl).forEach((x) => x.classList.toggle('is-hov', x.dataset.l === id));
    });
    tbl.addEventListener('mouseleave', () => { cmpHov = null; $$('.is-hov', tbl).forEach((x) => x.classList.remove('is-hov')); });
    updateCmpSel();
  }
  function updateCmpSel() {
    $$('#cmpTable [data-l]').forEach((x) => x.classList.toggle('is-sel', x.dataset.l === state.id));
  }
  function openCmp(from) {
    const el = $('#cmp'); el.hidden = false; el.dataset.ret = ''; void el.offsetWidth; el.classList.add('open');
    cmpRet = from || document.activeElement;
    if (matchMedia('(max-width:900px)').matches) document.body.style.overflow = 'hidden';
    $('#cmpScroll').scrollLeft = 0;
    $('#cmpClose').focus({ preventScroll: true });
  }
  let cmpRet = null;
  function closeCmp() {
    const el = $('#cmp'); if (el.hidden) return;
    el.classList.remove('open'); document.body.style.overflow = '';
    setTimeout(() => { if (!el.classList.contains('open')) el.hidden = true; }, reduceMotion ? 0 : 260);
    const target = cmpRet && document.contains(cmpRet) ? cmpRet : $('#compareBtn');
    if (target) target.focus({ preventScroll: true });
  }

  /* ---------- wiring ---------- */
  function initFooter() {
    const f = LK.facts;
    const html = `<span>${f.fitting}</span><span>${f.warranty}</span><span>${f.code}</span>`;
    $('#footFacts').innerHTML = html; $('#cmpFacts').innerHTML = html;
    $$('.gold').forEach((g) => (g.innerHTML = `<b>${f.offer.name}</b><span>${f.offer.text}</span>`));
    $('#rateCut span').textContent = f.rateCut;
  }
  function trapTab(e, root) {
    if (e.key !== 'Tab') return;
    const f = $$('button:not([disabled]),[href],[tabindex]:not([tabindex="-1"])', root).filter((x) => x.offsetParent !== null || x === document.activeElement);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function initEvents() {
    $('#detail').addEventListener('click', (e) => {
      const f = e.target.closest('[data-f]'); if (f) return openFeature(f.dataset.f, 'all', f);
      const r = e.target.closest('[data-rl]'); if (r) return openFeature(r.dataset.rl, 'included', r);
      const a = e.target.closest('[data-addon]'); if (a) return openPhoto(LK.byId(state.id), a);
      const n = e.target.closest('[data-next]'); if (n) return select(n.dataset.next, { scroll: true });
      if (e.target.closest('#compareBtn')) openCmp(e.target.closest('#compareBtn'));
    });
    $('#cmpClose').addEventListener('click', closeCmp);
    document.addEventListener('keydown', (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (lb.open) {
        if (e.key === 'Escape') { e.preventDefault(); closeLb(); }
        else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); stepLb(1); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); stepLb(-1); }
        else trapTab(e, $('#lb'));
        return;
      }
      const cmpOpen = !$('#cmp').hidden && $('#cmp').classList.contains('open');
      if (cmpOpen && e.key === 'Escape') { e.preventDefault(); closeCmp(); return; }
      if (cmpOpen && e.key === 'Tab') return trapTab(e, $('#cmp'));
      const t = e.target;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
      else if (e.key === 'Home' && !(t && t.closest && t.closest('.cmp-scroll'))) { e.preventDefault(); select(lenses[0].id); }
      else if (e.key === 'End') { e.preventDefault(); select(lenses[lenses.length - 1].id); }
      else if ((e.key === 'c' || e.key === 'C') && !cmpOpen) { openCmp(document.activeElement); }
    });
  }

  /* ---------- boot ---------- */
  buildTrack();
  buildCmp();
  initFooter();
  initHero();
  initCarousel();
  initLb();
  initEvents();
  select(state.id, { scroll: false });
  // make sure the default lens is on screen on first paint
  requestAnimationFrame(() => requestAnimationFrame(() => { ensureVisible($(`.card[data-id="${state.id}"]`)); updateEdges(); }));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateEdges);
  window.__v1 = { select, state, openCmp, closeCmp, tiles: () => tiles, hero: () => hero };
})();
