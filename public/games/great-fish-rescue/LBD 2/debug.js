/* ============================================================================
   debug.js — floating screen navigator for the Fish Counting game.

   A small, self-contained dev panel that lets you jump between the game's
   screens without playing through the whole flow. It only READS/CALLS the
   game's existing global functions (startCounting, showPondPopup, …) and never
   changes game logic, so it can be removed at any time by deleting the
   <script src="debug.js"> tag in index.html.

   Toggle the panel with the backtick (`) key, or the ✕ / • button in its header.
   ========================================================================== */
(function () {
  'use strict';

  /* Call a global game function by name, only if it exists. Errors are logged
     (not thrown) so a broken jump can never take the page down. */
  function call(name) {
    const fn = window[name];
    const args = Array.prototype.slice.call(arguments, 1);
    if (typeof fn !== 'function') {
      console.warn('[debug] missing function:', name);
      return;
    }
    try { return fn.apply(window, args); }
    catch (e) { console.warn('[debug] error in ' + name + '():', e); }
  }

  /* Drop any in-flight guide / voice / lock state AND deactivate every screen,
     so a jump lands on a single clean screen instead of inheriting a
     half-finished animation, a locked stage, or a previously-active screen
     left visible underneath (the game's own transitions only clear the one
     screen they came from, so debug jumps must clear them all). */
  function resetTransient() {
    call('setGuideLock', false);
    call('clearIdleNudge');
    call('stopCurrentVO');
    ['chooseGuide', 'tapGuide', 'doneGuide', 'overlayGuide'].forEach(function (id) {
      const g = document.getElementById(id);
      if (g) { g.style.display = 'none'; g.classList.remove('guide-vanish'); }
    });
    const dim = document.getElementById('finalDim');
    if (dim) dim.style.display = 'none';
    document.querySelectorAll('.screen').forEach(function (s) {
      s.classList.remove('active', 'fade-out');
    });
  }

  /* Hide every screen, then show the one requested. */
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(function (s) {
      s.classList.remove('active');
    });
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  /* Clear pond progress so the selection screen is fresh and all ponds are
     tappable again. Safe if `completed` isn't reachable. */
  function resetProgress() {
    try { if (typeof completed !== 'undefined' && completed.clear) completed.clear(); }
    catch (e) { /* `completed` not in scope — fine, fall back to DOM only */ }
    document.querySelectorAll('.pond.completed').forEach(function (p) {
      p.classList.remove('completed');
    });
    call('fillSelectionPonds');
  }

  /* ---- navigation actions ---------------------------------------------- */
  const ACTIONS = [
    { label: 'Start',        fn: function () { resetTransient(); showScreen('screen-start'); } },
    { label: 'Select ponds', fn: function () { resetTransient(); showScreen('screen-select'); } },
    { label: 'Choose guide', fn: function () { resetTransient(); showScreen('screen-select'); call('runChoosePondGuide', false); } },
    { label: 'Popup (pink)', fn: function () { resetTransient(); call('showPondPopup', 'pink'); } },
    { label: 'Summary',      fn: function () { resetTransient(); showScreen('screen-summary'); call('runSummarySequence'); } },
    { label: 'Win screen',   fn: function () { resetTransient(); call('showPostLbd'); } },
  ];

  const COLORS = ['pink', 'green', 'red', 'yellow'];

  /* ---- panel UI -------------------------------------------------------- */
  function injectStyles() {
    const css = `
      #dbgPanel{position:fixed;top:48px;right:12px;z-index:2147483647;
        width:172px;font-family:system-ui,-apple-system,sans-serif;
        background:rgba(28,30,38,.94);color:#eef;border:1px solid #4a4f63;
        border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,.45);
        user-select:none;backdrop-filter:blur(4px);font-size:12px;}
      #dbgPanel.dbg-collapsed .dbg-body{display:none;}
      #dbgHead{display:flex;align-items:center;justify-content:space-between;
        padding:7px 10px;cursor:move;border-bottom:1px solid #3a3f52;
        background:rgba(255,255,255,.04);border-radius:10px 10px 0 0;
        font-weight:700;letter-spacing:.3px;}
      #dbgHead .dbg-x{cursor:pointer;opacity:.7;padding:0 4px;font-size:14px;}
      #dbgHead .dbg-x:hover{opacity:1;}
      .dbg-body{padding:8px;display:flex;flex-direction:column;gap:5px;}
      .dbg-label{font-size:10px;opacity:.55;text-transform:uppercase;
        letter-spacing:.6px;margin:4px 2px 1px;}
      .dbg-row{display:flex;gap:5px;flex-wrap:wrap;}
      #dbgPanel button{flex:1 1 auto;cursor:pointer;color:#eef;
        background:#363c52;border:1px solid #565c73;border-radius:6px;
        padding:6px 7px;font-size:11px;font-family:inherit;transition:background .12s;}
      #dbgPanel button:hover{background:#4a5375;}
      #dbgPanel button:active{transform:translateY(1px);}
      .dbg-c-pink{border-color:#e87bb5 !important;}
      .dbg-c-green{border-color:#7ec97e !important;}
      .dbg-c-red{border-color:#e88888 !important;}
      .dbg-c-yellow{border-color:#e6c84f !important;}
      #dbgToggle{position:fixed;top:12px;right:12px;z-index:2147483647;
        display:none;cursor:pointer;background:rgba(28,30,38,.94);color:#eef;
        border:1px solid #4a4f63;border-radius:8px;padding:5px 9px;font-size:12px;
        font-family:system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.4);}
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function makeButton(label, onClick, extraClass) {
    const b = document.createElement('button');
    b.textContent = label;
    if (extraClass) b.className = extraClass;
    b.addEventListener('click', onClick);
    return b;
  }

  function build() {
    injectStyles();

    const panel = document.createElement('div');
    panel.id = 'dbgPanel';

    /* header (drag handle + collapse) */
    const head = document.createElement('div');
    head.id = 'dbgHead';
    head.innerHTML = '<span>🐟 DEBUG</span>';
    const x = document.createElement('span');
    x.className = 'dbg-x';
    x.textContent = '–';
    x.title = 'Collapse (or press `)';
    head.appendChild(x);
    panel.appendChild(head);

    const body = document.createElement('div');
    body.className = 'dbg-body';

    /* screen jumps */
    const lblScreens = document.createElement('div');
    lblScreens.className = 'dbg-label';
    lblScreens.textContent = 'Screens';
    body.appendChild(lblScreens);
    ACTIONS.forEach(function (a) {
      const row = document.createElement('div');
      row.className = 'dbg-row';
      row.appendChild(makeButton(a.label, a.fn));
      body.appendChild(row);
    });

    /* counting per colour */
    const lblCount = document.createElement('div');
    lblCount.className = 'dbg-label';
    lblCount.textContent = 'Counting';
    body.appendChild(lblCount);
    const countRow = document.createElement('div');
    countRow.className = 'dbg-row';
    COLORS.forEach(function (c) {
      const b = makeButton(c[0].toUpperCase() + c.slice(1), function () {
        resetTransient();
        call('startCounting', c);
      }, 'dbg-c-' + c);
      countRow.appendChild(b);
    });
    body.appendChild(countRow);

    /* utilities */
    const lblUtil = document.createElement('div');
    lblUtil.className = 'dbg-label';
    lblUtil.textContent = 'Utilities';
    body.appendChild(lblUtil);
    const utilRow = document.createElement('div');
    utilRow.className = 'dbg-row';
    utilRow.appendChild(makeButton('Reset progress', function () {
      resetTransient();
      resetProgress();
      showScreen('screen-select');
    }));
    utilRow.appendChild(makeButton('Reload', function () { location.reload(); }));
    body.appendChild(utilRow);

    panel.appendChild(body);

    /* collapsed-state floating toggle */
    const toggle = document.createElement('div');
    toggle.id = 'dbgToggle';
    toggle.textContent = '🐟 DEBUG';

    document.body.appendChild(panel);
    document.body.appendChild(toggle);

    function setCollapsed(collapsed) {
      panel.classList.toggle('dbg-collapsed', collapsed);
      panel.style.display = collapsed ? 'none' : '';
      toggle.style.display = collapsed ? 'block' : 'none';
    }
    x.addEventListener('click', function (e) { e.stopPropagation(); setCollapsed(true); });
    toggle.addEventListener('click', function () { setCollapsed(false); });

    /* backtick toggles visibility */
    document.addEventListener('keydown', function (e) {
      if (e.key === '`' || e.key === '~') {
        setCollapsed(panel.style.display !== 'none' ? true : false);
      }
    });

    /* simple drag on the header */
    let dragging = false, ox = 0, oy = 0;
    head.addEventListener('pointerdown', function (e) {
      if (e.target === x) return;
      dragging = true;
      const r = panel.getBoundingClientRect();
      ox = e.clientX - r.left; oy = e.clientY - r.top;
      head.setPointerCapture(e.pointerId);
    });
    head.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      panel.style.left = (e.clientX - ox) + 'px';
      panel.style.top = (e.clientY - oy) + 'px';
      panel.style.right = 'auto';
    });
    head.addEventListener('pointerup', function () { dragging = false; });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
