/* Regenerate the games' page-turn posters:  node tools/gen-title-card.mjs
   ===========================================================================
   RUN THIS AFTER ANY CHANGE TO A GAME'S TITLE SCREEN. The output is a still of
   that screen, and a stale still means the picture visibly changes the moment
   the book hands over to the live game.

   WHY the poster is the whole title screen
   ----------------------------------------
   `LBD n/assets/title-card.webp` is what the flipbook leaf paints while the page
   uncurls, what backs the game iframe, and what #lbdCover holds over the game
   until it reports it has painted. It used to be the game's Bgm.webp — the
   banner art alone — but Gogo and "Let's Go" are separate elements inside the
   game, and a browser never rasterizes a hidden iframe, so they could not exist
   until after the turn finished. The page therefore uncurled onto a title with
   no character and no button, which appeared about half a second later. QA:
   "reveals an empty background texture first, followed by an abrupt pop-in of
   the game logo and UI elements".

   WHY it is rendered rather than composited
   -----------------------------------------
   Positioning the pieces by hand in the host would duplicate each game's layout
   and drift the first time anyone nudges a title screen. Shooting the game
   itself cannot drift.

   WHAT THE TITLE SCREENS MUST OBEY (a still cannot track a layout that isn't)
   --------------------------------------------------------------------------
   Every measurement on a title screen has to scale with the stage, because this
   still is rendered at 1920x1080 and displayed at whatever size the book's page
   happens to be. Two rules broke that and were fixed:
     • `.start-letsgo-btn { width: min(26%, 420px) }` — the px arm binds above a
       ~1615px stage, so the button was a different fraction of the stage at
       different sizes and visibly jumped at hand-over. Now a plain `26%`.
     • `startGenieFloat` began at `translateY(calc(-50% - 14px))` — a px offset
       is not proportional, so even frame 0 differed with scale. The keyframes
       now start at the neutral pose and swing either side of it.
   Keep new title-screen rules proportional (%, vw/vh) for the same reason.

   HOW the freeze works
   --------------------
   `?poster=1` makes each game keep its `title-hold` class forever, so the idle
   animations stay parked at frame 0 — the same pose the games hold until the
   book hands over. That means a plain `chrome --headless --screenshot` is
   enough; no debugger protocol, no flags, no dependencies.
   =========================================================================== */
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8799;
const WIDTH = 1920, HEIGHT = 1080;      // exactly 16:9 — maps 1:1 onto the leaf

const GAMES = [
  { dir: 'LBD 1', url: 'LBD%201' },
  { dir: 'LBD 2', url: 'LBD%202' },
];

const CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].find(p => existsSync(p));

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.ogg': 'audio/ogg', '.webm': 'video/webm', '.json': 'application/json' };

const run = (cmd, args) => new Promise((res, rej) => {
  const p = spawn(cmd, args, { stdio: 'ignore' });
  p.on('error', rej);
  p.on('exit', c => (c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`))));
});

if (!CHROME) {
  console.error('No Chrome/Chromium found — install one or edit the CHROME list above.');
  process.exit(1);
}

const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(req.url.split('?')[0]);
    const body = await readFile(join(ROOT, path));
    res.writeHead(200, { 'Content-Type': MIME[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(PORT, '127.0.0.1', r));

let manifest = await readFile(join(ROOT, 'preload-manifest.js'), 'utf8');

for (const g of GAMES) {
  const png = join(ROOT, g.dir, 'assets', 'title-card.png');
  const webp = join(ROOT, g.dir, 'assets', 'title-card.webp');

  await run(CHROME, [
    '--headless', '--disable-gpu', '--hide-scrollbars',
    `--window-size=${WIDTH},${HEIGHT}`,
    `--screenshot=${png}`,
    '--virtual-time-budget=6000',        // let art decode before the shot
    `http://127.0.0.1:${PORT}/${g.url}/index.html?poster=1`,
  ]);
  await run('cwebp', ['-q', '90', '-m', '6', png, '-o', webp]);
  await run('rm', ['-f', png]);

  const bytes = (await stat(webp)).size;
  const url = `${g.url}/assets/title-card.webp`;
  manifest = manifest.replace(
    new RegExp(`\\{"u":"${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}","s":\\d+`),
    `{"u":"${url}","s":${bytes}`);
  console.log(`${g.dir}: wrote assets/title-card.webp (${bytes} bytes)`);
}

// Keep the preloader's byte-accurate table honest (it drives the loading bar).
const files = manifest.match(/\{"u":/g)?.length ?? 0;
const total = [...manifest.matchAll(/"s":(\d+)/g)].reduce((a, m) => a + +m[1], 0);
manifest = manifest.replace(/\d+ files, [\d.]+ MB total\./,
  `${files} files, ${(total / 1048576).toFixed(1)} MB total.`);
await writeFile(join(ROOT, 'preload-manifest.js'), manifest);
console.log(`preload-manifest.js: ${files} files, ${(total / 1048576).toFixed(1)} MB`);

server.close();
