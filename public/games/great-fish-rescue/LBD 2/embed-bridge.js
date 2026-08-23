/* ============================================================================
   embed-bridge.js — flipbook-integration bridge for the embedded LBD games.

   Loaded LAST in index.html, after the game's own script. Identical file in
   both game folders (it detects each game's button ids). Two jobs, both only
   when the game runs inside the flipbook's iframe — standalone play
   (window.parent === window) leaves the whole file inert.

   1. HANDSHAKE with the parent flipbook:
        start button tapped   → {source:'lbd', type:'lbd-start'}    host expands to fullscreen
        final "Next" tapped   → {source:'lbd', type:'lbd-complete'} host shrinks + advances the book
      Both buttons are hooked in the CAPTURE phase: the games' own click
      handlers run first in the bubble order and disable the button
      synchronously (LBD 2's letsGoBtn does exactly this), so a
      bubble-phase listener registered after them may never fire.

   2. IDLE CHUNKED ASSET WARM-UP. Sprites painted via CSS background-image on
      display:none screens are never fetched by the browser up front — that is
      the hidden cause of mid-game loading hitches. ~1s after boot (so the
      start screen wins the bandwidth race) this walks embed-assets.json —
      the flattened list of every image/audio path from the game's JS configs
      (PONDS / FISH_IMG / VO tables …), CSS url(...) rules and JS string
      literals — and warms them in small idle slices: ~3 images or 2 audio
      files per slice, requestIdleCallback with a setTimeout fallback for
      Safari. Images warm through Image() (HTTP cache + decoder); audio warms
      through a detached preload='auto' element (the same kind of element the
      games later play) PLUS a fetch() so the complete file is committed to
      HTTP cache even where the media element stops at its buffering
      heuristic. When the flipbook has already background-prefetched the
      files, every one of these is a fast cache hit.
   ============================================================================ */
(function () {
  'use strict';
  if (window.parent === window) return;   // standalone → completely inert

  /* ---------- 1. host handshake ---------- */
  function post(type) {
    try { window.parent.postMessage({ source: 'lbd', type: type }, '*'); } catch (e) {}
  }
  /* LBD 1 uses #startBtn / #finalNextBtn; LBD 2 uses #letsGoBtn / #winNextBtn. */
  var startBtn = document.getElementById('letsGoBtn') || document.getElementById('startBtn');
  var doneBtn  = document.getElementById('winNextBtn') || document.getElementById('finalNextBtn');
  if (startBtn) startBtn.addEventListener('click', function () { post('lbd-start'); }, true);
  if (doneBtn)  doneBtn.addEventListener('click',  function () { post('lbd-complete'); }, true);

  /* ---------- 2. idle chunked asset warm-up ---------- */
  function idle(fn) {
    if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 3000 });
    else setTimeout(fn, 300);             // Safari fallback
  }
  var queue = [];
  function warm(item) {
    if (item.kind === 'image') {
      var img = new Image();
      img.decoding = 'async';
      img.src = item.url;
    } else {
      try { var a = new Audio(); a.preload = 'auto'; a.src = item.url; a.load(); } catch (e) {}
      if (window.fetch) {
        fetch(item.url, { credentials: 'same-origin' })
          .then(function (r) { return r.ok ? r.blob() : null; })
          .catch(function () {});
      }
    }
  }
  function pump() {
    if (!queue.length) return;
    var kind = queue[0].kind;
    var max  = kind === 'audio' ? 2 : 3;
    var n = 0;
    while (n < max && queue.length && queue[0].kind === kind) { warm(queue.shift()); n++; }
    idle(pump);
  }
  function begin() {
    if (!window.fetch) return;
    fetch('embed-assets.json', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (man) {
        if (!man) return;
        (man.images || []).forEach(function (u) { queue.push({ url: u, kind: 'image' }); });
        (man.audio  || []).forEach(function (u) { queue.push({ url: u, kind: 'audio' }); });
        idle(pump);
      })
      .catch(function () {});
  }
  if (document.readyState === 'complete') setTimeout(begin, 1000);
  else window.addEventListener('load', function () { setTimeout(begin, 1000); }, { once: true });
})();
