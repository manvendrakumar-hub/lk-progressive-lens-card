/* Corridor motion component.
   A bright real-life scene sweeps side to side (the wearer turning their head). Only the corridor
   zone of the lens stays sharp, the sides are soft. setX() morphs the sharp zone (1X narrow ... 10X wide).
   Usage: const c = Corridor.mount(el, { x: 5, scene: 'road_day', guide: true, chip: true, pan: true });
          c.setX(7); c.setScene('street_day'); c.setPan(false); c.destroy();
   `el` needs a size (CSS width/height or aspect-ratio). Needs ../shared/corridor.css and assets/scenes/. */
(function () {
  const script = document.currentScript;
  const SCENE_BASE = new URL('../assets/scenes/', script ? script.src : location.href).href;
  const SCENES = {
    road_day:      { aspect: 2048 / 896 },
    street_day:    { aspect: 2048 / 896 },
    desk_day:      { aspect: 2048 / 896 },
    road_corridor: { aspect: 1536 / 864 },
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // half-width of the sharp zone at the waist, as a fraction of the container width
  const W_TABLE = [[1, 0.075], [2, 0.115], [3, 0.155], [5, 0.225], [7, 0.29], [10, 0.385]];
  function widthFor(x) {
    if (x <= W_TABLE[0][0]) return W_TABLE[0][1];
    for (let i = 1; i < W_TABLE.length; i++) {
      const [x1, w1] = W_TABLE[i], [x0, w0] = W_TABLE[i - 1];
      if (x <= x1) return w0 + ((x - x0) / (x1 - x0)) * (w1 - w0);
    }
    return W_TABLE[W_TABLE.length - 1][1];
  }
  const f = (n) => (Math.round(n * 10000) / 10000).toString();
  // hourglass: wide distance zone on top, narrow corridor in the middle, wider near zone at the bottom
  function pathD(w, k) {
    const t = Math.min(0.5, w + 0.17), b = Math.min(0.5, w + 0.22);
    const L = (v) => f(0.5 - v), R = (v) => f(0.5 + v);
    return `M${L(t)} 0L${R(t)} 0C${R(t)} .28 ${R(w)} .3 ${R(w)} .5C${R(w)} .7 ${R(b)} .72 ${R(b)} 1L${L(b)} 1C${L(b)} .72 ${L(w)} .7 ${L(w)} .5C${L(w)} .3 ${L(t)} .28 ${L(t)} 0Z`;
  }
  const scaled = (d) => d.replace(/-?\d*\.?\d+/g, (m) => f(parseFloat(m) * 100));

  let uid = 0;
  const live = new Set();
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!document.hidden) live.forEach((c) => c._tick(dt));
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  function mount(el, opts) {
    opts = Object.assign({ x: 5, scene: 'road_day', guide: true, chip: false, pan: true }, opts || {});
    const id = ++uid;
    el.classList.add('cx');
    el.innerHTML =
      `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>` +
      `<clipPath id="cxs-${id}" clipPathUnits="objectBoundingBox"><path/></clipPath>` +
      `<clipPath id="cxm-${id}" clipPathUnits="objectBoundingBox"><path/></clipPath></defs></svg>` +
      `<div class="cx-layer"><img class="cx-img" alt="" draggable="false" decoding="async"></div>` +
      `<div class="cx-layer cx-l-mid"><img class="cx-img" alt="" draggable="false" decoding="async"></div>` +
      `<div class="cx-layer cx-l-sharp"><img class="cx-img" alt="" draggable="false" decoding="async"></div>` +
      (opts.guide
        ? `<svg class="cx-guide" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="cx-outline-glow"/><path class="cx-outline"/></svg><div class="cx-arrow" aria-hidden="true"><i></i></div>`
        : '') +
      (opts.chip ? `<div class="cx-chip"></div>` : '');
    el.style.setProperty('--cx-clip-sharp', `url(#cxs-${id})`);
    el.style.setProperty('--cx-clip-mid', `url(#cxm-${id})`);

    const imgs = el.querySelectorAll('.cx-img');
    const pS = el.querySelector(`#cxs-${id} path`), pM = el.querySelector(`#cxm-${id} path`);
    const gGlow = el.querySelector('.cx-outline-glow'), gLine = el.querySelector('.cx-outline');
    const arrow = el.querySelector('.cx-arrow'), chip = el.querySelector('.cx-chip');

    const st = { x: opts.x, w: widthFor(opts.x), target: widthFor(opts.x), scene: opts.scene, pan: opts.pan && !reduce,
                 t: Math.random() * 20, A: 0, W: 0, H: 0, visible: true, panPx: 0 };

    function setScene(name) {
      if (!SCENES[name]) name = 'road_day';
      st.scene = name;
      const base = SCENE_BASE + name;
      imgs[0].src = base + '_b2.jpg'; imgs[1].src = base + '_b1.jpg'; imgs[2].src = base + '.jpg';
      layout();
    }
    function layout() {
      const W = el.clientWidth, H = el.clientHeight;
      if (!W || !H) return;
      st.W = W; st.H = H;
      const aspect = SCENES[st.scene].aspect;
      const ih = Math.max(H, (W * 1.18) / aspect), iw = ih * aspect;
      imgs.forEach((im) => { im.style.width = f(iw) + 'px'; im.style.height = f(ih) + 'px'; });
      st.A = Math.min((iw - W) / 2, W * 0.34) * 0.92;
      paintShape(true);
    }
    function paintShape(force) {
      const w = st.w;
      const dS = pathD(w), dM = pathD(Math.min(0.5, w * 1.5 + 0.035));
      pS.setAttribute('d', dS); pM.setAttribute('d', dM);
      if (gLine) { const d = scaled(dS); gLine.setAttribute('d', d); gGlow.setAttribute('d', d); }
      if (arrow && st.W) arrow.style.width = Math.max(26, 2 * w * st.W * 0.86) + 'px';
    }
    function label() { if (chip) chip.textContent = typeof opts.chip === 'string' ? opts.chip : `Sharp zone · ${st.x}X`; }
    label();

    const api = {
      el, opts,
      setX(x) { st.x = x; st.target = widthFor(x); label(); if (reduce) { st.w = st.target; paintShape(); } },
      setScene, setPan(on) { st.pan = !!on && !reduce; if (!st.pan) el.style.setProperty('--cx-pan', '0px'); },
      destroy() { live.delete(api); io.disconnect(); ro.disconnect(); el.innerHTML = ''; el.classList.remove('cx'); },
      _tick(dt) {
        if (!st.visible) return;
        if (Math.abs(st.target - st.w) > 0.0003) {
          st.w += (st.target - st.w) * (1 - Math.exp(-dt * 6.5));
          paintShape();
        }
        if (st.pan && st.A) {
          st.t += dt;
          const p = Math.sin((st.t / 9) * Math.PI * 2) * 0.82 + Math.sin((st.t / 3.7) * Math.PI * 2 + 1.3) * 0.18;
          st.panPx = p * st.A;
          el.style.setProperty('--cx-pan', st.panPx.toFixed(1) + 'px');
        }
      },
    };
    const ro = new ResizeObserver(layout); ro.observe(el);
    const io = new IntersectionObserver((e) => { st.visible = e[0].isIntersecting; }, { rootMargin: '120px' }); io.observe(el);
    setScene(opts.scene);
    live.add(api);
    return api;
  }

  window.Corridor = { mount, widthFor, scenes: Object.keys(SCENES) };
})();
