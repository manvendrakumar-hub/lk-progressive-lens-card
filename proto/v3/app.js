/* V3 · Corridor diagram. Plain JS, no build step. Data comes only from window.LK. */
(function () {
  'use strict';
  const LK = window.LK;
  const L = LK.lenses;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const root = document.documentElement;
  const NS = 'http://www.w3.org/2000/svg';
  const upto = (s) => s.replace(/^Upto /, 'up to ');
  const restart = (el) => { if (!el || reduce) return; el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); };

  /* ---------- layout scale: design is 1920x1080, everything scales with --u ---------- */
  function setU() {
    const w = innerWidth, h = innerHeight;
    const u = w < 900 ? 1 : Math.max(0.52, Math.min(1.5, Math.min(h / 1080, w / 1920)));
    root.style.setProperty('--u', u.toFixed(3));
  }
  setU();
  addEventListener('resize', setU);

  /* ---------- lens outline diagram (animated SVG) ---------- */
  const widthTop = (x) => { const t = (Math.min(10, Math.max(1, x)) - 1) / 9; return 30 + 116 * Math.pow(t, 0.9); };
  const waistRatio = (x) => { const t = (Math.min(10, Math.max(1, x)) - 1) / 9; return 0.62 + 0.34 * t; };
  const YT = 26, YB = 100, CY = 63, CX = 100;
  const n1 = (v) => (Math.round(v * 100) / 100);

  function lensMarkup() {
    return '<rect class="body" x="1" y="1" width="198" height="124" rx="54"/>' +
           '<path class="zfill"/><path class="zone"/><path class="arr"/>';
  }
  const vizs = [];
  const activeGroups = new Set(['lenses']);
  function makeViz(svg, x, group) {
    svg.setAttribute('viewBox', '0 0 200 126');
    svg.innerHTML = lensMarkup();
    const v = { svg, zone: svg.querySelector('.zone'), fill: svg.querySelector('.zfill'), arr: svg.querySelector('.arr'),
                cur: x, target: x, ph: Math.random() * 6.28, group: group || 'lenses' };
    vizs.push(v);
    draw(v, 0);
    return v;
  }
  function draw(v, t) {
    const b = reduce ? 0 : 1;
    const W = Math.min(160, widthTop(v.cur) * (1 + 0.035 * b * Math.sin(t * 1.5 + v.ph)));
    const Wm = W * waistRatio(v.cur) * (1 + 0.075 * b * Math.sin(t * 1.5 + v.ph + 0.7));
    const c = Wm - W / 2, l = CX - W / 2, r = CX + W / 2;
    const d = `M${n1(l)} ${YT}H${n1(r)}Q${n1(CX + c)} ${CY} ${n1(r)} ${YB}H${n1(l)}Q${n1(CX - c)} ${CY} ${n1(l)} ${YT}Z`;
    v.zone.setAttribute('d', d); v.fill.setAttribute('d', d);
    const half = Wm * 0.4 * (1 + 0.08 * b * Math.sin(t * 2.3 + v.ph * 1.7)), sh = 1.6 * b * Math.sin(t * 1.15 + v.ph);
    const a0 = CX - half + sh, a1 = CX + half + sh, h = 4;
    v.arr.setAttribute('d', `M${n1(a0)} ${CY}H${n1(a1)}M${n1(a0 + h)} ${CY - h}L${n1(a0)} ${CY}L${n1(a0 + h)} ${CY + h}M${n1(a1 - h)} ${CY - h}L${n1(a1)} ${CY}L${n1(a1 - h)} ${CY + h}`);
  }
  let lastT = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    if (!document.hidden) {
      const k = 1 - Math.exp(-dt * 5.5);
      for (const v of vizs) {
        if (!activeGroups.has(v.group)) continue;
        v.cur += (v.target - v.cur) * k;
        if (Math.abs(v.target - v.cur) < 0.002) v.cur = v.target;
        draw(v, now / 1000);
      }
    }
    requestAnimationFrame(loop);
  }
  function drawStatic() { vizs.forEach((v) => { v.cur = v.target; draw(v, 0); }); }
  if (!reduce) requestAnimationFrame(loop);

  /* ---------- state ---------- */
  const state = { id: 'l5', view: 'lenses' };
  const cur = () => LK.byId(state.id);
  let banner = null, bigViz = null;
  const cardViz = {}, cmpViz = {};

  /* ---------- static copy ---------- */
  $('#rateCut').textContent = LK.facts.rateCut;
  $('#gold').textContent = `${LK.facts.offer.name} · ${LK.facts.offer.text}`;
  $('#fFacts').textContent = `${LK.facts.fitting}  ·  ${LK.facts.warranty}`;
  $('#fCode').textContent = LK.facts.code;

  /* ---------- corridor scale + cards ---------- */
  const th = (u) => 0.8 + 7 * Math.pow(u / 8, 1.15);
  const op = (u) => (0.3 + 0.7 * (u / 8)).toFixed(2);
  const tagOf = (l) => (l.tags.includes('recommended') ? 'Recommended' : l.tags.includes('bestseller') ? 'Bestseller' : '');
  const cols = $('#cols');
  L.forEach((l, i) => {
    const a = th(i), b = th(i + 1);
    const seg = `<svg class="seg" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="sg${i}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000042" stop-opacity="${op(i)}"/><stop offset="1" stop-color="#000042" stop-opacity="${op(i + 1)}"/></linearGradient></defs>` +
      `<polygon fill="url(#sg${i})" points="0,${n1(6 - a / 2)} 100,${n1(6 - b / 2)} 100,${n1(6 + b / 2)} 0,${n1(6 + a / 2)}"/></svg>`;
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'col'; btn.setAttribute('role', 'radio'); btn.dataset.id = l.id;
    btn.setAttribute('aria-checked', 'false'); btn.tabIndex = -1;
    const tag = tagOf(l);
    btn.setAttribute('aria-label', `${l.x}X, ${l.brand} ${l.name}, ${LK.inr(l.price)}${tag ? ', ' + tag : ''}`);
    btn.innerHTML =
      `<span class="stop"><span class="xl">${l.x}X</span><span class="rail">${seg}<i class="pt"></i>` +
      (i === 0 ? '<span class="endl">Narrow</span>' : i === L.length - 1 ? '<span class="endl">Widest</span>' : '') + `</span></span>` +
      `<span class="tick"></span>` +
      `<span class="card">${tag ? `<span class="pill tag">${tag}</span>` : l.tags.includes('free-lens') ? '<span class="chip free tag">Free lens with 1 frame</span>' : ''}` +
      `<svg class="lens" aria-hidden="true"></svg>` +
      `<span class="c-brand">${l.brand}</span><span class="c-name">${l.name}</span><span class="c-view">${l.view}</span>` +
      `<span class="c-price">${LK.inr(l.price)}</span>` +
      `</span>`;
    cols.appendChild(btn);
    cardViz[l.id] = makeViz($('svg.lens', btn), l.x, 'lenses');
    btn.addEventListener('click', () => select(l.id, { focus: false }));
  });

  /* ---------- feature list ---------- */
  const fList = $('#fList');
  const playIcon = '<svg class="f-play" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M3 1.8v8.4L10 6z" fill="currentColor"/></svg>';
  LK.features.forEach((f) => {
    const li = document.createElement('li');
    li.innerHTML = `<button type="button" class="f-item" data-f="${f.id}" data-v="0"><i class="dot" data-v="0"></i><span class="f-label">${f.label}</span><span class="fchip" hidden></span>${playIcon}</button>`;
    fList.appendChild(li);
    $('.f-item', li).addEventListener('click', () => openLB(f.id, LK.features.map((x) => x.id)));
  });
  const rlLi = document.createElement('li');
  rlLi.className = 'rl-li';
  rlLi.innerHTML = '<div class="rl"><span class="eyebrow">Real life</span><div class="rl-row" id="rlRow"></div></div>';
  fList.appendChild(rlLi);
  const statusWord = ['Not included in this lens', 'Included', 'Enhanced'];
  function renderFeatures(l) {
    $$('.f-item', fList).forEach((b) => {
      const f = b.dataset.f, v = l.f[f];
      b.dataset.v = v; $('.dot', b).dataset.v = v;
      const chip = $('.fchip', b);
      let txt = '';
      if (f === 'smooth' && l.note.smooth) txt = l.note.smooth;
      if (f === 'driving' && l.nightDrive) txt = '+ Night Drive';
      chip.hidden = !txt; chip.textContent = txt;
      const meta = LK.features.find((x) => x.id === f);
      b.setAttribute('aria-label', `${meta.label}: ${statusWord[v]}${txt ? ', ' + txt : ''}. Play real-life clip`);
    });
  }
  function renderStrip(l) {
    const keys = ['clarity'].concat(LK.included(l).map((f) => f.id));
    const row = $('#rlRow'); row.innerHTML = '';
    keys.forEach((k, i) => {
      const c = LK.clips[k];
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'thumb'; b.title = c.title; b.setAttribute('aria-label', `Real life: ${c.title}`);
      b.style.animationDelay = (reduce ? 0 : i * 40) + 'ms';
      b.innerHTML = `<img src="../${c.poster}" alt="" loading="lazy" draggable="false">`;
      b.addEventListener('click', () => openLB(k, keys));
      row.appendChild(b);
    });
  }

  /* ---------- detail ---------- */
  const tw = {};
  function tween(el, to, fmt) {
    const from = el._v == null ? to : el._v; el._v = to;
    const tk = (el._tk = (el._tk || 0) + 1);
    if (reduce || from === to) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 650;
    (function step(now) {
      if (el._tk !== tk) return;
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(Math.round((from + (to - from) * e) / 10) * 10 || to);
      if (k < 1) requestAnimationFrame(step); else el.textContent = fmt(to);
    })(t0);
  }
  function chipsHTML(l) {
    return (l.tags.includes('free-lens') ? '<span class="chip free">Free lens with 1 frame</span>' : '') +
      (l.warranty ? `<span class="chip" title="${LK.facts.warranty}">100 Days warranty</span>` : '') +
      (l.nightDrive ? '<span class="chip night">+ Night Drive</span>' : '');
  }
  function renderDetail(l) {
    const tag = tagOf(l);
    $('#dPill').innerHTML = tag ? `<span class="pill">${tag}</span>` : '';
    $('#dX').textContent = `${l.x}X`;
    $('#dBrand').textContent = l.brand;
    $('#dName').textContent = l.name;
    $('#dSub').textContent = `${l.view}  ·  ${upto(LK.indexText(l))}`;
    $('#dChips').innerHTML = chipsHTML(l);
    tween($('#dPrice'), l.price, LK.inr);
    tween($('#dAddonV'), l.addon, (n) => '+' + LK.inr(n));
    ['#dPill', '.d-eyebrow', '#dName', '#dSub', '#dChips'].forEach((s) => restart($(s)));
    $('#sr').textContent = `${l.x}X ${l.brand} ${l.name}, ${LK.inr(l.price)}, photochromatic add-on plus ${LK.inr(l.addon)}.`;
  }

  /* ---------- selection ---------- */
  function select(id, opt) {
    opt = opt || {};
    const prev = cur(), l = LK.byId(id);
    if (!l) return;
    const changed = id !== state.id;
    state.id = id;
    $$('.col', cols).forEach((b) => {
      const on = b.dataset.id === id;
      b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1;
      $('svg.lens', b).classList.toggle('on', on);
      if (on && opt.focus) b.focus({ preventScroll: true });
    });
    const sb = $(`.col[data-id="${id}"]`, cols);
    if (matchMedia('(max-width:899px)').matches && !opt.init) sb.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
    if (changed || opt.init) {
      if (!opt.init && !reduce) { cardViz[id].cur = prev.x; bigViz.cur = prev.x; }
      bigViz.target = l.x;
      if (reduce) drawStatic();
      renderDetail(l); renderFeatures(l); renderStrip(l);
      if (banner) banner.setX(l.x);
      $$('[data-c]', $('#mx')).forEach((c) => c.classList.toggle('sel', c.dataset.c === id));
    }
  }
  const step = (d) => {
    const i = L.findIndex((x) => x.id === state.id), j = Math.max(0, Math.min(L.length - 1, i + d));
    if (j !== i) select(L[j].id, { focus: !!document.activeElement && document.activeElement.classList.contains('col') });
  };

  /* ---------- compare matrix ---------- */
  function buildCompare() {
    const mx = $('#mx');
    const dotCell = (v) => `<i class="dot" data-v="${v}"></i>`;
    let h = '<colgroup><col class="lab">' + L.map(() => '<col>').join('') + '</colgroup><thead>';
    h += '<tr><th class="grp blank" scope="col"><span></span></th><th class="grp" colspan="5"><span>Everyday progressive lenses</span></th><th class="grp" colspan="3"><span>Special purpose lenses</span></th></tr>';
    h += '<tr><th scope="col"></th>' + L.map((l) => {
      const tag = tagOf(l);
      return `<th class="hc" scope="col" data-c="${l.id}">${tag ? `<span class="pill tagc">${tag}</span>` : ''}` +
        `<button type="button" class="hbtn" data-id="${l.id}" aria-label="Select ${l.x}X ${l.brand} ${l.name}"><span class="hx">${l.x}X</span><span class="hb">${l.brand}</span><span class="hn">${l.name}</span></button></th>`;
    }).join('') + '</tr></thead><tbody>';
    h += '<tr><th class="rl-lab" scope="row"><span class="lab-t">Corridor</span><span class="lab-s">Width of the sharp zone</span></th>' +
      L.map((l) => `<td data-c="${l.id}"><svg class="lens" data-id="${l.id}" aria-hidden="true"></svg></td>`).join('') + '</tr>';
    h += '<tr><th class="rl-lab" scope="row"><span class="lab-t">Price</span></th>' + L.map((l) => `<td data-c="${l.id}"><span class="pr">${LK.inr(l.price)}</span></td>`).join('') + '</tr>';
    LK.features.forEach((f) => {
      h += `<tr><th class="rl-lab" scope="row"><button type="button" class="f-item mxf" data-f="${f.id}" style="border:0;padding:0" aria-label="${f.label}: play real-life clip"><span class="f-label" style="opacity:1;font-weight:500">${f.label}</span>${playIcon}</button></th>` +
        L.map((l) => {
          const v = l.f[f.id];
          let extra = '';
          if (f.id === 'smooth' && l.note.smooth) extra = `<span class="fa" style="margin-left:7px">${l.note.smooth}</span>`;
          if (f.id === 'driving' && l.nightDrive) extra = '<span class="nd">+ Night Drive</span>';
          return `<td data-c="${l.id}"><span class="cell-in" role="img" aria-label="${statusWord[v]}">${dotCell(v)}${extra}</span></td>`;
        }).join('') + '</tr>';
    });
    h += '<tr><th class="rl-lab" scope="row"><span class="lab-t">Photochromatic coating</span><span class="lab-s">Add-on, per lens</span></th>' +
      L.map((l) => `<td data-c="${l.id}"><span class="ad">+${LK.inr(l.addon)}</span></td>`).join('') + '</tr></tbody>';
    mx.innerHTML = h;
    $$('svg.lens', mx).forEach((s) => { const l = LK.byId(s.dataset.id); cmpViz[l.id] = makeViz(s, l.x, 'compare'); });
    $$('.hbtn', mx).forEach((b) => b.addEventListener('click', () => { select(b.dataset.id); setView('lenses'); const c = $(`.col[data-id="${b.dataset.id}"]`, cols); if (c) c.focus({ preventScroll: true }); }));
    $$('.mxf', mx).forEach((b) => b.addEventListener('click', () => openLB(b.dataset.f, LK.features.map((x) => x.id))));
    mx.addEventListener('mouseover', (e) => {
      const c = e.target.closest('[data-c]'); const id = c && c.dataset.c;
      $$('.hov', mx).forEach((x) => x.classList.remove('hov'));
      if (id) $$(`[data-c="${id}"]`, mx).forEach((x) => x.classList.add('hov'));
    });
    mx.addEventListener('mouseleave', () => $$('.hov', mx).forEach((x) => x.classList.remove('hov')));
  }

  /* ---------- views ---------- */
  function setView(v) {
    state.view = v;
    document.body.dataset.view = v;
    const cmp = v === 'compare';
    $('#viewCompare').hidden = !cmp;
    $('#cmpBtn').setAttribute('aria-pressed', cmp);
    $('#cmpLabel').textContent = cmp ? 'Back to lenses' : 'Compare';
    activeGroups.clear(); activeGroups.add(cmp ? 'compare' : 'lenses');
    if (reduce) drawStatic();
    try { history.replaceState(null, '', cmp ? '#compare' : location.pathname + location.search); } catch (e) { /* file:// etc. */ }
    scrollTo(0, 0);
  }
  $('#cmpBtn').addEventListener('click', () => setView(state.view === 'compare' ? 'lenses' : 'compare'));

  /* ---------- lightbox (real-life clips) ---------- */
  const lb = $('#lb'), vid = $('#lbVideo');
  let lbItems = [], lbIdx = 0, lbReturn = null;
  function lbRender() {
    const key = lbItems[lbIdx], c = LK.clips[key], l = cur();
    const feat = LK.features.find((f) => f.id === key);
    $('#lbTitle').textContent = c.title;
    $('#lbEyebrow').textContent = 'In real life';
    let st = '', blurb = '';
    if (feat) {
      const v = l.f[key];
      st = `<span class="chip"><i class="dot" data-v="${v}" style="margin-right:8px"></i>${statusWord[v]}</span>` + (key === 'driving' && l.nightDrive ? ' <span class="chip night">+ Night Drive</span>' : '');
      blurb = feat.blurb;
    } else if (key === 'photo') {
      st = `<span class="chip">Add-on, ${LK.inr(l.addon)} per lens</span>`;
    }
    $('#lbStatus').innerHTML = st;
    $('#lbBlurb').textContent = blurb;
    $('#lbCount').textContent = `${lbIdx + 1} / ${lbItems.length}`;
    $('#lbPrev').style.visibility = $('#lbNext').style.visibility = lbItems.length > 1 ? 'visible' : 'hidden';
    $('#lbCount').style.visibility = lbItems.length > 1 ? 'visible' : 'hidden';
    vid.poster = '../' + c.poster;
    vid.muted = true; vid.defaultMuted = true; vid.loop = true; vid.playsInline = true; vid.autoplay = true;
    vid.setAttribute('muted', ''); vid.setAttribute('playsinline', ''); vid.setAttribute('webkit-playsinline', '');
    vid.preload = 'auto';
    const tryPlay = () => { const p = vid.play(); if (p && p.catch) p.catch(() => {}); };
    vid.src = '../' + c.src;
    vid.load();
    tryPlay();
    vid.addEventListener('canplay', tryPlay, { once: true });
  }
  function openLB(key, items) {
    lbItems = items && items.includes(key) ? items : [key];
    lbIdx = lbItems.indexOf(key);
    lbReturn = document.activeElement;
    lb.hidden = false;
    lbRender();
    requestAnimationFrame(() => { lb.classList.add('open'); $('#lbClose').focus({ preventScroll: true }); });
  }
  function closeLB() {
    if (lb.hidden) return;
    lb.classList.remove('open');
    vid.pause();
    setTimeout(() => { lb.hidden = true; vid.removeAttribute('src'); vid.load(); }, reduce ? 0 : 260);
    if (lbReturn && lbReturn.focus) lbReturn.focus({ preventScroll: true });
  }
  const lbStep = (d) => { lbIdx = (lbIdx + d + lbItems.length) % lbItems.length; lbRender(); };
  $('#lbClose').addEventListener('click', closeLB);
  $('.lb-back', lb).addEventListener('click', closeLB);
  $('#lbPrev').addEventListener('click', () => lbStep(-1));
  $('#lbNext').addEventListener('click', () => lbStep(1));
  vid.addEventListener('click', () => {
    if (vid.paused) { const p = vid.play(); if (p && p.catch) p.catch(() => {}); } else vid.pause();
  });
  document.addEventListener('visibilitychange', () => {
    if (lb.hidden) return;
    if (document.hidden) vid.pause(); else { const p = vid.play(); if (p && p.catch) p.catch(() => {}); }
  });
  $('#dAddon').addEventListener('click', () => openLB('photo', ['photo']));

  /* ---------- keyboard ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (!lb.hidden) {
      if (e.key === 'Escape') { e.preventDefault(); closeLB(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); lbStep(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); lbStep(-1); }
      else if (e.key === 'Tab') {
        const f = [$('#lbPrev'), $('#lbNext'), $('#lbClose')].filter((b) => b.style.visibility !== 'hidden');
        const i = f.indexOf(document.activeElement);
        e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); step(-1); }
    else if (e.key === 'Escape' && state.view === 'compare') setView('lenses');
    else if ((e.key === 'c' || e.key === 'C') && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) setView(state.view === 'compare' ? 'lenses' : 'compare');
  });

  /* ---------- banner (shared Corridor component) ---------- */
  bigViz = makeViz($('#bigLens'), cur().x, 'lenses');
  buildCompare();
  if (window.Corridor) {
    banner = Corridor.mount($('#banner'), { x: cur().x, scene: 'road_day', guide: true, chip: true, pan: true });
  }
  $$('[data-scene]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-scene]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    if (banner) banner.setScene(b.dataset.scene);
  }));
  $('#panBtn').addEventListener('click', (e) => {
    const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
    e.currentTarget.setAttribute('aria-pressed', on);
    if (banner) banner.setPan(on);
  });

  /* ---------- go ---------- */
  select(state.id, { init: true });
  if (matchMedia('(max-width:899px)').matches) {
    const bs = $('#bandScroll'), sb = $(`.col[data-id="${state.id}"]`, cols);
    bs.scrollLeft = sb.offsetLeft - (bs.clientWidth - sb.offsetWidth) / 2;
  }
  if (location.hash === '#compare') setView('compare');
  window.__v3 = { select, setView, state };
})();
