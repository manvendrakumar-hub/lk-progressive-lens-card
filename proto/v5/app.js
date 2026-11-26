(function () {
  /* The seven lenses of the Figma "New Price Card Design" (node 1440:36415). Both 1X lenses share the 1X animation.
     Every GIF / Lottie is the 150 x 90 strip, exactly the size of the slot on the card. */
  var LENSES = [
    { x: 1,  view: 'Normal View',     name: 'Lenskart Anti-Glare',        index: '1.56', slug: 'lenskart-anti-glare' },
    { x: 1,  view: 'Normal View',     name: 'Lenskart BLU',               index: '1.56', slug: 'lenskart-blu' },
    { x: 2,  view: 'Normal View',     name: 'Lenskart BLU Thin',          index: '1.67', slug: 'lenskart-blu-thin' },
    { x: 3,  view: 'Normal View',     name: 'Lenskart BLU+ Thin',         index: '1.67', slug: 'lenskart-blu-plus-thin' },
    { x: 5,  view: 'Wide View',       name: 'Owndays Japan iShield BLU+', index: '1.56', slug: 'owndays-japan-ishield-blu-plus' },
    { x: 7,  view: 'Wider+ Adaptive', name: 'Owndays Japan BLU Thin',     index: '1.74', slug: 'owndays-japan-blu-thin' },
    { x: 10, view: 'AI Adaptive View', name: 'Rodenstock or Tokai Japan', index: '1.67', slug: 'rodenstock-or-tokai-japan' }
  ];
  var viewSlug = function (v) { return v.toLowerCase().replace(/\+/g, '-plus').replace(/\s+/g, '-'); };
  var base = function (l) { return l.x + 'x-' + viewSlug(l.view) + '-' + l.index + '-index-' + l.slug; };

  var grid = document.getElementById('grid');
  grid.innerHTML = LENSES.map(function (l, i) {
    var b = base(l);
    return '<article class="card">' +
      '<div><div class="x">' + l.x + 'X</div><div class="v">' + l.view + '</div><div class="n">' + l.name + ' · ' + l.index + ' index</div></div>' +
      '<div class="gifbox" data-i="' + i + '"><img data-src="gifs/view-' + l.x + 'x.gif" width="150" height="90" alt="' + l.x + 'X corridor animation, ' + l.name + '" draggable="false"><div class="lot" aria-hidden="true"></div></div>' +
      '<div class="btns">' +
        '<a class="btn" href="gifs/dl/' + b + '.gif" download="' + b + '.gif" aria-label="Download GIF: ' + l.name + ', ' + l.x + 'X">Download GIF</a>' +
        '<a class="btn btn--ghost" href="lottie/dl/' + b + '.json" download="' + b + '.json" aria-label="Download Lottie: ' + l.name + ', ' + l.x + 'X">Download Lottie</a>' +
      '</div>' +
      '</article>';
  }).join('');

  var boxes = Array.prototype.slice.call(grid.querySelectorAll('.gifbox'));
  var imgs = boxes.map(function (b) { return b.querySelector('img'); });
  var anims = [], lottieReady = false, mode = 'gif';

  /* ---- start everything at the same instant ----
     GIFs begin playing when each image is decoded, so we load them all first, then (re)assign every src in one
     synchronous pass. A new fragment makes the browser start a fresh animation from frame 0 without re-downloading. */
  function restartGifs() {
    var t = Date.now();
    imgs.forEach(function (im) { im.src = im.dataset.src + '#' + t; });
  }
  function restartLottie() { anims.forEach(function (a) { a.goToAndPlay(0, true); }); }
  function restartAll() { restartGifs(); if (lottieReady) restartLottie(); }

  Promise.all(imgs.map(function (im) {
    return new Promise(function (res) { im.addEventListener('load', res, { once: true }); im.addEventListener('error', res, { once: true }); im.src = im.dataset.src; });
  })).then(function () { requestAnimationFrame(restartAll); });

  document.addEventListener('visibilitychange', function () { if (!document.hidden) restartAll(); });
  window.addEventListener('focus', restartAll);

  /* ---- Lottie preview (lottie-web, loaded lazily the first time you switch) ---- */
  function loadLottie() {
    if (anims.length || !window.lottie) return Promise.resolve();
    return Promise.all(boxes.map(function (box, i) {
      return new Promise(function (res) {
        var a = lottie.loadAnimation({
          container: box.querySelector('.lot'), renderer: 'svg', loop: true, autoplay: false,
          path: 'lottie/view-' + LENSES[i].x + 'x.json',
          rendererSettings: { preserveAspectRatio: 'xMidYMid slice', progressiveLoad: false }
        });
        anims[i] = a;
        a.addEventListener('DOMLoaded', res); a.addEventListener('data_failed', res);
      });
    })).then(function () { lottieReady = true; });
  }
  var seg = document.querySelector('.seg');
  seg.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    mode = b.dataset.mode;
    Array.prototype.forEach.call(seg.querySelectorAll('button'), function (x) { x.setAttribute('aria-checked', String(x === b)); });
    if (mode === 'lottie') {
      loadLottie().then(function () { boxes.forEach(function (bx) { bx.classList.add('is-lottie'); }); restartLottie(); });
    } else { boxes.forEach(function (bx) { bx.classList.remove('is-lottie'); }); restartGifs(); }
  });
  window.__v5 = { restartAll: restartAll, anims: anims };
})();
