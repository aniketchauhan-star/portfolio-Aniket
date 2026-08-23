/* ============================================================================
   THE STORY NIGHT — flipbook behaviour.
   Diagnostic first: surface any REAL JavaScript error on screen (a silent error
   would stop the click handlers from ever attaching). Image / video / network
   load failures are ignored — they have no .message and are handled per-element.
   ============================================================================ */
window.addEventListener("error", function (ev) {
  if (!ev || !ev.message) return;                 // ignore resource-load errors
  var b = document.getElementById("__jsErr");
  if (!b) {
    b = document.createElement("div");
    b.id = "__jsErr";
    b.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:100000;" +
      "background:#b00020;color:#fff;font:13px/1.5 monospace;padding:10px;white-space:pre-wrap";
    (document.body || document.documentElement).appendChild(b);
  }
  b.textContent = "⚠ JavaScript error (this is likely why the book won't open):\n" +
    ev.message + "\n" + (ev.filename || "") + " : line " + ev.lineno;
});

// If you can read this line in the console, the script parsed with NO syntax
// error and you are running the CURRENT file (not a cached copy).
console.log("%c✅ [The Story Night] loaded — 3D flipbook · full-bleed pages.",
            "font-weight:bold;color:#7d5fd0;font-size:13px");

/* ============================================================================
   ██  EDIT YOUR CONTENT HERE  ██
   ----------------------------------------------------------------------------
   Every entry below is ONE page of the book, shown in order after the cover.

     • type   : "video"  → a full-page video (e.g. assets/page-01.webm)
                "image"  → a full-page picture (e.g. assets/3 page.webp)
     • src    : the media file for that page.
     • delay  : (video only, optional) milliseconds to wait after landing on the
                page before the video starts (e.g. delay: 3000 → starts after 3s).
                Omit / 0 → the video starts instantly.

   Add / remove / reorder pages freely — the flip engine and the "Page X / N"
   counter update automatically.
   ============================================================================ */
// Each video page has a matching first-frame poster in assets/posters/ so the
// scene shows instantly.
const pages = [
  { type: "video", src: "assets/page-01.webm" },  // 1 — opening video
  { type: "video", src: "assets/page-02.webm", game: "ponds" },  // 2 — interactive ponds after the video
  { type: "video", src: "assets/page-03.webm" },  // 3
  { type: "video", src: "assets/page-04.webm" },  // 4
  { type: "video", src: "assets/page-05.webm" },  // 5
  { type: "video", src: "assets/page-06.webm" },  // 6
  // Fish Mix-Up game — after page 6. Its title screen shows INSIDE the page;
  // tapping the game's Play expands it to fullscreen; auto-advances when done.
  //
  // POSTER = the game's WHOLE title screen (title-card.webp), not the bare
  // banner art. This one image is what the leaf paints while the page uncurls,
  // what backs the iframe, and what #lbdCover holds over the game until it has
  // painted — so all three show the same finished picture.
  //
  // It used to be the game's Bgm.webp, which is the banner ALONE: Gogo and
  // "Let's Go" are separate elements inside the game, so they could not exist
  // until the live document painted, which cannot happen before the turn ends
  // (a browser never rasterizes a hidden iframe). The page therefore uncurled
  // onto a title with no character and no button, and they appeared ~0.5s later
  // — QA: "reveals an empty background texture first, followed by an abrupt
  // pop-in of the game logo and UI elements", against an expected behaviour of
  // "the complete title graphic AND UI controls as the page uncurls".
  //
  // title-card.webp is a 1920x1080 (exactly 16:9, so it maps 1:1 onto the leaf
  // under object-fit:cover) render of the game's OWN start screen, produced by
  // tools/gen-title-card.mjs. Rendering the game rather than compositing the
  // pieces by hand is what keeps it from drifting out of sync with the layout.
  // Regenerate it after ANY change to a title screen.
  { type: "lbd", src: "LBD%201/index.html", poster: "LBD%201/assets/title-card.webp" },
  { type: "video", src: "assets/page-07.webm" },  // 7
  { type: "video", src: "assets/page-08.webm" },  // 8
  // LBD 2 game — after page 8. Title screen INSIDE the page; "Let's Go" expands
  // it to fullscreen; auto-advances when finished; replays fresh when you return.
  // Same full-title-screen poster as LBD 1 above — see that note.
  { type: "lbd", src: "LBD%202/index.html", poster: "LBD%202/assets/title-card.webp" },
  { type: "video", src: "assets/page-09.webm" },  // 9
  { type: "video", src: "assets/page-10.webm" },  // 10
  { type: "end" },                                // THE END page (cream) + Replay
];

/* ============================================================================
   ██  END OF EDITABLE CONTENT — engine below (no need to change) ██
   ============================================================================ */

/* ---- Build one page face's media (image OR video OR lbd poster) ---------- */
function makeMedia(page) {
  // "lbd" pages show a STILL poster on the leaf itself (seen while the page turns);
  // the live, interactive game is a separate full-screen-capable overlay iframe
  // (see the LBD OVERLAY section below) — it can't live inside the 3D-transformed
  // leaf because CSS transforms trap position:fixed, so true fullscreen would fail.
  if (page.type === "lbd") {
    const img = document.createElement("img");
    img.className = "page-media";
    img.draggable = false;
    img.addEventListener("dragstart", function (e) { e.preventDefault(); });
    img.decoding = "async";
    img.src = page.poster || "";
    img.alt = "Game";
    return img;
  }
  const media = page.type === "video"
    ? document.createElement("video")
    : document.createElement("img");
  media.className = "page-media";
  media.draggable = false;                           // never let the image "ghost-drag" out
  media.addEventListener("dragstart", function (e) { e.preventDefault(); });
  media.src = page.src;
  if (page.type === "video") {
    media.loop = false;
    media.playsInline = true;
    media.setAttribute("playsinline", "");            // iOS Safari inline playback
    media.setAttribute("webkit-playsinline", "");
    // FIRST-FRAME POSTER: the page surface (--paper) is deep night-blue, so a video
    // that hasn't painted a frame yet (still buffering, or autoplay was blocked) would
    // show as a BLANK dark-blue page. The poster is that clip's own frame 0, so the
    // scene shows INSTANTLY and — because it equals where playback starts — there's no
    // jump when the video then plays. Posters are tiny (~40KB) and live in assets/posters/.
    media.setAttribute("poster",
      page.src.replace(/^assets\//, "assets/posters/").replace(/\.webm$/i, ".webp"));
    // LAZY: do NOT eager-buffer. With 25 videos, preload="auto" made the browser
    // open + decode every clip on load (huge memory/CPU spike + open lag). We only
    // buffer the page you're on + the next one, on demand (see warmVideo()).
    media.preload = "none";
    // Tap the video to (re)start it WITH sound — a guaranteed user gesture, so
    // browsers that blocked the auto-start's audio will now allow it. (While the
    // pond game is showing, the game owns taps — don't let a tap replay the video.)
    media.addEventListener("click", function () {
      if (page.game === "ponds" && pondEl && pondEl.classList.contains("show")) return;
      media.muted = false;
      try { if (media.ended) media.currentTime = 0; } catch (_) {}
      const p = media.play(); if (p && p.catch) p.catch(function () {});
    });
    // When THIS page's video FULLY finishes:
    //  • pond page → start the interactive pond mini-game (image 1 + hand on pond 1);
    //  • otherwise → wait 5s, then show the "turn the page" tutorial (hand swipe +
    //    ghost page-flip + arrow blink). The tutorial NEVER shows while the video is
    //    still playing (canShowHint() blocks it) — only 5s after it ends. It fires
    //    ONCE per page arrival (armBlink) and any tap/flip cancels it. Skipped on the
    //    last page.
    // THREE reveal paths feed the same gate (pageMediaReveal): the 'ended'
    // event, the 'error' event, and a per-page watchdog timer armed in
    // refreshMedia — a broken/stalled video can never strand the child.
    media.addEventListener("ended", function () {
      if (!leaves[flipped] || !leaves[flipped].contains(media)) return;   // only the current page
      pageMediaReveal(page);
    });
    media.addEventListener("error", function () {
      if (!leaves[flipped] || !leaves[flipped].contains(media)) return;
      pageMediaReveal(page);
    });
  } else {
    media.decoding = "async";
    media.alt = page.alt || "story page";
  }
  return media;
}

/* (Speech-bubble builders removed: no page config used them and the bubble
   artwork was never shipped — see git history to restore alongside real art.) */

/* ---- Build the pages (one CSS 3D "leaf" per entry) ---------------------- */
const flipbookEl  = document.getElementById("flipbook");
const pageStackEl = flipbookEl ? flipbookEl.querySelector(".page-stack") : null;   // right-side page stack
const flipScaleEl = document.getElementById("flipScale");
const coverScene  = document.getElementById("coverScene");
// ONE full 16:9 page per view (single display). page 1 = entry 1. The themed
// book frame forms the left spine/cover edge (always visible when open); pages
// flip normally. No two-page spread.
const totalPages = pages.length;
// Which leaf is the embedded LBD game (-1 if none). Used to show/hide the overlay.
const LBD_INDEX = pages.findIndex(function (p) { return p.type === "lbd"; });
// There can be MORE THAN ONE embedded game page — test any page index/entry.
function isLbdPage(i) { return !!(pages[i] && pages[i].type === "lbd"); }

/* ---- POND mini-game (a page marked game:"ponds") ------------------------------
   After that page's video ends, four desert ponds light up one-by-one as the
   child taps them left→right. Each tap plays a colour voice-over, the scene image
   advances 1.png → 5.png, and a hand nudge points at the pond to tap next.
   Must be declared BEFORE the leaf loop (buildPondLayer reads POND_POS there). */
const POND_POS = [            // pond centres as % of the 16:9 page
  { x: 14.0, y: 48 },         // 1 · pink
  { x: 36.5, y: 48 },         // 2 · green
  { x: 61.8, y: 48 },         // 3 · yellow
  { x: 85.7, y: 48 },         // 4 · red
];
const POND_VOICES = [
  "sfx/wow a pink pond.ogg",
  "sfx/look a green pond.ogg",
  "sfx/see a yellow pond .ogg",
  "sfx/and a red pond .ogg",
];
let pondEl = null, pondImg = null, pondHand = null, pondHits = [];
let pondActiveIdx = -1, pondDone = false, pondVoice = null;

// Each leaf is a full 16:9 page hinged on the LEFT spine:
//   • FRONT = the page's full-bleed image / video (+ its speech bubble, if any).
//   • BACK  = a BLANK parchment sheet (seen edge-on while the page turns).
const leaves = [];
pages.forEach(function (page, i) {
  const leaf = document.createElement("div");
  leaf.className = "leaf";

  const front = document.createElement("div");
  front.className = "face front";
  if (page.type === "end") {
    // THE END — a real final page (cream "paper") with a gold-plum title + Replay.
    front.classList.add("end-page");
    front.innerHTML =
      '<div class="end-page-inner">' +
        '<div class="end-title">THE&nbsp;END</div>' +
        '<button class="replay-btn" id="replayBtn" type="button" aria-label="Replay from the beginning">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>' +
          '</svg>' +
          '<span>Replay</span>' +
        '</button>' +
      '</div>';
  } else {
    front.appendChild(makeMedia(page));                       // full-bleed image / video
    if (page.game === "ponds") buildPondLayer(front);         // interactive pond mini-game layer
  }
  const curl = document.createElement("div");               // moving page-curl shading
  curl.className = "curl";
  front.appendChild(curl);

  const back = document.createElement("div");
  back.className = "face back";                             // blank reverse side (no content)

  leaf.appendChild(front);
  leaf.appendChild(back);
  flipbookEl.appendChild(leaf);
  leaves.push(leaf);
});

/* ---- POND mini-game logic ------------------------------------------------- */
// Build the interactive layer (scene image + 4 pond hotspots + hand nudge) on the
// game page's FRONT face. Hidden until the page's video ends (startPondGame).
function buildPondLayer(front) {
  const g = document.createElement("div");
  g.className = "pond-game";

  const img = document.createElement("img");
  img.className = "pond-img"; img.src = "assets/1.webp"; img.alt = ""; img.draggable = false;
  img.addEventListener("dragstart", function (e) { e.preventDefault(); });
  g.appendChild(img);

  POND_POS.forEach(function (p, i) {
    const b = document.createElement("button");
    b.className = "pond-hit"; b.type = "button";
    b.setAttribute("aria-label", "pond " + (i + 1));
    b.style.left = p.x + "%"; b.style.top = p.y + "%";
    b.addEventListener("click", function (e) { e.stopPropagation(); onPondClick(i); });
    g.appendChild(b);
  });

  const hand = document.createElement("img");
  hand.className = "pond-hand"; hand.src = "assets/handNudge.webp"; hand.alt = ""; hand.draggable = false;
  hand.addEventListener("dragstart", function (e) { e.preventDefault(); });
  g.appendChild(hand);

  front.appendChild(g);
  pondEl = g; pondImg = img; pondHand = hand;
  pondHits = Array.prototype.slice.call(g.querySelectorAll(".pond-hit"));
}
let pondPreloaded = false;
function pondPreload() {   // warm the later scene frames so each colour reveal swaps with no flash
  if (pondPreloaded) return;
  pondPreloaded = true;
  for (let k = 2; k <= 5; k++) { const pre = new Image(); pre.src = "assets/" + k + ".webp"; }
}

// true while the child is still playing the pond game on the current page
function pondActive() {
  return !!(pondEl && pages[flipped] && pages[flipped].game === "ponds" && !pondDone);
}
function pondStopVoice() {
  if (pondVoice) { try { pondVoice.pause(); } catch (_) {} pondVoice = null; }
}
// Clean the game back to its start state + hide the layer (called on any page change).
function pondReset() {
  if (!pondEl) return;
  pondStopVoice();
  pondDone = false; pondActiveIdx = -1;
  pondImg.src = "assets/1.webp";         // back to the first frame
  pondHand.classList.remove("show");
  pondHits.forEach(function (b) { b.classList.remove("active"); });
  pondEl.classList.remove("show");
}
// Point the hand at pond i and make ONLY that pond tappable (i<0 → hide the hand).
function pondPointAt(i) {
  pondHits.forEach(function (b, k) { b.classList.toggle("active", k === i); });
  if (i >= 0 && i < POND_POS.length) {
    pondHand.style.left = POND_POS[i].x + "%";
    pondHand.style.top  = POND_POS[i].y + "%";
    pondHand.classList.add("show");
  } else {
    pondHand.classList.remove("show");
  }
}
// Video finished → reveal scene image 1 over it and point at the first pond.
function startPondGame() {
  if (!pondEl) return;
  pondPreload();
  pondReset();
  pondEl.classList.add("show");
  pondActiveIdx = 0;
  pondPointAt(0);
  armInteractionWatchdog();      // count the child's idle time from HERE, not from page arrival
  updateProgress();              // the video ended but the ponds gate NEXT → keep it hidden
}
function pondPlayVoice(src, onEnd) {
  pondStopVoice();
  pondVoice = new Audio(preloadSrc(src));    // blob: URL when preloaded → plays with zero fetch
  let done = false;
  const finish = function () { if (done) return; done = true; if (onEnd) onEnd(); };
  pondVoice.addEventListener("ended", finish, { once: true });
  // One-time blob fallback: if the blob URL errors, retry the real file once.
  pondVoice.addEventListener("error", function () {
    const el = pondVoice;
    if (el && el.src.indexOf("blob:") === 0) {
      el.src = encodeURI(src);
      const rp = el.play();
      if (rp && rp.catch) rp.catch(finish);
    } else { finish(); }                     // even the file failed → never stall the game
  }, { once: true });
  const p = pondVoice.play();
  if (p && p.catch) p.catch(function () { finish(); });   // if it can't play, don't stall the game
}
function pondPlayTing(onEnd) {
  const a = new Audio(preloadSrc("sfx/ting.ogg"));
  let done = false;
  const finish = function () { if (done) return; done = true; if (onEnd) onEnd(); };
  if (onEnd) a.addEventListener("ended", finish, { once: true });
  a.addEventListener("error", function () {
    if (a.src.indexOf("blob:") === 0) {
      a.src = encodeURI("sfx/ting.ogg");
      const rp = a.play();
      if (rp && rp.catch) rp.catch(finish);
    } else { finish(); }
  }, { once: true });
  const p = a.play();
  if (p && p.catch) p.catch(function () { finish(); });   // can't play → don't stall the voice
}
// A pond was tapped.
function onPondClick(i) {
  if (!pondEl || !pondEl.classList.contains("show")) return;
  if (pondDone) { pondPlayTing(); return; }        // game over → every tap goes "ting"
  if (i !== pondActiveIdx) return;                 // only the highlighted pond responds
  armInteractionWatchdog();                        // real progress → restart the escape-hatch timer
  pondHits.forEach(function (b) { b.classList.remove("active"); });   // lock while the voice plays
  pondHand.classList.remove("show");               // hide the hand while the voice plays
  pondImg.src = "assets/" + (i + 2) + ".webp";     // NEW image on tap (pink → 2.webp, etc.)
  const last = (i === POND_POS.length - 1);
  pondPlayTing(function () {                        // tap "ting" plays FIRST...
   pondPlayVoice(POND_VOICES[i], function () {      // ...THEN the colour voice-over; when it ENDS...
    if (last) {
      pondDone = true;                             // finished: no hand; further taps play "ting"
      clearTimeout(interactionWatchdog);
      updateProgress();                            // interaction done → the NEXT arrow appears
      pondHits.forEach(function (b) { b.classList.add("active"); });
      // pond game over → now guide the page turn: show the flip tutorial after 5s
      clearTimeout(idleHintTimer);
      clearTimeout(nudgeHideTimer);
      idleHintTimer = setTimeout(triggerHint, 5000);
    } else {
      pondActiveIdx = i + 1;
      pondPointAt(i + 1);                           // ...the hand moves to the next pond
    }
   });
  });
}

/* ---- State + element references ----------------------------------------- */
const bookStage  = document.getElementById("bookStage");
const book       = document.getElementById("book");
const bookPop    = document.getElementById("bookPop");
const bookFloat  = document.getElementById("bookFloat");
const cover      = document.getElementById("cover");
const hint       = document.getElementById("hint");
// #prev / #next (the duplicate side-arrow circles) are gone — .corner-arrow is
// the single prev/next control set. Every state they carried (disabled gating,
// blink) already lived on #cornerPrev / #cornerNext; keyboard nav is on window.
const cornerPrev  = document.getElementById("cornerPrev");
const cornerNext  = document.getElementById("cornerNext");
const replayBtn   = document.getElementById("replayBtn");   // lives on the THE END page (built above)
// (No #homeBtn — the Home button is removed. Replay on THE END page is the only
// route back to the front cover; it shares closeBookToCover() below.)

/* ==========================================================================
   LBD OVERLAY  —  the Stairway Shuffle game embedded as one page.
   The game lives in a body-level iframe (#lbdStage) so it can grow to true
   fullscreen (a transform on .flip-scale would otherwise trap position:fixed).
   • pre-LBD  : the overlay is sized/positioned OVER the current page rectangle,
                so the game's home screen looks like it's printed inside the book.
   • start    : the game posts {source:"lbd", type:"lbd-start"} → we expand the
                overlay to fill the whole screen.
   • end/skip : the game posts {source:"lbd", type:"lbd-complete"} → we shrink the
                overlay back into the page and auto-flip to the next page.
   ========================================================================== */
const lbdStage = document.getElementById("lbdStage");
const lbdFrame = document.getElementById("lbdFrame");
const lbdCover = document.getElementById("lbdCover");
let lbdFullscreen = false;   // is the overlay expanded to full screen right now?
let lbdWasOn      = false;   // was the overlay showing on the previous refresh?
let lbdExiting    = false;   // guard so "complete" only advances once
let lbdDone       = false;   // has this page's game reported "complete"? (gates NEXT)
let lbdFrameVisibleArmed = false;  // is THIS page's game document up and safe to signal?
let lbdFrameLoaded = false;  // has the game's document actually loaded? (a game that
                             // never loads is the ONLY thing that may release NEXT —
                             // see armInteractionWatchdog)

// Load the CURRENT lbd page's game into the iframe on demand (never on flipbook
// boot — it's heavy). Its poster is shown as the frame backdrop while it loads so
// there's no dark flash before the game's own splash fades in.
function ensureLbdLoaded() {
  if (!lbdFrame || lbdFrame.dataset.loaded) return;
  const p = pages[flipped];
  if (!p || p.type !== "lbd") return;
  lbdFrame.style.background = p.poster
    ? "#0a0f2d url('" + p.poster + "') center/cover no-repeat"
    : "#0a0f2d";
  armLbdCover(p.poster);                // opaque title art over the iframe until it paints
  lbdFrameLoaded = false;               // "is THIS game's document up?" starts false
  lbdFrame.src = p.src;
  lbdFrame.dataset.loaded = "1";
}
/* ---- First-paint cover -------------------------------------------------------
   Show the game's own title art over the iframe until the game says it has
   painted, then cross-fade it away. See the markup comment on #lbdCover: the
   frame cannot rasterize while it is hidden, so *something* has to cover the
   moment it starts — otherwise the reader sees the game's unpainted document
   (black body, then the bare sandy background colour) before the art lands.
   That is the QA report: "the page uncurls to reveal an empty background
   texture first, followed by an abrupt pop-in of the game logo and UI". */
let lbdCoverTimer = null;
function armLbdCover(poster) {
  if (!lbdCover) return;
  clearTimeout(lbdCoverTimer);
  lbdCover.style.backgroundImage = poster ? "url('" + poster + "')" : "";
  lbdCover.classList.remove("gone");    // opaque again for this visit
}
// Drop the cover. Called on the game's `lbd-painted`, and unconditionally by a
// fallback timer so a game that never reports (older build, script error) still
// becomes visible — a stuck cover would hide the whole game.
function dropLbdCover() {
  if (!lbdCover) return;
  clearTimeout(lbdCoverTimer);
  lbdCover.classList.add("gone");
}
// Unload the game so the NEXT visit starts fresh at the pre-LBD home screen.
function resetLbd() {
  if (!lbdFrame) return;
  lbdFrameLoaded = false;
  lbdFrameVisibleArmed = false;   // next game must announce itself before we signal it
  // Deliberately NOT re-arming #lbdCover here. We are called while the stage is
  // fading out (300ms), and an opaque cover during that fade would be a dark
  // sheet on the way OUT — the exit version of the bug it exists to prevent.
  // about:blank is covered anyway: #lbdFrame keeps the inline poster background
  // ensureLbdLoaded gave it. The cover is re-armed on the next visit, at the
  // start of the turn, which is ~1150ms before the stage is shown again.
  lbdFrame.src = "about:blank";
  lbdFrame.dataset.loaded = "";
}
// The game's document is up → drop the "it never loaded" escape hatch, so from
// here on ONLY finishing the game opens NEXT. Read the frame's OWN location rather
// than the src attribute: resetLbd()'s about:blank load event can land after the
// next game URL has already been assigned, and only the location tells the two
// apart. (A location we're not allowed to read means a real document did load.)
if (lbdFrame) lbdFrame.addEventListener("load", function () {
  let href = "cross-origin";
  try { href = (lbdFrame.contentWindow && lbdFrame.contentWindow.location.href) || ""; } catch (_) {}
  if (href === "about:blank" || href === "") return;   // our own unload, not a game
  lbdFrameLoaded = true;
  lbdFrameVisibleArmed = true;
  // The game may have finished loading BEFORE the page finished turning (that
  // is the point of loading during the turn). If we are already parked on the
  // page, release its title narration now; otherwise updateLbdOverlay does it
  // on arrival.
  if (lbdWasOn) notifyLbdVisible();
  armInteractionWatchdog();
});
// Park the overlay exactly over the on-screen page rectangle (pre-LBD look).
function positionLbdStage() {
  if (!lbdStage) return;
  const r = flipScaleEl.getBoundingClientRect();   // the scaled 1280×720 page area
  lbdStage.style.left   = r.left   + "px";
  lbdStage.style.top    = r.top    + "px";
  lbdStage.style.width  = r.width  + "px";
  lbdStage.style.height = r.height + "px";
}
let lbdAnimTimer = null;
// Smoothly box-morph the overlay between the page rectangle and true fullscreen
// (0.4s transition via .lbd-anim). Expanding: the game's own start button was
// tapped. Shrinking: the game completed — it settles back into the book page.
function setLbdFullscreen(on) {
  if (!lbdStage) return;
  lbdFullscreen = on;
  positionLbdStage();                        // make the inline page-rect geometry current
  lbdStage.classList.add("lbd-anim");        // turn the box-morph transition ON for this toggle
  void lbdStage.offsetWidth;                 // commit, so the class change below animates from here
  lbdStage.classList.toggle("fullscreen", on);   // expand to / shrink from full screen
  document.body.classList.toggle("lbd-fullscreen", on);
  clearTimeout(lbdAnimTimer);
  lbdAnimTimer = setTimeout(function () { lbdStage.classList.remove("lbd-anim"); }, 460);
}
// Show the overlay when we land on an LBD page, and UNLOAD it the moment we
// leave (so returning replays it fresh).
//
// LOADING and SHOWING are deliberately split. The load starts the instant the
// turn TOWARD the game begins; only the reveal waits for the turn to finish.
// They used to be one step, both gated on `!animating`, which meant the game's
// 280 KB document did not even begin parsing until FLIP_MS + 40 (1190ms) after
// the turn started — so the page finished uncurling onto a game that had not
// been asked for yet, and the title art visibly popped in afterwards. That is
// the QA report: "page uncurls to reveal an empty background texture first,
// followed by an abrupt pop-in of the game logo and UI elements."
// Loading during the turn gives the game the whole 1150ms of page-turn
// animation as a head start, and the leaf's poster (the game's own title art)
// covers the stage for exactly that window.
//
// The reason the load used to wait — the game autoplays its title voice-over
// shortly after boot, which would leak audio over the previous page — is
// handled at the other end now: when embedded, the game holds that line until
// the host posts `lbd-visible` (see the message listener below and
// tryPlayBannerVO in each game).
//
// ON ARRIVAL the overlay sits exactly over the PAGE RECTANGLE, so the game's
// title screen reads as a page of the book (arrows/home stay usable — the
// reader can flip past without playing). Tapping the game's own Play /
// "Let's Go" posts lbd-start → the overlay smoothly EXPANDS to fullscreen
// (see the message listener). On lbd-complete it shrinks back into the page
// and the book auto-advances (exitLbd).
function updateLbdOverlay() {
  if (!lbdStage) return;
  const headingToLbd = opened && ready && isLbdPage(flipped);   // includes mid-turn
  const onLbd = headingToLbd && !animating;                     // fully landed
  // Begin the load as the turn starts. ensureLbdLoaded() is idempotent, and
  // resetLbd() below only runs once we are off an LBD page, so a load started
  // mid-turn is never torn down by the same turn that started it.
  //
  // GEOMETRY FIRST, then the load. Giving the game a real page-rect viewport
  // before its first byte arrives is what makes the head start actually worth
  // anything: it was already loading during the turn, but into a 0×0 stage, so
  // every bit of layout, art sizing, decode and raster still had to happen at
  // real size in the same frame the stage was revealed. See `.lbd-stage.prewarm`
  // in styles.css for the measurements.
  if (headingToLbd) {
    if (!lbdFullscreen) {
      positionLbdStage();
      lbdStage.classList.add("prewarm");   // renderable at final size, still opacity 0
    }
    ensureLbdLoaded();
  }
  if (onLbd) {
    if (!lbdFullscreen) positionLbdStage();   // park over the page rect BEFORE revealing (no 0×0 flash)
    lbdStage.classList.add("visible");
    lbdStage.classList.remove("prewarm");     // .visible owns visibility from here
    lbdStage.setAttribute("aria-hidden", "false");
    lbdWasOn = true;
    notifyLbdVisible();                   // releases the game's title voice-over
    // The stage is on screen now, so the game can finally rasterize. #lbdCover is
    // holding its title art over the top; it comes off on `lbd-painted`, or on
    // this ceiling if the game never reports.
    clearTimeout(lbdCoverTimer);
    lbdCoverTimer = setTimeout(dropLbdCover, 2200);
  } else if (!lbdFullscreen) {           // never hide mid-game (we can't leave while fullscreen)
    lbdStage.classList.remove("visible");
    // Mid-turn TOWARD the game lands here too — `onLbd` needs `!animating`, and
    // the whole point of the prewarm is that it is armed during that turn. So it
    // must survive this branch; only leaving LBD pages entirely clears it.
    if (!headingToLbd) lbdStage.classList.remove("prewarm");
    lbdStage.setAttribute("aria-hidden", "true");
    if (lbdWasOn) {
      lbdWasOn = false;
      resetLbd();                         // unload → stops all game audio immediately + fresh next visit
    }
  }
}
/* Tell the game it is actually on screen, so it can start its title narration.
   Sent on arrival AND again on the iframe's load event, because the two can
   land in either order now that loading begins during the turn: a fast load
   lands before arrival, a slow one after. The game ignores duplicates. */
function notifyLbdVisible() {
  if (!lbdFrame || !lbdFrame.contentWindow || !lbdFrameVisibleArmed) return;
  try { lbdFrame.contentWindow.postMessage({ source: "lbd-host", type: "lbd-visible" }, "*"); } catch (_) {}
}
// Game finished (or the temporary Skip was tapped): shrink out of full screen, then
// automatically turn to the next page.
function exitLbd() {
  if (lbdExiting) return;
  lbdExiting = true;
  lbdDone = true;                         // interaction finished → NEXT is allowed again
  updateProgress();
  // Warm the page we're about to auto-flip to NOW, so its video decoder has the
  // whole 470ms shrink transition as a head start — the auto-advance is not a
  // user gesture, and a cold decode here made the page's narration start late.
  warmVideo(flipped + 1); primeVideo(flipped + 1);
  setLbdFullscreen(false);                // shrink the game back out of full screen
  setTimeout(function () {
    lbdExiting = false;
    if (isLbdPage(flipped)) goNext();     // auto-advance to the next story page
  }, 470);                                // just after the shrink transition (.4s)
}
// Listen for the game's messages (start → fullscreen, complete → advance).
// The embed-bridge.js shipped inside each game posts the canonical
// {source:"lbd", ...} payloads; the games' own built-in end-of-game messages
// (GAME_COMPLETE from LBD 2, FISH_MIXUP_NEXT from LBD 1) are accepted as a
// completion fallback so the book still advances even if the bridge is absent.
window.addEventListener("message", function (e) {
  // Only trust messages that come from our own game iframe.
  if (lbdFrame && e.source && lbdFrame.contentWindow && e.source !== lbdFrame.contentWindow) return;
  const d = e && e.data;
  if (!d) return;
  const canonical = d.source === "lbd";
  if (canonical && d.type === "lbd-painted") {
    dropLbdCover();                    // the game's art is really on screen → uncover it
    return;
  }
  if (canonical && d.type === "lbd-start") {
    armInteractionWatchdog();          // the child is playing → the load hatch is moot
    setLbdFullscreen(true);
  }
  else if ((canonical && d.type === "lbd-complete") ||
           d.type === "GAME_COMPLETE" || d.type === "FISH_MIXUP_NEXT") {
    exitLbd();
  }
});

/* ============================================================================
   BOOT PRELOADER — 100% of assets behind a themed loading bar before Play.
   The Play button is hidden while a gold progress bar (byte-accurate, weighted
   by the real on-disk sizes in preload-manifest.js and refined per response
   with Content-Length) fills. Files are fetched smallest-first (cover art,
   images and posters land in the first seconds and are never starved behind
   the big videos) with a concurrency of 5, through streaming readers so the
   bar moves with every chunk. The bar is strictly monotonic.

   • Flipbook media (g:"fb") is swapped to blob: URLs on its elements once
     fetched — "loaded" truly means local. Each swap carries a one-time error
     fallback back to the original file URL.
   • Game files (g:"game") are warmed into the HTTP cache with the EXACT
     request URLs the iframes will use; iframes cannot consume the parent's
     blob: URLs. The games' HTML documents additionally get a sandboxed-iframe
     warm (Chrome keys subframe DOCUMENT loads into their own cache partition,
     so a plain fetch can never warm the iframe navigation; `sandbox` without
     allow-scripts parses the doc into the right partition while the games' JS
     — and therefore their audio autoplay — can never run).
   • FAILURE NEVER BLOCKS: every fetch has an abort timeout scaled to its
     size, any error/timeout/abort counts the file as done (elements keep
     their original src), file:// skips straight to done, and an overall
     watchdog force-finishes the bar so the child can never be stranded.
   ============================================================================ */
const preloadedBlob = Object.create(null);   // exact request URL → blob: URL
let bootDone = false;

// Raw app path → preloaded blob URL if we have one, else the encoded path.
// (Cache keys are the ENCODED request URLs, so encode before looking up.)
function preloadSrc(rawUrl) {
  const key = encodeURI(rawUrl);
  return preloadedBlob[key] || key;
}

function idleCb(fn) {
  if ("requestIdleCallback" in window) requestIdleCallback(fn, { timeout: 3000 });
  else setTimeout(fn, 300);                  // Safari fallback
}

/* Sandboxed-iframe document warm for the embedded games (see header note). */
let docsWarmed = false;
function warmDocs(i) {
  const gamePages = pages.filter(function (p) { return p.type === "lbd" && p.src; });
  if (i === 0) { if (docsWarmed) return; docsWarmed = true; }
  if (i >= gamePages.length) return;
  const f = document.createElement("iframe");
  f.setAttribute("sandbox", "");             // no scripts → boots nothing, plays nothing
  f.setAttribute("aria-hidden", "true");
  f.tabIndex = -1;
  f.style.cssText = "position:absolute;left:-9999px;top:-9999px;width:2px;height:2px;border:0;visibility:hidden;pointer-events:none;";
  let done = false;
  const fin = function () {
    if (done) return; done = true;
    if (f.parentNode) f.parentNode.removeChild(f);
    idleCb(function () { warmDocs(i + 1); });
  };
  f.onload = function () { setTimeout(fin, 500); };  // small grace for late subresources
  f.onerror = fin;
  setTimeout(fin, 20000);                    // safety net — never leave a warm frame behind
  f.src = gamePages[i].src;
  document.body.appendChild(f);
}

/* Swap every page <video> to its preloaded blob: URL. One-time error fallback
   reverts to the original file URL (and resumes playback if it was playing). */
function swapVideosToBlobs() {
  leaves.forEach(function (leaf, i) {
    const v = leaf.querySelector("video.page-media");
    if (!v) return;
    const orig = pages[i] && pages[i].src;
    const blob = orig && preloadedBlob[encodeURI(orig)];
    if (!blob) return;
    v.dataset.origSrc = orig;
    v.addEventListener("error", function onBlobError() {
      v.removeEventListener("error", onBlobError);
      if (!v.dataset.origSrc) return;
      const wasPlaying = !v.paused && !v.ended;
      const at = v.currentTime || 0;
      v.src = v.dataset.origSrc;             // back to the plain file URL
      delete v.dataset.origSrc;
      try { v.load(); v.currentTime = at; } catch (_) {}
      if (wasPlaying) { const p = v.play(); if (p && p.catch) p.catch(function () {}); }
    });
    v.src = blob;                            // preload stays "none" — blob is already local
  });
}

(function bootPreload() {
  const loaderEl = document.getElementById("bootLoader");
  const fillEl   = document.getElementById("bootFill");
  const pctEl    = document.getElementById("bootPct");
  const playEl   = document.getElementById("hint");
  const files    = (window.PRELOAD_MANIFEST && window.PRELOAD_MANIFEST.files) || [];

  let shown = 0;                             // monotonic displayed fraction (0..1)
  let lastPaint = 0;                         // throttle DOM writes — chunks can arrive
                                             // thousands of times/sec on fast pipes
  function setBar(frac) {
    frac = Math.max(shown, Math.min(1, frac));
    if (frac <= shown && frac < 1) return;
    shown = frac;
    const now = Date.now();
    if (frac < 1 && now - lastPaint < 80) return;   // ≤ ~12 DOM updates/sec
    lastPaint = now;
    if (fillEl) fillEl.style.width = (frac * 100).toFixed(1) + "%";
    if (pctEl)  pctEl.textContent = "Loading… " + Math.round(frac * 100) + "%";
    if (loaderEl) loaderEl.setAttribute("aria-valuenow", String(Math.round(frac * 100)));
  }

  function finish() {
    if (bootDone) return;
    bootDone = true;
    shown = 0; setBar(1);                    // land the bar on a clean 100%
    if (pctEl) pctEl.textContent = "100%";
    // Deferred a tick: finish() can fire synchronously (file://, empty
    // manifest) while `leaves` further down the file is still in its TDZ.
    setTimeout(swapVideosToBlobs, 0);
    if (loaderEl) loaderEl.classList.add("done");
    if (playEl) { playEl.classList.remove("boot-hidden"); playEl.classList.add("boot-pop"); }
    setTimeout(function () {
      if (loaderEl && loaderEl.parentNode) loaderEl.parentNode.removeChild(loaderEl);
    }, 700);
    idleCb(function () { warmDocs(0); });    // silent iframe-partition HTML warm
  }

  // file:// (fetch blocked), no fetch(), or an empty manifest → nothing to
  // meaningfully preload; reveal Play immediately.
  if (!window.fetch || location.protocol === "file:" || !files.length) { finish(); return; }

  let totalBytes = 0;
  files.forEach(function (f) { totalBytes += f.s || 0; });
  const got = new Array(files.length).fill(0);
  function report() {
    let sum = 0;
    for (let k = 0; k < got.length; k++) sum += got[k];
    setBar(totalBytes ? sum / totalBytes : 1);
  }

  // Smallest-first queue, ~5 transfers in flight.
  const queue = files.map(function (f, i) { return { f: f, i: i }; })
                     .sort(function (a, b) { return (a.f.s || 0) - (b.f.s || 0); });
  const CONCURRENCY = 5;
  let inFlight = 0, cursor = 0, settled = 0;

  // Absolute watchdog: whatever the network does, the bar can never strand
  // the child on a dead cover. (Transfers keep filling the HTTP cache after.)
  const overallTimer = setTimeout(finish, 180000);

  function startOne(item) {
    const f = item.f, i = item.i;
    inFlight++;
    let ctrl = null, killTimer = 0;
    if ("AbortController" in window) {
      ctrl = new AbortController();
      // Per-transfer abort: 15s base + ~8ms/KB (≈125 KB/s floor), 90s cap.
      killTimer = setTimeout(function () { try { ctrl.abort(); } catch (_) {} },
                             Math.min(90000, 15000 + Math.round((f.s || 0) / 128)));
    }
    let settledHere = false;
    function done() {
      if (settledHere) return;
      settledHere = true;
      clearTimeout(killTimer);
      got[i] = f.s || got[i];                // failed/aborted counts as DONE — never block
      report();
      inFlight--; settled++;
      pump();
    }
    fetch(f.u, { credentials: "same-origin", signal: ctrl && ctrl.signal })
      .then(function (r) {
        if (!r.ok) throw new Error("http " + r.status);
        // Refine this file's weight with the server's real Content-Length.
        const len = parseInt(r.headers.get("Content-Length"), 10);
        const size = (isFinite(len) && len > 0) ? len : (f.s || 0);
        // Only flipbook video/audio needs its bytes KEPT (for blob: URLs).
        // Everything else is counted and discarded — the HTTP cache still
        // stores the body, and we never hold 20+ MB of game files in JS.
        const keep = f.g === "fb" && (f.t === "video" || f.t === "audio");
        if (!r.body || !r.body.getReader) return keep ? r.blob() : r.arrayBuffer().then(function () { return null; });
        const reader = r.body.getReader();
        const chunks = [];
        let received = 0;
        return (function step() {
          return reader.read().then(function (res) {
            if (res.done) return keep ? new Blob(chunks) : null;
            if (keep) chunks.push(res.value);
            received += res.value.length;
            got[i] = Math.min(received, size || received);   // byte-accurate progress
            report();
            return step();
          });
        })();
      })
      .then(function (blob) {
        // Only flipbook media becomes blob: URLs; game files are cache-warmed
        // (an iframe cannot use its parent's blob URLs).
        if (blob && f.g === "fb" && (f.t === "video" || f.t === "audio")) {
          try { preloadedBlob[f.u] = URL.createObjectURL(blob); } catch (_) {}
        }
        done();
      })
      .catch(done);                          // error/timeout/abort → done, original src stays
  }
  function pump() {
    while (inFlight < CONCURRENCY && cursor < queue.length) startOne(queue[cursor++]);
    if (settled === queue.length) { clearTimeout(overallTimer); finish(); }
  }
  pump();
})();

let opened = false;      // has the cover been opened?
let ready  = false;      // has the cover FINISHED opening? (flips allowed only then)
let flipped = 0;         // how many leaves are currently turned to the left
let animating = false;   // guard so a new turn can't start mid-flip
const FLIP_MS = 1150;    // keep in sync with --flip-ms in styles.css
const COVER_OPEN_MS = 6000;  // keep in sync with the coverOpen animation in styles.css
// When the swinging cover has stopped covering page 1. The coverOpen keyframes
// put an easeOutQuint on the first 84%, so the board is past the page inside the
// first second and the rest of the 6s is it settling flat off to the left.
// Measured from screenshots of the real open sequence: fully clear by 900ms.
// Page 1's clip starts here rather than at COVER_OPEN_MS — see openBook().
const COVER_REVEAL_MS = 1100;
const CLOSE_SETTLE_MS = 560;  // keep in sync with the bookSettle animation in styles.css
const COVER_CLOSE_MS  = 2000; // Replay: cover swings shut (reverse open); sync with coverClose in styles.css
let _openTimer = null;   // pending "cover finished opening" timer
let _revealTimer = null; // pending "cover has cleared page 1 → start its clip" timer
let _homeTimer = null;   // pending "cover finished closing → back to the cover" timer

/* ---- Nav-control metrics probe -------------------------------------------
   fitScale() has to reserve room for the REAL controls, but every number it
   needs is defined in styles.css: --nav-btn (the one responsive button size),
   --nav-gap (the minimum clearance around it) and the four
   env(safe-area-inset-*) values. None of those can be read from JS directly —
   getPropertyValue() hands back the unresolved `clamp(...)` / `env(...)` token
   stream. So a zero-size hidden probe borrows them as margins and padding, and
   getComputedStyle() gives them back as resolved px. Result: there is exactly
   ONE definition of each number, and it lives in the stylesheet. */
const navProbe = document.createElement("div");
navProbe.setAttribute("aria-hidden", "true");
navProbe.style.cssText =
  "position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;" +
  "margin-top:var(--nav-btn);margin-right:var(--nav-gap);" +
  "padding-top:env(safe-area-inset-top,0px);padding-right:env(safe-area-inset-right,0px);" +
  "padding-bottom:env(safe-area-inset-bottom,0px);padding-left:env(safe-area-inset-left,0px);";
document.body.appendChild(navProbe);

function navMetrics() {
  const cs = getComputedStyle(navProbe);
  const px = function (v, fallback) { const n = parseFloat(v); return isFinite(n) ? n : fallback; };
  // Fallback mirrors --nav-btn / --nav-gap in styles.css. It should never be
  // reached — every engine that supports clamp() (which the book already needs)
  // resolves the probe — it just guarantees a sane book if one ever doesn't.
  const btn = px(cs.marginTop,
                 Math.min(112, Math.max(56, 0.08 * Math.min(window.innerWidth, window.innerHeight))));
  return {
    btn: btn,
    gap: px(cs.marginRight, btn * 0.35),
    t: px(cs.paddingTop, 0),    r: px(cs.paddingRight, 0),
    b: px(cs.paddingBottom, 0), l: px(cs.paddingLeft, 0),
  };
}

/* ---- Responsive: scale the FIXED 1280x720 book to fit the viewport --------
   The book keeps its intrinsic 1280x720 and is ONLY transform-scaled, so the
   paper-curl maths is never distorted.

   The controls used to be anchored to the VIEWPORT edges with vw/vh clamps while
   the book was a centred, scaled layer — two independent coordinate systems, so
   on anything that wasn't 16:9 the buttons drifted onto the book (and blocked its
   corner page-curl hover). Now there is one:
     1. reserve a REAL gutter on all four sides — one control (--nav-btn) plus its
        clearance (--nav-gap) plus that edge's safe-area inset;
     2. scale the book into whatever is left, so the BOOK shrinks to make room for
        the controls, never the other way round;
     3. publish the book's rendered geometry on :root so the CSS can park each
        control inside its own guaranteed-clear gutter. */
function fitScale() {
  const m = navMetrics();                            // real button size + gap + safe insets
  const vw = window.innerWidth, vh = window.innerHeight;
  const roomW = vw - (m.l + m.r) - 2 * (m.btn + m.gap);
  const roomH = vh - (m.t + m.b) - 2 * (m.btn + m.gap);
  // 0.05 floor: on an absurdly small window the reservation can exceed the screen;
  // keep the scale positive so the book never renders inside-out. (The max() floors
  // on the CSS offsets keep the controls on-screen in that same degenerate case.)
  const s = Math.max(0.05, Math.min(roomW / 1280, roomH / 720));
  flipScaleEl.style.setProperty("--book-scale", s.toFixed(4));

  // The book's real on-screen box. COMPUTED, not measured: .scene's 900ms sceneIn
  // entrance animation transforms the book, so getBoundingClientRect() would lie
  // for the first frames after load. It is centred in the viewport (.scene's
  // padding is symmetric), which makes the arithmetic exact.
  const bw = 1280 * s, bh = 720 * s;
  const left = (vw - bw) / 2, top = (vh - bh) / 2;
  const root = document.documentElement.style;
  const setPx = function (name, v) { root.setProperty(name, v.toFixed(2) + "px"); };
  setPx("--book-w", bw);            setPx("--book-h", bh);
  setPx("--book-left", left);       setPx("--book-right",  left + bw);   // edges, from the
  setPx("--book-top",  top);        setPx("--book-bottom", top  + bh);   // viewport's top-left
  // …and the CLEAR gutter on each side — the space each control is centred in.
  setPx("--gut-left",  left);       setPx("--gut-right",  vw - left - bw);
  setPx("--gut-top",   top);        setPx("--gut-bottom", vh - top  - bh);

  // keep the page-turn hint glued to the book's right edge when the viewport changes
  if (flipHint && flipHint.classList.contains("show")) positionFlipHint();
}

/* ---- Render / stacking for the CSS leaf flip ---------------------------- */
// A TURNED leaf sits to the left (rotateY -180deg, showing its blank back over
// the cover); an UN-turned leaf lies flat on top of the cover. z-index keeps the
// current (top un-turned) page in front, and stacks more-recently turned leaves
// above earlier ones on the left pile.
function updateZ() {
  leaves.forEach(function (leaf, i) {
    leaf.style.zIndex = (i < flipped) ? (200 + i) : (100 - i);
  });
}
function renderLeaves() {
  leaves.forEach(function (leaf, i) {
    if (i < flipped) leaf.classList.add("flipped");
    else             leaf.classList.remove("flipped");
    /* GPU WINDOWING: every leaf is a composited layer (3D transform +
       will-change), and 13 full-viewport layers overflow the GPU texture
       budget on real machines — the browser then EVICTS textures and pages
       intermittently paint BLANK even though devtools looks clean. Only the
       current spread's neighbourhood stays rendered; every leaf that is
       guaranteed occluded gets visibility:hidden + will-change:auto
       (.gpu-parked) so its layer memory is actually released. Re-runs on
       every navigation (renderLeaves is called by every flip/resize/reset). */
    const near = Math.abs(i - flipped) <= 1 || leaf.classList.contains("flipping");
    leaf.classList.toggle("gpu-parked", !near);
  });
  updateZ();
}

/* ---- Per-page media -----------------------------------------------------
   Play the CURRENT page's video (pause every other), and pop the current page's
   speech bubble in ONCE, only after the page has fully settled. Called after
   each flip completes and once the cover has finished opening. */
let mediaDelayTimer = null;   // pending "start this video after N ms" timer
let mediaDelayIdx = -1;       // which page that pending timer belongs to
let lastMediaIdx = -1;        // last page refreshMedia handled (to arm the blink once)
let armBlink = false;         // allow the video-end arrow blink ONCE per page arrival

function playVideoNow(v) {
  try {
    v.preload = "auto";                       // make sure it's buffering before we play
    if (v.ended) v.currentTime = 0;
    v.muted = false;                          // try WITH sound (primed in the Play gesture)
    const p = v.play();
    if (p && p.catch) p.catch(function () { v.muted = true; v.play().catch(function () {}); });
  } catch (_) {}
}

/* Shared end-of-page-media gate — reached by 'ended', by 'error', and by the
   refreshMedia watchdog. Internal guards make it idempotent, so multiple
   paths firing is harmless. */
function pageMediaReveal(page) {
  if (page !== pages[flipped]) return;                        // stale — page changed
  unlockPageGate();                          // the page's video is over (or failed) → NEXT may work
  if (!opened || !ready || lbdFullscreen || flipped >= totalPages - 1) return;
  if (page.game === "ponds") {
    if (pondEl && pondEl.classList.contains("show")) return;  // already revealed (don't reset mid-game)
    startPondGame();
    return;
  }
  if (!armBlink) return;                     // already cued for this visit
  armBlink = false;                          // one tutorial per page arrival
  // schedule the hand-nudge tutorial 5s AFTER the video ends (then it repeats
  // while idle, and stops on any interaction)
  clearTimeout(idleHintTimer);
  clearTimeout(nudgeHideTimer);
  idleHintTimer = setTimeout(triggerHint, 5000);
}

/* WATCHDOG (3rd reveal path): re-armed on every page arrival for the page's
   own duration + 4s grace, so a video that stalls without ever firing
   'ended'/'error' still releases the gated UI. */
let pageMediaWatchdog = null;
function armPageMediaWatchdog(idx) {
  clearTimeout(pageMediaWatchdog);
  const page = pages[idx];
  if (!page || page.type !== "video") return;
  const leaf = leaves[idx];
  const v = leaf && leaf.querySelector("video.page-media");
  if (!v) return;
  const schedule = function () {
    clearTimeout(pageMediaWatchdog);
    const durMs = (isFinite(v.duration) && v.duration > 0) ? v.duration * 1000 : 30000;
    pageMediaWatchdog = setTimeout(function () {
      if (flipped !== idx || v.ended) return;  // page changed / finished naturally
      pageMediaReveal(page);
    }, durMs + 4000);
  };
  schedule();                                  // arm now (30s default if duration unknown)
  if (!(isFinite(v.duration) && v.duration > 0)) {
    v.addEventListener("loadedmetadata", function () {
      if (flipped === idx) schedule();         // re-arm with the real duration
    }, { once: true });
  }
}

/* Buffer ONE page's video on demand (only the current + next page are ever
   warmed, so we never spin up all 25 decoders at once). */
function warmVideo(i) {
  const leaf = leaves[i];
  if (!leaf) return;
  const v = leaf.querySelector("video.page-media");
  if (v && v.preload !== "auto") { v.preload = "auto"; try { v.load(); } catch (_) {} }
}

/* Unlock ONE page's video for instant, sound-enabled playback: a muted
   play()→pause() done INSIDE a user gesture. We prime only the page being shown
   and the next one — priming all 25 at once was the opening lag. */
function primeVideo(i) {
  const leaf = leaves[i];
  if (!leaf) return;
  const v = leaf.querySelector("video.page-media");
  if (!v || v.dataset.primed) return;
  v.dataset.primed = "1";
  // NB: refreshMedia's pause-every-other-video sweep runs on the very next line
  // after primeVideo() and pauses this element synchronously, which does blunt
  // the activation the note below describes. Letting the sweep skip it instead
  // was tried and reverted: it leaves the next page's clip PLAYING off-screen
  // (muted) until its promise settles, and a clip that accumulates time that
  // way can be entered mid-stream. Silent-until-tapped is a smaller problem
  // than a slide that does not start at 00:00, and playVideoNow already falls
  // back to a muted play() if the sound-on one is refused.
  try {
    v.muted = true; v.preload = "auto";
    const p = v.play();                       // start within the gesture → element is "activated"
    // Pause only AFTER the play() promise settles — a synchronous pause() aborts
    // the pending play(), so the element never actually gets activated and the
    // later sound-on play() can be refused (page lands silent until a tap).
    const settle = function () {
      if (flipped === i) return;              // became the on-screen page → leave it playing
      try { v.pause(); v.currentTime = 0; } catch (_) {}
    };
    if (p && p.then) p.then(settle, settle);
    else settle();
  } catch (_) {}
}

/* Prime ONE page's video and PARK it on frame 0 (= its poster frame). Used for
   the page the cover is about to reveal: the element must be activated inside
   the user gesture (so the later sound-on play() is allowed), but neither its
   frames nor its narration audio may run yet — both wait for the cover to
   finish opening (the parked refreshMedia in runOpenSequence starts them).
   Starting the clip the moment Play was tapped made the voice-over run under
   the OS fullscreen blackout + the cover swing (QA: "audio plays early while
   the screen is black"). */
function holdFirstFrame(i) {
  const leaf = leaves[i];
  if (!leaf) return;
  const v = leaf.querySelector("video.page-media");
  if (!v) return;
  const park = function () { try { v.pause(); v.currentTime = 0; } catch (_) {} };
  if (v.dataset.primed) { park(); return; }     // already activated — just ensure it's parked
  v.dataset.primed = "1";
  try {
    v.muted = true; v.preload = "auto";
    const p = v.play();                         // activate within the gesture
    if (p && p.then) p.then(park, park);
    else park();
  } catch (_) {}
}

function refreshMedia() {
  const idx = flipped;                         // the front-most page right now
  // refreshMedia runs SEVERAL times per turn (flip start, flip end, and a
  // settle re-assert), so "did we just arrive?" has to be a separate fact from
  // "are we on this page?". Anything that must happen once per arrival — in
  // particular rewinding the page's video — keys off this, or the flip-end call
  // would restart a clip that has already been playing since the flip began.
  const arrived = idx !== lastMediaIdx;        // NEW page arrival (incl. revisits)
  if (arrived) {
    lastMediaIdx = idx;
    armBlink = true;                           // arm the video-end blink once per page
    // FIRST visit to a video page locks NEXT until its video finishes (see
    // pageGateLocked), and interaction pages keep it locked until the pond taps /
    // game are done. A page already CLEARED once is never gated again — going back
    // through the story keeps both arrows live (no re-watching, no re-playing).
    const seen = pageIsCleared(idx);
    pageGateLocked = !seen && !!(pages[idx] && pages[idx].type === "video");
    interactionForced = false;                 // fresh page → fresh interaction gate
    lbdDone = seen;                            // a game beaten once stays beaten on revisits
    armInteractionWatchdog();                  // (no-op on a cleared page)
    updateProgress();
  }
  pondReset();                                 // clean the pond mini-game on every page change
  // Left the page a delayed video was counting down on? Cancel that countdown.
  if (mediaDelayTimer && mediaDelayIdx !== idx) {
    clearTimeout(mediaDelayTimer); mediaDelayTimer = null; mediaDelayIdx = -1;
  }
  // Buffer + gesture-unlock ONLY this page and the next (so the upcoming flip is
  // instant and keeps sound) — never all 25 videos at once.
  warmVideo(idx); warmVideo(idx + 1); primeVideo(idx + 1);
  // Pause AND REWIND every video that is NOT the current page. Pausing alone
  // left each clip parked at the exact frame it was interrupted on, so coming
  // back to a page picked up mid-sentence instead of replaying the slide — the
  // reported bug. Rewinding on the way OUT (rather than only on the way in)
  // also means a leaf can never hold a half-played clip that some other code
  // path might resume, and the poster frame is what shows if the page is
  // glimpsed during a turn.
  leaves.forEach(function (leaf, i) {
    if (i === idx) return;
    const v = leaf.querySelector("video.page-media");
    if (!v) return;
    try { v.pause(); v.currentTime = 0; } catch (_) {}
  });
  // Show/hide the LBD game BEFORE starting the page video: leaving a game page
  // unloads the game iframe (its audio context, rAF loops, unload handlers), and
  // that main-thread hit must not land while the new page's audio track is
  // spinning up — that was delaying page 7's narration behind its picture.
  updateLbdOverlay();
  // Start (or schedule) the current page's video.
  const cur = leaves[idx];
  const v = cur && cur.querySelector("video.page-media");
  if (v) {
    // Entering a slide ALWAYS starts it from 00:00. The exit rewind above
    // normally leaves it there already, but this covers every other way a clip
    // can be mid-stream on arrival: a primed next-page video whose muted
    // play() was still in flight, the blob→file error fallback restoring a
    // saved position, or a tap that resumed it. Guarded by `arrived` so the
    // flip-end and settle calls never restart a clip mid-playback.
    if (arrived) { try { v.pause(); v.currentTime = 0; } catch (_) {} }
    const delayMs = (pages[idx] && pages[idx].delay) ? pages[idx].delay : 0;
    if (delayMs > 0) {
      // Already playing this page, or already counting down for it → leave it alone
      // (so the flip-start + flip-end calls don't restart the 3s countdown).
      if (mediaDelayIdx === idx && (mediaDelayTimer || !v.paused)) { /* keep going */ }
      else {
        try { v.pause(); v.currentTime = 0; } catch (_) {}   // hold on the first frame
        mediaDelayIdx = idx;
        mediaDelayTimer = setTimeout(function () {
          mediaDelayTimer = null;
          if (flipped === idx) playVideoNow(v);               // only if still on this page
        }, delayMs);
      }
    } else {
      playVideoNow(v);                          // no delay → instant
    }
  }
  armPageMediaWatchdog(idx);                    // 3rd reveal path for media-gated UI (re-armed per page)
  // Right-side page stack shrinks toward the end: 3 sheets → … → 0 on the last page.
  if (pageStackEl) pageStackEl.dataset.count = String(Math.max(0, Math.min(3, totalPages - 1 - flipped)));
  // Restart the idle → page-turn-hint countdown for the page we've just landed on
  // (uses the NEW `flipped`, so the delay is right: 5s on page 1, 10s afterwards).
  if (typeof resetIdleHint === "function") resetIdleHint();
}

/* ---- Navigation (drives the CSS leaf flip) ------------------------------ */
function turnLeaf(leaf) {                 // shared flip visuals + timing
  leaf.style.zIndex = 300;               // lift the turning sheet above everything
  leaf.classList.add("flipping");        // enables the moving curl shading
  renderLeaves();
  refreshMedia();                        // START now → the target video plays INSTANTLY
                                          // (as the page is revealed, not after the flip)
  playFlip();
  updateProgress();
  setTimeout(function () {
    leaf.classList.remove("flipping");
    animating = false; updateZ(); updateProgress();
    refreshMedia();                      // re-assert once settled (idempotent safety net)
  }, FLIP_MS + 40);
}
function goNext() {
  if (!opened || !ready || animating) return;   // wait until the cover has fully opened
  if (lbdFullscreen) return;                     // game is fullscreen mid-play (keyboard would flip the book underneath it)
  if (forwardLocked()) return;                   // video still playing, or this page's interaction isn't finished
                                                 // (buttons, keys, drag — everything waits)
  if (flipped >= totalPages - 1) return;         // already on the LAST page (THE END)
  animating = true;
  const leaf = leaves[flipped];                  // the page to turn
  flipped++;
  turnLeaf(leaf);
}
function goPrev() {
  if (!opened || !ready || animating) return;   // wait until the cover has fully opened
  if (lbdFullscreen) return;              // game is fullscreen mid-play — see goNext()
  if (flipped <= 0) return;               // already on the first page
  animating = true;
  flipped--;
  turnLeaf(leaves[flipped]);
}

/* ---- Nav state (page counter removed) ----------------------------------- */
/* CLEARED PAGES — a page the reader has ALREADY got through once (its video ran
   to the end, its pond taps / game finished, or a watchdog released it) never
   locks again. So going BACK through the story shows BOTH arrows straight away:
   nobody has to sit through the same video, or replay the same game, a second
   time to move forward again. Recorded by page index in updateProgress() — the
   one place that already knows "this page's gates are open" — and wiped by
   resetToStart() so a fresh read starts fully gated. */
const clearedPages = new Set();
function pageIsCleared(i) { return clearedPages.has(i); }

/* NEXT gate: on video pages, forward navigation is LOCKED until the page's
   video finishes. Re-armed on every FIRST arrival (refreshMedia). Unlocked by
   pageMediaReveal — which fires from THREE paths ('ended', 'error', and the
   duration+grace watchdog), so a broken/stalled video can never trap the
   reader. Back is never locked. */
let pageGateLocked = false;
function unlockPageGate() {
  if (!pageGateLocked) return;
  pageGateLocked = false;
  updateProgress();                         // light the forward arrows back up
}

/* INTERACTION gate: some pages ask the child to DO something once the video is
   over — tap the four ponds, or play an embedded LBD game. NEXT stays hidden
   until that interaction is finished, and on a GAME page finishing the game is
   the ONLY way it opens (no timeout hands out a skip — see
   armInteractionWatchdog). Already-cleared pages skip the gate entirely, so a
   revisit never asks for the same game twice. */
let interactionForced = false;             // watchdog released this page's interaction
function pageInteractionPending() {
  if (interactionForced) return false;
  if (pageIsCleared(flipped)) return false;         // been through this page before → no re-gate
  const page = pages[flipped];
  if (!page) return false;
  if (page.game === "ponds") return !pondDone;      // all four ponds tapped?
  if (page.type === "lbd")   return !lbdDone;       // game reported "complete"?
  return false;
}
// One place that answers "may the reader go forward yet?" — used by the arrows,
// the keyboard and the drag-to-turn gesture alike.
function forwardLocked() { return pageGateLocked || pageInteractionPending(); }

const PONDS_GRACE_MS   = 60000;    // no pond progress for 60s → release NEXT
/* GAME PAGES: there is NO "you took too long" release. The game itself is the
   gate — NEXT stays hidden until it posts "complete" (its own Skip posts that
   too), so the story can't be walked past unplayed. The single escape hatch is a
   game that never LOADS at all (offline, 404): if the iframe hasn't fired 'load'
   after this long there is nothing to play, so NEXT is released rather than
   stranding the child on a blank page. Once the game document IS up the timer is
   dropped (see the iframe 'load' handler). */
const LBD_LOAD_GRACE   = 45000;
let interactionWatchdog = null;
function armInteractionWatchdog() {
  clearTimeout(interactionWatchdog);
  const page = pages[flipped];
  if (!page || interactionForced || pageIsCleared(flipped)) return;
  const ms = page.game === "ponds" ? PONDS_GRACE_MS
           : page.type === "lbd"   ? (lbdFrameLoaded ? 0 : LBD_LOAD_GRACE) : 0;
  if (!ms) return;
  const idx = flipped;
  interactionWatchdog = setTimeout(function () {
    if (flipped !== idx || !pageInteractionPending()) return;
    // Game page: only a game that never loaded may be skipped. If it loaded while
    // we were counting down, the gate stays shut — finishing it is the way out.
    if (pages[idx] && pages[idx].type === "lbd" && lbdFrameLoaded) return;
    interactionForced = true;
    updateProgress();                       // reveal NEXT so the story can go on
  }, ms);
}

/* ONE-SHOT GLOW PULSE on the forward arrow — played the moment it APPEARS (the
   page's video has just ended, or its game / pond taps are done), so the eye is
   pulled to it. Three warm-gold pulses, then the class comes off and the arrow
   sits normally again. Keep in sync with .corner-arrow.glow-pulse in styles.css. */
const GLOW_PULSE_MS = 2100;                  // 3 × 0.7s
let glowPulseTimer = null;
let nextWasHidden = true;                    // was the forward arrow hidden last update?
function stopNextGlow() {
  clearTimeout(glowPulseTimer);
  if (cornerNext) cornerNext.classList.remove("glow-pulse");
}
function pulseNextArrow() {
  if (!cornerNext) return;
  stopNextGlow();
  void cornerNext.offsetWidth;               // commit the removal → the animation restarts
  cornerNext.classList.add("glow-pulse");
  glowPulseTimer = setTimeout(function () {
    cornerNext.classList.remove("glow-pulse");
  }, GLOW_PULSE_MS + 60);
}

function updateProgress() {
  const backOff = !ready || flipped <= 0;                              // page 1 → no back arrow at all
  const locked  = forwardLocked();
  const fwdOff  = !ready || flipped >= totalPages - 1 || locked;
  // This page's gates are open → remember it, so coming back here later shows
  // both arrows immediately instead of replaying the video / game to earn NEXT.
  if (opened && ready && !locked) clearedPages.add(flipped);
  if (cornerPrev) cornerPrev.disabled = backOff;   // HIDDEN (css) on page 1
  if (cornerNext) {
    cornerNext.disabled = fwdOff;                  // HIDDEN until the video + interaction are done
    if (fwdOff) {
      cornerNext.classList.remove("blink");        // never blink an invisible arrow
      stopNextGlow();                              // ...or glow one
    } else if (nextWasHidden && opened && ready) {
      pulseNextArrow();                            // it just appeared → glow once to be noticed
    }
    nextWasHidden = fwdOff;
  }
}

/* ---- Fullscreen: go FULLSCREEN when the book opens (the Play tap is the user
   gesture the Fullscreen API requires) and LEAVE fullscreen when back at the
   cover (Replay). Applies on every screen; silently no-ops where the
   browser blocks it (e.g. iPhone Safari can't fullscreen arbitrary elements). */
/* Returns a promise that settles when the fullscreen request does: resolved =
   granted (the viewport is about to transition), rejected = denied/unavailable
   (no transition will happen). openBook uses this to time the cover swing. */
function enterFullscreen() {
  try {
    if (document.fullscreenElement || document.webkitFullscreenElement) return Promise.reject();
    var el = document.documentElement;
    var req = el.requestFullscreen || el.webkitRequestFullscreen || el.webkitRequestFullScreen || el.msRequestFullscreen;
    if (req) {
      var p = req.call(el);
      // Legacy vendor APIs return nothing — treat the request as granted.
      return (p && p.then) ? p : Promise.resolve();
    }
  } catch (_) {}
  return Promise.reject();
}
function exitFullscreen() {
  try {
    if (!(document.fullscreenElement || document.webkitFullscreenElement)) return;
    var ex = document.exitFullscreen || document.webkitExitFullscreen || document.webkitCancelFullScreen || document.msExitFullscreen;
    if (ex) { var p = ex.call(document); if (p && p.catch) p.catch(function () {}); }
  } catch (_) {}
}

/* ---- Open the 3D cover, then hand off to the page-turning book ----------
   Shared by the first open (openBook) AND Replay (replayBook), so the dramatic
   hinge-open + post-open setup are identical both times. */
function runOpenSequence() {
  ready = false;
  document.body.classList.remove("is-closing");
  document.body.classList.add("is-open");
  // The whole open motion IS the cover's own hinge — NO zoom / camera move.
  book.classList.remove("closing");
  book.classList.add("open");          // cover hinges open on the LEFT spine
  bookFloat.classList.add("rest");     // stop the idle bob
  coverScene.classList.remove("parked");
  flipbookEl.style.zIndex = "";        // cover ABOVE the pages while it swings open
  // Reveal the REAL page right away (it sits beneath the cover, masked by it).
  flipbookEl.classList.add("show");
  // A user gesture drives every open, so start audio here.
  soundOn();
  resumeAudio();
  playCoverFlip();
  // Unlock page 1 + 2, but PARK page 1 on its first frame: the reader watches
  // the poster/frame-0 illustration through the whole cover swing, and the
  // clip (with its baked narration) starts at the parked refreshMedia() below,
  // exactly when the book has fully opened. Starting it here made the
  // voice-over audible seconds before the illustration was on screen.
  holdFirstFrame(0); primeVideo(1);
  // START PAGE 1's CLIP AS SOON AS THE COVER CLEARS IT — not when the swing
  // finishes. The cover's rotation is heavily front-loaded (easeOutQuint over
  // the first 84% of the keyframes), so it has swung past the page inside the
  // first second; the remaining ~5s is the board settling flat to the left,
  // where it no longer covers anything. Starting the clip at COVER_OPEN_MS+50
  // meant the reader watched a fully-revealed but frozen first page for over
  // five seconds after tapping Start — QA: "the first page video is not
  // playing". Verified by screenshotting the open sequence: the page is
  // completely clear of the cover by 900ms.
  //
  // This still honours the reason the clip was held in the first place — its
  // narration must not run before the illustration is on screen — because the
  // illustration IS on screen by now.
  clearTimeout(_revealTimer);
  _revealTimer = setTimeout(function () {
    refreshMedia();                       // arms + plays page 1 (see `arrived`)
  }, COVER_REVEAL_MS);
  // Once the cover has FULLY opened, park it, lift the pages above it, hand over
  // pointer events, and mark the book READY. The refreshMedia() here is now the
  // idempotent second call — `arrived` is already false, so it re-asserts state
  // without restarting the clip that has been playing since COVER_REVEAL_MS.
  clearTimeout(_openTimer);
  _openTimer = setTimeout(function () {
    coverScene.classList.add("parked");
    flipbookEl.style.zIndex = "5";        // pages now sit ABOVE the parked cover (z3)
    tapCatcher.style.pointerEvents = "none";
    flipbookEl.style.pointerEvents = "auto";
    ready = true;
    updateProgress();
    refreshMedia();
    resetIdleHint();
  }, COVER_OPEN_MS + 50);
  updateProgress();
}
function openBook() {
  console.log("[The Story Night] openBook() called — opened was:", opened);
  if (!bootDone) return;   // start is gated behind the loading bar — keyboard and
                           // programmatic opens wait for 100% just like the tap does
  if (opened) return;
  opened = true;
  // Instant tap feedback: the swing may start a few hundred ms from now (see
  // below), so hide the Play button immediately or the tap looks ignored.
  hint.classList.add("boot-hidden"); hint.classList.remove("boot-pop");
  // Everything that needs the user gesture happens NOW, synchronously in the
  // Play tap: audio unlock + page-1/2 media activation. The visual sequence
  // below may start a few hundred ms later, outside the gesture.
  soundOn();
  resumeAudio();
  holdFirstFrame(0); primeVideo(1);
  // On tablets the OS fullscreen transition blanks the screen for a beat. If
  // the cover swing starts underneath it, the reader sees black while the flip
  // SFX (and, before the holdFirstFrame fix, the narration) already play — the
  // QA "black screen with early audio". So: request fullscreen first, let the
  // viewport transition land (+2 painted frames), THEN run the swing. Capped
  // at 700ms so a denied/unsupported request can never stall the tap; the
  // `started` latch makes the two paths race-safe.
  var started = false;
  var start = function () {
    if (started) return;
    started = true;
    clearTimeout(cap);
    runOpenSequence();
  };
  var cap = setTimeout(start, 700);
  enterFullscreen().then(function () {
    // Granted → give the viewport transition a beat, then wait for two
    // painted frames so the swing's first frame lands on the new viewport.
    setTimeout(function () {
      requestAnimationFrame(function () { requestAnimationFrame(start); });
    }, 180);
  }, start);                  // denied/unavailable → no transition, open at once
}

/* ---- Reset the whole book to the START SCREEN: the CLOSED FRONT COVER + Play
   button, exactly like a fresh load (so tapping Play reads from the top). Called
   by Replay, once the closing swing has finished. ------------------------- */
function resetToStart() {
  exitFullscreen();           // back at the cover → leave fullscreen
  ready = false; opened = false; flipped = 0;
  renderLeaves();
  leaves.forEach(function (leaf) {
    var vv = leaf.querySelector("video.page-media");
    if (vv) { try { vv.pause(); vv.currentTime = 0; } catch (_) {} }
  });
  lastMediaIdx = -1;
  document.body.classList.remove("is-open", "is-closing");
  book.classList.remove("open", "closing");
  coverScene.classList.remove("parked");
  cover.style.transform = "";                 // cover CLOSED → front cover + Play button showing
  flipbookEl.classList.remove("show");         // pages hidden behind the closed cover
  flipbookEl.style.zIndex = "";
  flipbookEl.style.pointerEvents = "none";
  bookFloat.classList.remove("rest");          // resume the idle bob
  tapCatcher.style.pointerEvents = "auto";     // Play is tappable again
  // Bring the Play button back (openBook hides it on tap for instant feedback).
  hint.classList.remove("boot-hidden"); hint.classList.add("boot-pop");
  hideFlipHint(); clearTimeout(idleHintTimer); clearTimeout(nudgeHideTimer);
  // tear down any embedded game overlay (defensive — no stuck fullscreen game)
  if (lbdStage) {
    lbdFullscreen = false;
    lbdStage.classList.remove("fullscreen", "visible", "lbd-anim");
    lbdStage.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lbd-fullscreen");
  }
  resetLbd(); lbdWasOn = false; lbdDone = false;
  pondReset(); interactionForced = false;      // interaction gates back to their locked state
  clearedPages.clear();                        // a fresh read is gated from page 1 again
  nextWasHidden = true;                        // ...so the first video-end glow plays again too
  updateProgress();                            // hides the progress read-out (not opened)
}

/* ---- CLOSE THE BOOK: the cover swings SHUT — the exact REVERSE of the opening
   hinge (cover −180 → 0) — and the book lands on the front cover. Driven by
   REPLAY (from THE END page). `afterReset` runs once we're back on the cover. */
function closeBookToCover(afterReset) {
  ready = false;                               // block flips during the close
  clearTimeout(_openTimer);
  clearTimeout(_revealTimer);                  // never start page 1's clip into a closing book
  clearTimeout(_homeTimer);
  clearTimeout(interactionWatchdog);           // no stale interaction timer across a close
  hideFlipHint(); clearTimeout(idleHintTimer); clearTimeout(nudgeHideTimer);
  if (cornerNext) cornerNext.classList.remove("blink");
  stopNextGlow();
  var v = currentVideo(); if (v) { try { v.pause(); } catch (_) {} }
  // pages back UNDER the cover, so the closing cover sweeps over them
  flipbookEl.style.zIndex = "";
  flipbookEl.style.pointerEvents = "none";
  tapCatcher.style.pointerEvents = "none";
  coverScene.classList.remove("parked");
  // CLOSE — reverse of the opening hinge (cover swings from -180 back to 0).
  // is-closing keeps the current page bright (hides the dark thickness block) and
  // hides the turned-page pile, so the cover folds cleanly with no stray left page.
  document.body.classList.add("is-closing");
  book.classList.remove("open");
  book.classList.add("closing");
  playCoverFlip();
  _homeTimer = setTimeout(function () {
    resetToStart();
    if (typeof afterReset === "function") afterReset();
  }, COVER_CLOSE_MS + 60);
}

/* ---- REPLAY (button on THE END page): close the book with the reverse-of-open
   swing, land on the front cover, and re-arm the title VO for another read. */
function replayBook() {
  if (!opened || animating) return;
  closeBookToCover();
}

/* (goHome() is gone with the Home button — Replay is the only caller of
   closeBookToCover() now.) */

/* ==========================================================================
   INPUT  —  tap PLAY to OPEN the cover; once open, drag + corner arrows +
   keyboard drive the page flip.
   ========================================================================== */
const tapCatcher = document.getElementById("tapCatcher");

// The book opens ONLY from the play button. The tap-catcher still sits on top to
// block page gestures before opening, but it opens the book only when the tap
// lands inside the play button's (breathing) hit-circle — taps elsewhere on the
// cover do nothing.
function tapHitsPlay(e) {
  const r = hint.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const rad = Math.max(r.width, r.height) / 2;
  return Math.hypot(e.clientX - cx, e.clientY - cy) <= rad;
}
if (tapCatcher) tapCatcher.addEventListener("click", function (e) { if (!opened && tapHitsPlay(e)) openBook(); });
// Show the hand (pointer) cursor ONLY when hovering the play button — the sole CTA
// on the cover. Everywhere else on the tap surface stays a normal cursor.
if (tapCatcher) tapCatcher.addEventListener("mousemove", function (e) {
  tapCatcher.style.cursor = (!opened && tapHitsPlay(e)) ? "pointer" : "default";
});

// The play button itself (also covers keyboard: Enter/Space on the focused button).
hint.addEventListener("click", function (e) { e.stopPropagation(); if (!opened) openBook(); });

// Bottom-corner flip arrows (outside the book): back = left, forward = right.
cornerPrev.addEventListener("click", function (e) { e.stopPropagation(); goPrev(); this.blur(); });
cornerNext.addEventListener("click", function (e) { e.stopPropagation(); goNext(); this.blur(); });
if (replayBtn) replayBtn.addEventListener("click", function (e) { e.stopPropagation(); replayBook(); this.blur(); });

// Page interaction — DRAG TO TURN: grab the page and it follows your cursor,
// rotating about the spine, then SNAPS to the nearest state when you let go.
//   • drag LEFT  → turn the current page forward (it comes to rest on the cover)
//   • drag RIGHT → turn the previous page back
// A plain tap does nothing; the corner arrows + keyboard still work.
(function () {
  let startX = 0, startY = 0, pw = 1;
  let leaf = null, dir = 0, decided = false, dragging = false, curlEl = null;
  let lastX = 0, lastT = 0, vx = 0;                   // for flick (velocity) detection
  const DECIDE = 6;                                   // px before we commit to a drag
  const FLICK = 0.45;                                 // px/ms — a quick flick completes the turn
  const FINISH_DEG = 45;                              // turned this far (deg) → completes on release

  // how many degrees the drag has turned the page (0..180)
  function degFromDx(dx) { return Math.max(0, Math.min(180, Math.abs(dx) / pw * 180)); }
  // the live angle for the active leaf, given the raw horizontal travel
  function liveAngle(dx) {
    return (dir === 1) ? degFromDx(Math.min(0, dx))          // forward: leftward turns 0→180
                       : 180 - degFromDx(Math.max(0, dx));   // back: starts at 180, rightward → 0
  }

  flipbookEl.addEventListener("pointerdown", function (e) {
    if (!opened || !ready || animating) return;
    startX = e.clientX; startY = e.clientY;
    lastX = e.clientX; lastT = e.timeStamp || performance.now(); vx = 0;
    decided = false; dragging = true; leaf = null; dir = 0; curlEl = null;
    pw = flipbookEl.getBoundingClientRect().width || 1;
  });

  flipbookEl.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    const now = e.timeStamp || performance.now();
    const dt = now - lastT;
    if (dt > 0) vx = (e.clientX - lastX) / dt;         // running horizontal velocity
    lastX = e.clientX; lastT = now;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (!decided) {
      if (Math.abs(dx) < DECIDE || Math.abs(dx) <= Math.abs(dy)) return;   // wait for a clear horizontal drag
      if (dx < 0 && flipped < totalPages - 1 && !forwardLocked()) { dir = 1;  leaf = leaves[flipped]; }  // forward (only once the video + interaction are done)
      else if (dx > 0 && flipped > 0)         { dir = -1; leaf = leaves[flipped - 1]; } // turn back
      else { dragging = false; return; }                  // nothing to turn that way
      decided = true;
      leaf.style.transition = "none";                     // follow the finger exactly
      leaf.style.zIndex = 300;
      curlEl = leaf.querySelector(".curl");
      try { flipbookEl.setPointerCapture(e.pointerId); } catch (_) {}
    }
    const ang = Math.max(0, Math.min(180, liveAngle(dx)));
    leaf.style.transform = "rotateY(" + (-ang) + "deg)";
    if (curlEl) curlEl.style.opacity = (ang <= 90 ? ang / 90 : (180 - ang) / 90) * 0.9;
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    const L = leaf, D = dir, C = curlEl;
    leaf = null; curlEl = null;
    if (!decided || !L) return;                           // a plain tap → nothing

    const ang = Math.max(0, Math.min(180, liveAngle(e.clientX - startX)));
    // Complete the turn if it's been dragged far enough OR flicked quickly in
    // the turn's direction — no need to drag all the way past halfway.
    const flick = (D === 1) ? (vx < -FLICK) : (vx > FLICK);
    const complete   = (D === 1) ? (ang > FINISH_DEG || flick)
                                 : (ang < 180 - FINISH_DEG || flick);
    const endFlipped = (D === 1) ? complete   : !complete;    // does this leaf end up turned?

    animating = true;
    if (C) C.style.opacity = "";
    if (complete) { playFlip(); flipped += (D === 1) ? 1 : -1; }
    // Lock in the resting classes + z-index NOW (so nothing pops in later), then
    // animate the inline transform from the dragged angle to the target. The
    // .flipped class already holds the same final angle underneath.
    L.style.transition = "";                              // restore the CSS flip transition
    void L.offsetWidth;                                   // reflow so it animates FROM the dragged angle
    L.classList.add("flipping");                          // curl shading during the snap
    renderLeaves();                                       // apply .flipped + z-index immediately
    refreshMedia();                                       // START the target video INSTANTLY
    L.style.transform = endFlipped ? "rotateY(-180deg)" : "rotateY(0deg)";
    updateProgress();

    setTimeout(function () {
      L.classList.remove("flipping");
      // Drop the inline transform WITHOUT re-animating: the .flipped class already
      // holds the final angle, so disabling the transition for this swap prevents
      // the leaf from briefly swinging back (the "page reappears on the left" glitch).
      L.style.transition = "none";
      L.style.transform = "";
      void L.offsetWidth;                                 // commit with no transition
      L.style.transition = "";                            // restore for the next turn
      animating = false; updateProgress();
      refreshMedia();                                     // re-assert once settled (idempotent safety net)
    }, FLIP_MS + 40);
  }
  flipbookEl.addEventListener("pointerup", endDrag);
  flipbookEl.addEventListener("pointercancel", endDrag);
})();

window.addEventListener("keydown", function (e) {
  if (e.key === "ArrowRight") { e.preventDefault(); opened ? goNext() : openBook(); }
  else if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
  else if ((e.key === " " || e.key === "Enter") && !opened) { e.preventDefault(); openBook(); }
});

// Keep the canvas scaled to fit on resize / rotate.
let _resizeSettle = null;
function onViewportChange() {
  // Suppress the page-turn transitions while the viewport is actively changing, so
  // a rapid resize / resolution change can't make the book LOOK like it's auto-
  // flipping (the leaves re-render during the scale change). Restored once settled.
  document.body.classList.add("is-resizing");
  clearTimeout(_resizeSettle);
  _resizeSettle = setTimeout(function () { document.body.classList.remove("is-resizing"); }, 220);
  fitScale();
  // Re-park the LBD overlay over the (re-scaled) page — unless it's fullscreen,
  // where it already fills the viewport via CSS.
  // (Also while merely PREWARMED: the stage is sized but not yet shown, and a
  // rotate/resize during the turn would otherwise leave the game laid out to the
  // OLD rect — which is the stale-geometry version of the very pop-in the
  // prewarm exists to prevent.)
  if (lbdStage && !lbdFullscreen &&
      (lbdStage.classList.contains("visible") || lbdStage.classList.contains("prewarm"))) positionLbdStage();
}
window.addEventListener("resize", onViewportChange);
window.addEventListener("orientationchange", onViewportChange);

/* ---- Block ALL zoom (pinch, double-tap, ctrl+wheel, ctrl +/-) ------------
   The book is fixed-layout, so zoom would only break it. */
(function () {
  // Never let anything (esp. page images) start a native HTML5 drag — that was
  // showing a "ghost" of the image following the cursor during a page-flip drag.
  document.addEventListener("dragstart", function (e) { e.preventDefault(); });
  ["gesturestart", "gesturechange", "gestureend"].forEach(function (t) {   // iOS pinch
    document.addEventListener(t, function (e) { e.preventDefault(); }, { passive: false });
  });
  window.addEventListener("wheel", function (e) {                          // desktop ctrl+wheel
    if (e.ctrlKey) e.preventDefault();
  }, { passive: false });
  window.addEventListener("keydown", function (e) {                        // ctrl/⌘ +/-/0
    if ((e.ctrlKey || e.metaKey) && ["+", "-", "=", "0"].indexOf(e.key) !== -1) e.preventDefault();
    // Block "Save page" (Ctrl/⌘+S) — a casual way to grab the media.
    if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) e.preventDefault();
  });
  document.addEventListener("touchmove", function (e) {                    // 2-finger pinch
    if (e.touches && e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  // NOTE: the right-click / context menu is intentionally LEFT ENABLED (so "Inspect"
  // and dev tools work). Casual image protection still stands via CSS — no drag,
  // no text-selection, no iOS long-press "Save Image" callout — plus Ctrl+S is blocked.
})();

/* ==========================================================================
   SOUND  —  real audio files in sfx/ (Ogg Opus): Page flip.ogg (every page
   flip) and cover page flip.ogg (the cover opening), played through Web Audio
   from the inlined SFX_DATA. All muted until the book is opened (a user
   gesture). NOTE: a title voice-over ("the story night") and looping BG music
   ("BG Music") were referenced here historically, but the recordings were
   never produced — those code paths 404'd on every load and have been
   removed. Re-add alongside real files if the content ever lands.
   ========================================================================== */
let muted = true;

/* ---- Pause ALL audio when the tab / window goes to the background -----------
   The current page's video (its voice-over) must stop the moment the reader
   switches tab or app, and resume when they come back — it was continuing to
   play in the background. Covers visibilitychange (tab switch), blur (other
   window), and pagehide (mobile app switch / bfcache). */
function currentVideo() {
  const leaf = leaves[flipped];
  return leaf ? leaf.querySelector("video.page-media") : null;
}
function pauseAllAudioFB() {
  const v = currentVideo();
  if (v && !v.paused) { v.dataset.wasPlaying = "1"; try { v.pause(); } catch (_) {} }
  if (audioCtx && audioCtx.state === "running") { try { audioCtx.suspend(); } catch (_) {} }
}
function resumeAllAudioFB() {
  if (document.hidden || !document.hasFocus()) return;   // only when truly back in front
  if (!opened) return;                                   // nothing plays before the book opens
  if (audioCtx && audioCtx.state === "suspended") { try { audioCtx.resume(); } catch (_) {} }
  const v = currentVideo();
  if (v && v.dataset.wasPlaying && !v.ended) { delete v.dataset.wasPlaying; const p = v.play(); if (p && p.catch) p.catch(function () {}); }
}
document.addEventListener("visibilitychange", function () {
  if (document.hidden) pauseAllAudioFB(); else resumeAllAudioFB();
});
window.addEventListener("blur", pauseAllAudioFB);
window.addEventListener("focus", resumeAllAudioFB);
window.addEventListener("pagehide", pauseAllAudioFB);

/* ---- One-shot SFX via Web Audio (glitch-free, zero-latency) --------------
   An <audio> element pays a real first-play init cost and can stutter on short
   one-shots — that was the cover-flip "lag/glitch". Instead we decode each SFX
   ONCE into an AudioBuffer and play it through a BufferSource: sample-accurate,
   no start latency. Any leading silence baked into the mp3 is auto-skipped (we
   start on the first audible sample). Buffers come from base64 data URIs
   (window.SFX_DATA in sfx-data.js) so they decode even on file://, where fetch()
   of a plain path is blocked. If Web Audio is unavailable we fall back to plain
   <audio> elements (the old behaviour). */
let audioCtx = null;
const sfxBuf = {};                          // name -> { buffer, offset (seconds) }

// Fallback <audio> elements — used ONLY if Web Audio fails to init or decode.
// preload="none": the inlined SFX_DATA path serves 99% of sessions, so these
// must not double-download; they fetch only if the fallback actually plays.
const flipSound = new Audio("sfx/Page%20flip.ogg");
flipSound.preload = "none";
const coverFlipSound = new Audio("sfx/cover%20page%20flip.ogg");
coverFlipSound.preload = "none";
coverFlipSound.volume = 0.35;

(function initSfx() {
  const AC = window.AudioContext || window.webkitAudioContext;
  const DATA = window.SFX_DATA || {};
  if (!AC || !DATA.cover) return;           // no Web Audio / no inlined data → fallback
  try { audioCtx = new AC(); } catch (_) { audioCtx = null; return; }
  function decode(name, uri) {
    fetch(uri).then(function (r) { return r.arrayBuffer(); })
      .then(function (a) { return audioCtx.decodeAudioData(a); })
      .then(function (buf) {
        // Skip any leading silence so playback starts right on the transient.
        const ch = buf.getChannelData(0), sr = buf.sampleRate, thr = 0.008;
        let first = 0;
        for (let i = 0; i < ch.length; i++) { if (Math.abs(ch[i]) > thr) { first = i; break; } }
        sfxBuf[name] = { buffer: buf, offset: Math.max(0, first / sr - 0.004) };
      })
      .catch(function () {});               // leave name unset → falls back to <audio>
  }
  decode("cover", DATA.cover);
  decode("flip", DATA.flip);
})();

// The audio context starts suspended until a user gesture. Resume it on the first
// pointer press (fires just BEFORE the open click) so the cover-flip sound, played
// a moment later, is instant. Capture phase, not once (cheap + always safe).
function resumeAudio() {
  if (audioCtx && audioCtx.state === "suspended") { try { audioCtx.resume(); } catch (_) {} }
}
document.addEventListener("pointerdown", resumeAudio, { capture: true });

// Play a decoded SFX buffer; returns false if Web Audio isn't ready (→ caller
// falls back to the <audio> element).
function playSfx(name, vol, rate) {
  const entry = sfxBuf[name];
  if (!audioCtx || !entry) return false;
  try {
    if (audioCtx.state === "suspended") audioCtx.resume();
    const src = audioCtx.createBufferSource();
    src.buffer = entry.buffer;
    if (rate) src.playbackRate.value = rate;
    const g = audioCtx.createGain();
    g.gain.value = (vol == null ? 1 : vol);
    src.connect(g).connect(audioCtx.destination);
    src.start(0, entry.offset || 0);        // start on the first audible sample
    return true;
  } catch (_) { return false; }
}

// Page-flip sound — snappy 1.5× on every ordinary flip.
function playFlip() {
  if (muted) return;                        // sound turns on when the book opens
  if (playSfx("flip", 1.0, 1.5)) return;    // Web Audio path
  try {                                     // fallback
    flipSound.currentTime = 0; flipSound.playbackRate = 1.5;
    const p = flipSound.play(); if (p && p.catch) p.catch(function () {});
  } catch (_) {}
}
// COVER-page flip sound — played ONLY when the cover opens (never on page flips).
function playCoverFlip() {
  if (muted) return;
  if (playSfx("cover", 0.35)) return;       // Web Audio path
  try {                                     // fallback
    coverFlipSound.currentTime = 0;
    const p = coverFlipSound.play(); if (p && p.catch) p.catch(function () {});
  } catch (_) {}
}
// Turn sound ON when the book is opened (a clear user gesture). Safe to call
// repeatedly.
function soundOn() {
  muted = false;                     // opening the book turns sound on
}


/* ==========================================================================
   PAGE-TURN HINT  —  guidance for readers who don't know how to turn the page.
   When idle, two cues fire together: a hand taps the forward arrow AND the page
   itself does a "ghost" half-flip (lifts toward the next page, then falls back).
   Timing: PAGE 1 after 5s, every later page after 10s of no interaction; repeats
   while idle and is cancelled by any tap / key / flip. Never on the last page or
   while the LBD game is open.
   ========================================================================== */
// The nudge is a HAND on the RIGHT side of the book — the custom hand artwork
// at assets/handNudge.webp. It does a right-to-left swipe to show the page turns.
let flipHint = document.createElement("img");
flipHint.className = "flip-hint";
flipHint.setAttribute("aria-hidden", "true");
flipHint.alt = "";
flipHint.decoding = "async";
flipHint.src = "assets/handNudge.webp";
document.body.appendChild(flipHint);

// Idle guidance timing: the FIRST nudge is after 5s on page 1, 10s on later pages;
// then it plays ONCE, disappears, and comes back every 9s. Any interaction resets it.
function idleDelay() { return flipped === 0 ? 5000 : 10000; }
const NUDGE_SHOW_MS = 2000;    // how long one nudge stays on screen
const NUDGE_GAP_MS  = 9000;    // gap after it disappears before it plays again
let idleHintTimer = null;
let nudgeHideTimer = null;
let peeking = false;
let peekTimers = [];

function canShowHint() {
  // Never nudge WHILE the page's video is still playing — the flip tutorial only
  // belongs AFTER the video ends. A video that errored (v.error) counts as "done"
  // so a failed clip doesn't lock the hint out forever.
  const v = currentVideo();
  if (v && !v.ended && !v.error) return false;
  return opened && ready && !animating && !lbdFullscreen &&
         flipped < totalPages - 1 && !isLbdPage(flipped) && !document.hidden &&
         !pondActive();                        // the pond game runs its own hand — no flip hint there
}
function positionFlipHint() {
  if (!flipScaleEl) return;
  const r = flipScaleEl.getBoundingClientRect();            // the book's on-screen rect
  const w = flipHint.offsetWidth || 80, h = flipHint.offsetHeight || 80;
  // Park the hand against the book's RIGHT edge, vertically centred — the side the
  // ghost flip lifts. The swipe animation moves it right→left from here.
  flipHint.style.left = Math.round(r.right - w - r.width * 0.05) + "px";
  flipHint.style.top  = Math.round(r.top + r.height * 0.5 - h / 2) + "px";
}
function showFlipHint() {
  if (!canShowHint()) return;
  positionFlipHint();
  flipHint.classList.add("show");
}
function hideFlipHint() {
  flipHint.classList.remove("show");
}

/* ---- GHOST PAGE-FLIP -------------------------------------------------------
   Lift the current page about halfway toward the next one, then let it fall back
   — a live demo that the page turns. Purely visual; cancelled the instant the
   reader interacts, so a real drag/flip takes over cleanly. */
function cancelPeek() {
  peekTimers.forEach(clearTimeout);
  peekTimers = [];
  if (!peeking) return;
  peeking = false;
  const leaf = leaves[flipped];
  if (leaf) {
    leaf.style.transition = ""; leaf.style.transform = ""; leaf.style.zIndex = "";
    const c = leaf.querySelector(".curl"); if (c) c.style.opacity = "";
  }
  updateZ();
}
function peekFlip() {
  if (peeking || !canShowHint()) return;
  const leaf = leaves[flipped];
  if (!leaf) return;
  peeking = true;
  const curl = leaf.querySelector(".curl");
  leaf.style.zIndex = 300;                               // lift above the rest while peeking
  leaf.style.transition = "transform 720ms cubic-bezier(0.33, 0, 0.2, 1)";
  void leaf.offsetWidth;                                 // commit so the lift animates from flat
  leaf.style.transform = "rotateY(-52deg)";              // turn toward the next page (~halfway)
  if (curl) curl.style.opacity = "0.85";                 // page-curl shading during the lift
  peekTimers.push(setTimeout(function () {               // ...then ease it back down
    leaf.style.transform = "rotateY(0deg)";
    if (curl) curl.style.opacity = "";
  }, 760));
  peekTimers.push(setTimeout(function () {               // clean up once settled
    leaf.style.transition = ""; leaf.style.transform = ""; leaf.style.zIndex = "";
    peeking = false; updateZ();
  }, 760 + 760));
}

// Play the nudge ONCE — hand swipe on the book's right + ghost page-flip + the
// right arrow blinks — hold ~2s, then hide and come back 9s later. Repeats while idle.
function triggerHint() {
  if (!canShowHint()) { idleHintTimer = setTimeout(triggerHint, NUDGE_GAP_MS); return; }
  showFlipHint();
  peekFlip();
  if (cornerNext && !cornerNext.disabled) {
    stopNextGlow();                            // the appear-glow is over — one animation at a time
    cornerNext.classList.add("blink");          // don't blink a hidden arrow
  }
  clearTimeout(nudgeHideTimer);
  nudgeHideTimer = setTimeout(function () {
    hideFlipHint();
    if (cornerNext) cornerNext.classList.remove("blink");
    idleHintTimer = setTimeout(triggerHint, NUDGE_GAP_MS);   // ...then again after 9s
  }, NUDGE_SHOW_MS);
}
function resetIdleHint() {
  hideFlipHint();
  cancelPeek();
  if (cornerNext) cornerNext.classList.remove("blink");
  clearTimeout(idleHintTimer);
  clearTimeout(nudgeHideTimer);
  idleHintTimer = setTimeout(triggerHint, idleDelay());       // first show: 5s (pg1) / 10s (later)
}
// Any interaction cancels the nudge + restarts the idle countdown.
["pointerdown", "keydown", "wheel", "touchstart"].forEach(function (evt) {
  document.addEventListener(evt, resetIdleHint, { passive: true, capture: true });
});

/* ---- Boot ---------------------------------------------------------------- */
fitScale();                              // scale the fixed 1280x720 book to fit first
renderLeaves();                          // lay out the leaves (all on page 1 to start)
updateProgress();
