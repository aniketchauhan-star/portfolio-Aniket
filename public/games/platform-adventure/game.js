// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

// UI elements
const canvasShell = document.getElementById("canvasShell");
const hud = document.getElementById("hud");
const scoreDisplay = document.getElementById("scoreDisplay");
const seedDisplay = document.getElementById("seedDisplay");
const soundDisplay = document.getElementById("soundDisplay");
const loadingOverlay = document.getElementById("loadingOverlay");
const loadingText = document.getElementById("loadingText");
const startOverlay = document.getElementById("startOverlay");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const finalScoreText = document.getElementById("finalScoreText");
const bestScoreText = document.getElementById("bestScoreText");
const bestScoreLabel = document.getElementById("bestScoreLabel");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const mobileControls = document.getElementById("mobileControls");
const leftControl = document.getElementById("leftControl");
const rightControl = document.getElementById("rightControl");
const fireControl = document.getElementById("fireControl");
const jumpControl = document.getElementById("jumpControl");
const leftControlIcon = document.getElementById("leftControlIcon");
const rightControlIcon = document.getElementById("rightControlIcon");
const fireControlIcon = document.getElementById("fireControlIcon");
const jumpControlIcon = document.getElementById("jumpControlIcon");
const gameOverKicker = gameOverOverlay.querySelector(".end-kicker");
const gameOverTitle = gameOverOverlay.querySelector(".end-title");

// New UI refs
const scoreValue = document.getElementById("scoreValue");
const seedValue = document.getElementById("seedValue");
const levelLabel = document.getElementById("levelLabel");
const levelProgress = document.getElementById("levelProgress");
const pauseButton = document.getElementById("pauseButton");
const startSoundToggle = document.getElementById("startSoundToggle");
const finalCoinsText = document.getElementById("finalCoinsText");
const restartButtonLabel = document.getElementById("restartButtonLabel");
const replayButton = document.getElementById("replayButton");
const homeButton = document.getElementById("homeButton");
const pauseOverlay = document.getElementById("pauseOverlay");
const resumeButton = document.getElementById("resumeButton");
const pauseReplayButton = document.getElementById("pauseReplayButton");
const pauseHomeButton = document.getElementById("pauseHomeButton");
const rotateScreen = document.getElementById("rotateScreen");

// Lobby refs
const lobbyOverlay = document.getElementById("lobbyOverlay");
const lobbyHeroImage = document.getElementById("lobbyHeroImage");
const lobbyHeroName = document.getElementById("lobbyHeroName");
const lobbyHeroAbility = document.getElementById("lobbyHeroAbility");
const lobbyStats = document.getElementById("lobbyStats");
const carouselTrack = document.getElementById("carouselTrack");
const carouselPrev = document.getElementById("carouselPrev");
const carouselNext = document.getElementById("carouselNext");
const lobbyPlayButton = document.getElementById("lobbyPlayButton");
const levelPicker = document.getElementById("levelPicker");
const levelPickerPrev = document.getElementById("levelPickerPrev");
const levelPickerNext = document.getElementById("levelPickerNext");
const levelPickerValue = document.getElementById("levelPickerValue");
const lobbyBackButton = document.getElementById("lobbyBackButton");
const lobbySoundToggle = document.getElementById("lobbySoundToggle");
const lobbySettingsButton = document.getElementById("lobbySettingsButton");

// Game states
const STATES = {
  LOADING: "loading",
  START: "start",
  LOBBY: "lobby",
  PLAYING: "playing",
  PAUSED: "paused",
  LEVEL_COMPLETE: "level-complete",
  GAMEOVER: "gameover",
  WIN: "win"
};

const CHARACTERS = [
  {
    id: "original",
    name: "Hero",
    ability: "Adventurer",
    previewKey: "character",
    spriteKey: "character",
    stats: { speed: 4, jump: 4, power: 4 },
    locked: false
  },
  {
    id: "lana",
    name: "Lana",
    ability: "Fast Runner",
    previewKey: "lanaPreview",
    spriteKey: "lanaSprite",
    stats: { speed: 5, jump: 3, power: 3 },
    locked: false
  },
  {
    id: "andrew",
    name: "Andrew",
    ability: "Power Shooter",
    previewKey: "andrewPreview",
    spriteKey: "andrewSprite",
    stats: { speed: 3, jump: 4, power: 5 },
    locked: false
  }
];
const SELECTED_CHARACTER_KEY = "platform-adventure-selected-character";
let selectedCharacterIndex = 0;
let characterBaseSheet = null;
let originalPlayerFrames = null;
let originalPlayerAnimations = null;
const characterFrameCache = new Map();
const characterPortraitCache = new Map();

const SOUND_FILES = {
  bgm:         "audio/Background music.ogg",
  enemyKill:   "audio/enemies kill sound.ogg",
  playerDeath: "audio/character killed sound.ogg",
  coin:        "audio/Get coin sound.ogg"
};

const SOUND_VOLUMES = {
  bgm: 0.35,
  bgmGameOver: 0.22,
  enemyKill: 0.6,
  playerDeath: 0.8,
  coin: 0.5
};

// Main gameplay constants
const TILE_WIDTH = 64;
const TILE_HEIGHT = 64;
const GROUND_TOP = 476;
const UI_ANIMATION_DURATION = 320;

const CONFIG = {
  width: 960,
  height: 540,
  playerStartX: 80,
  cameraFollowX: 384,
  cameraBacktrackX: 220,
  playerWidth: 56,
  playerHeight: 56,
  playerMoveSpeed: 4.8,
  hitboxWidth: 40,
  hitboxHeight: 48,
  gravity: 0.7,
  jumpVelocity: -14,
  terminalVelocity: 18,
  backgroundSpeedFactor: 0.12,
  distanceScoreRate: 0.18,
  coinScore: 25,
  seedHitScore: 100,
  stompScore: 100,
  plantScore: 50,
  projectileWidth: 20,
  projectileHeight: 20,
  projectileSpeed: 8,
  projectileFrameDuration: 4,
  stompBounceVelocity: -8,
  // Forgiveness windows, in 60fps frames: jump just after walking off a ledge,
  // or press just before touching down, and it still counts.
  coyoteFrames: 6,
  jumpBufferFrames: 6,
  stompMinFallSpeed: 2,
  stompWindow: 18,
  collisionInset: 4,
  // The drawn sprite is bottom-aligned in the 56px player box and its visible
  // top lands this far down — so the head pokes above the hitbox, whose top is
  // at +8. Ceilings use this instead of the hitbox so it is the hair, not an
  // invisible box, that stops against a block's underside.
  //
  // MEASURED FROM assets/characters/CHARACTER.webp with the same column scan
  // extractSpriteFrames() uses: across its 7 frames the visible top sits at
  // 1.38-1.45 inside the box. Re-measure if the character art is re-exported;
  // verify/layering.mjs reports the overlap this leaves.
  headInset: 1.4,
  gateInset: 12,
  bestScoreKey: "endless-runner-best-score",
  highestUnlockedKey: "platform-adventure-highest-unlocked"
};

// Required art assets, organized under assets/ by category.
const REQUIRED_ASSET_PATHS = {
  background:       "assets/environment/GAME BACKGROUND.webp",
  path:             "assets/environment/PATH.webp",
  sunDecor:         "assets/environment/sun (1).webp",
  character:        "assets/characters/CHARACTER.webp",
  lanaPreview:      "assets/characters/lana.webp",
  lanaSprite:       "assets/characters/lana running.webp",
  andrewPreview:    "assets/characters/andrew.webp",
  andrewSprite:     "assets/characters/andrew running.webp",
  plant:            "assets/enemies/KILL PLANT.webp",
  flyingEnemy:      "assets/enemies/FLYING ENEMY.webp",
  groundEnemy:      "assets/enemies/GROUND ENEMY.webp",
  jumpEffect:       "assets/effects/JUMP EFFECT.webp",
  damageEffect:     "assets/effects/DAMAGE EFFECT.webp",
  hitEffect:        "assets/effects/HIT EFFECT.webp",
  animatedSeed:     "assets/items/ANIMATED SEED.webp",
  seedPickup:       "assets/items/SEED PICKUP.webp",
  coin:             "assets/items/COIN.webp",
  leftButton:       "assets/ui/LEFT BUTTON.webp",
  rightButton:      "assets/ui/RIGHT BUTTON.webp",
  fireButton:       "assets/ui/MAIN FIRE BUTTON.webp",
  jumpButton:       "assets/ui/JUMP BUTTON.webp",
  startPage:        "assets/ui/start page.webp",
  startButtonImage: "assets/ui/start button.webp"
};

// Optional art. Missing optional art should never crash the game.
// NOTE: hole / tree / mountain entries were removed — those files were never
// in the repo, so they 404'd on every load. The tree and mountain background
// layers are still coded and guarded by `if (assets.treeDecor)` etc., so
// dropping the art back in and re-adding the paths here revives them.
const OPTIONAL_ASSET_PATHS = {
  exitGate:      "assets/ui/exit gate.webp",
  cloud:         "assets/environment/CLOUD.webp"
};

// ---------------------------------------------------------------------------
// Asset preloader
//
// Media formats: art ships as WebP, audio as Ogg Opus. Both are supported by
// Chrome, Edge, Firefox and recent Safari (WebP from Safari 14, Ogg Opus from
// Safari 15). Older browsers get no art rather than a broken game, which is
// why every load path below degrades instead of throwing.
//
// Progress is byte-accurate: each asset is streamed through a ReadableStream
// reader so the bar tracks real bytes, not file counts — a 1.2 MB music track
// and a 6 KB button used to move the bar by exactly the same amount. Weights
// start from ASSET_BYTES (generated from the files on disk) and are corrected
// by Content-Length whenever the server sends one.
//
// Guarantees:
//   * monotonic — the reported percentage never goes backwards
//   * smallest-first — cover art, buttons and sprites land in the first
//     seconds instead of queueing behind the music track
//   * bounded concurrency, and a per-transfer abort timeout
//   * a failure NEVER blocks the game: a 404, a stall, an abort, or a
//     file:// page (where fetch is blocked outright) all count as complete,
//     and the element simply keeps its original file URL
// ---------------------------------------------------------------------------

const ASSET_BYTES = {
  "assets/characters/CHARACTER.webp": 138766,
  "assets/characters/andrew running.webp": 142734,
  "assets/characters/andrew.webp": 108454,
  "assets/characters/lana running.webp": 143166,
  "assets/characters/lana.webp": 89984,
  "assets/effects/DAMAGE EFFECT.webp": 55362,
  "assets/effects/HIT EFFECT.webp": 85898,
  "assets/effects/JUMP EFFECT.webp": 8578,
  "assets/enemies/FLYING ENEMY.webp": 78582,
  "assets/enemies/GROUND ENEMY.webp": 14440,
  "assets/enemies/KILL PLANT.webp": 124690,
  "assets/environment/CLOUD.webp": 74808,
  "assets/environment/GAME BACKGROUND.webp": 7350,
  "assets/environment/PATH.webp": 71580,
  "assets/environment/sun (1).webp": 13294,
  "assets/items/ANIMATED SEED.webp": 95314,
  "assets/items/COIN.webp": 14014,
  "assets/items/SEED PICKUP.webp": 70816,
  "assets/ui/JUMP BUTTON.webp": 10286,
  "assets/ui/LEFT BUTTON.webp": 6854,
  "assets/ui/MAIN FIRE BUTTON.webp": 115854,
  "assets/ui/RIGHT BUTTON.webp": 6064,
  "assets/ui/exit gate.webp": 221950,
  "assets/ui/start button.webp": 196204,
  "assets/ui/start page.webp": 180560,
  "audio/Background music.ogg": 1267555,
  "audio/Get coin sound.ogg": 30137,
  "audio/character killed sound.ogg": 23199,
  "audio/enemies kill sound.ogg": 11513
};

const PRELOAD_CONCURRENCY = 5;
const PRELOAD_TIMEOUT_MS = 20000;
const PRELOAD_WATCHDOG_MS = 45000;
const UNKNOWN_ASSET_BYTES = 65536;

// Fraction of the bar given to network bytes; the tail covers image decode.
const PRELOAD_BAR_SHARE = 0.92;

const preloadedBlobUrls = new Map();

// Assets the stylesheet already pulls in on its own. style.css paints the
// start cover as the loading screen's backdrop, so it is in flight before any
// JS runs. Fetching it again here would download the largest image twice, so
// these are tracked with an Image() load instead: it resolves off the same
// cache entry, costs no extra bytes, and still contributes its real weight to
// the progress bar.
const CSS_OWNED_ASSETS = new Set(["assets/ui/start page.webp"]);

// Resolve an asset to the local blob: URL the preloader captured, falling back
// to the real file URL when the fetch was skipped or failed.
function assetUrl(path) {
  return preloadedBlobUrls.get(path) || encodeURI(path);
}

// One-time revert for any media element pointed at a blob: URL. A revoked or
// undecodable blob would otherwise leave the element permanently silent.
function bindBlobFallback(mediaEl, path) {
  let reverted = false;
  mediaEl.addEventListener("error", () => {
    if (reverted) return;
    const current = mediaEl.getAttribute("src") || "";
    if (!current.startsWith("blob:")) return;
    reverted = true;
    const shouldResume = !mediaEl.paused;
    console.warn(`[Blob playback failed] reverting "${path}" to its file URL`);
    mediaEl.src = encodeURI(path);
    if (shouldResume) {
      const resumed = mediaEl.play();
      if (resumed && typeof resumed.catch === "function") resumed.catch(() => {});
    }
  });
}

function preloadAssets(paths, onProgress) {
  const weights = new Map();
  const loadedBytes = new Map();
  paths.forEach((path) => {
    weights.set(path, ASSET_BYTES[path] || UNKNOWN_ASSET_BYTES);
    loadedBytes.set(path, 0);
  });

  let reportedPercent = 0;
  const report = () => {
    let total = 0;
    let loaded = 0;
    weights.forEach((weight) => { total += weight; });
    loadedBytes.forEach((bytes) => { loaded += bytes; });
    const percent = total > 0 ? (loaded / total) * 100 : 100;
    // Monotonic: Content-Length corrections can grow the total mid-flight.
    reportedPercent = Math.min(100, Math.max(reportedPercent, percent));
    onProgress(reportedPercent);
  };

  // Smallest first, so the start cover and buttons are ready almost at once.
  const queue = paths.slice().sort((a, b) => weights.get(a) - weights.get(b));
  let cursor = 0;

  // Wait on the stylesheet's own copy rather than issuing a second request.
  const adoptCssAsset = (path) => new Promise((resolve) => {
    const finish = () => {
      loadedBytes.set(path, weights.get(path));
      report();
      resolve();
    };
    const image = new Image();
    const timer = window.setTimeout(finish, PRELOAD_TIMEOUT_MS);
    const settle = () => { window.clearTimeout(timer); finish(); };
    image.onload = settle;
    image.onerror = settle;
    image.src = encodeURI(path);
  });

  const fetchOne = async (path) => {
    if (CSS_OWNED_ASSETS.has(path)) {
      await adoptCssAsset(path);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), PRELOAD_TIMEOUT_MS);

    try {
      const response = await fetch(encodeURI(path), { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const declared = Number(response.headers.get("content-length"));
      if (Number.isFinite(declared) && declared > 0) {
        weights.set(path, declared);
      }

      const type = response.headers.get("content-type") || "";
      let blob;

      if (response.body && typeof response.body.getReader === "function") {
        const reader = response.body.getReader();
        const chunks = [];
        let received = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.byteLength;
          // Cap at the declared weight so one asset can't run the bar ahead.
          loadedBytes.set(path, Math.min(received, weights.get(path)));
          report();
        }
        weights.set(path, Math.max(weights.get(path), received));
        blob = new Blob(chunks, { type });
      } else {
        blob = await response.blob();
      }

      loadedBytes.set(path, weights.get(path));
      preloadedBlobUrls.set(path, URL.createObjectURL(blob));
    } catch (error) {
      // Deliberately counted as complete — see the guarantees above.
      console.warn(`[Preload skipped] "${path}": ${error && error.message}`);
      loadedBytes.set(path, weights.get(path));
    } finally {
      window.clearTimeout(timer);
      report();
    }
  };

  const runWorker = async () => {
    while (cursor < queue.length) {
      const path = queue[cursor];
      cursor += 1;
      await fetchOne(path);
    }
  };

  report();
  const workers = [];
  const width = Math.min(PRELOAD_CONCURRENCY, queue.length);
  for (let i = 0; i < width; i += 1) {
    workers.push(runWorker());
  }
  return Promise.all(workers);
}

// The sun and cloud artwork sit inside large transparent canvases, so drawing
// the whole file makes them look tiny. These are the visible pixel boxes,
// stored as fractions of the source image so a rescaled export still works.
//
// The numbers below are DERIVED at load by deriveSpriteTrims(), so re-exporting
// either file with different padding re-frames it automatically instead of
// silently drifting. They are kept as literals only as the fallback for the one
// case where the pixels cannot be read back: a tainted canvas on a file:// page.
//
// Measured from the art as it ships today, which is exactly what
// extractOpaqueBounds() recomputes:
//   assets/environment/sun (1).webp   1920x1080, opaque box  x1028 y412  118x112
//   assets/environment/CLOUD.webp     1536x1024, opaque box  x383  y303  794x304
const SPRITE_TRIM = {
  sun: { x: 0.5354, y: 0.3815, width: 0.0615, height: 0.1037 },
  cloud: { x: 0.2493, y: 0.2959, width: 0.5169, height: 0.2969 }
};

// Which asset each trim entry is measured from.
const SPRITE_TRIM_SOURCES = { sun: "sunDecor", cloud: "cloud" };

// Replace the fallback fractions with the real opaque box of the loaded art.
// A full-image alpha scan is not cheap, so this runs once, behind the loading
// bar, and only for the two padded decorations that need it.
function deriveSpriteTrims() {
  for (const [key, assetKey] of Object.entries(SPRITE_TRIM_SOURCES)) {
    const image = assets[assetKey];
    if (!image || !image.width || !image.height) continue;

    const bounds = extractOpaqueBounds(image);
    // extractOpaqueBounds() returns the full frame both when the art really is
    // edge-to-edge and when the pixel read was blocked; either way there is no
    // padding to trim, so the measured fallback is the better guess.
    if (bounds.width >= image.width && bounds.height >= image.height) continue;
    if (bounds.width <= 0 || bounds.height <= 0) continue;

    SPRITE_TRIM[key] = {
      x: bounds.x / image.width,
      y: bounds.y / image.height,
      width: bounds.width / image.width,
      height: bounds.height / image.height
    };
  }
}

function getTrimRect(image, trim) {
  const w = Math.max(1, image?.width || 1);
  const h = Math.max(1, image?.height || 1);
  return {
    sx: trim.x * w,
    sy: trim.y * h,
    sw: Math.max(1, trim.width * w),
    sh: Math.max(1, trim.height * h)
  };
}

function getTrimmedAspect(image, trim) {
  const rect = getTrimRect(image, trim);
  return rect.sw / rect.sh;
}

const BACKGROUND_LAYER_CONFIG = {
  grassland: {
    sun: { x: 700, y: 46, height: 126, alpha: 0.96, factor: 0.1 },
    mountain: { height: 248, bottom: GROUND_TOP + 18, spacing: 620, alpha: 0.78, factor: 0.3, startX: -260 },
    tree: {
      baseHeight: 168,
      baseY: GROUND_TOP + 24,
      clusterSpacing: 760,
      alpha: 0.9,
      factor: 0.6,
      startX: -180,
      clusterOffsets: [0, 92, 196],
      clusterScales: [0.82, 1, 0.9]
    }
  },
  sunset: {
    sun: { x: 686, y: 52, height: 134, alpha: 0.92, factor: 0.1 },
    mountain: { height: 266, bottom: GROUND_TOP + 20, spacing: 660, alpha: 0.8, factor: 0.3, startX: -280 },
    tree: {
      baseHeight: 176,
      baseY: GROUND_TOP + 26,
      clusterSpacing: 800,
      alpha: 0.92,
      factor: 0.6,
      startX: -190,
      clusterOffsets: [0, 104, 220],
      clusterScales: [0.84, 1.04, 0.92]
    }
  },
  midnight: {
    sun: { x: 704, y: 42, height: 106, alpha: 0.88, factor: 0.1 },
    mountain: { height: 228, bottom: GROUND_TOP + 16, spacing: 600, alpha: 0.68, factor: 0.3, startX: -240 },
    tree: {
      baseHeight: 156,
      baseY: GROUND_TOP + 20,
      clusterSpacing: 720,
      alpha: 0.86,
      factor: 0.6,
      startX: -170,
      clusterOffsets: [0, 86, 178],
      clusterScales: [0.8, 0.98, 0.88]
    }
  }
};

const LEVEL_THEMES = {
  grassland: {
    gateFrame: "#ffd565",
    gateGlow: "rgba(255, 239, 170, 0.55)",
    gateInner: "#233a5f",
    bannerAccent: "#ffe58d",
    holeShadeTop: "rgba(10, 18, 32, 0.08)",
    holeShadeBottom: "rgba(8, 14, 24, 0.24)"
  },
  sunset: {
    gateFrame: "#ffd28a",
    gateGlow: "rgba(255, 201, 125, 0.52)",
    gateInner: "#442540",
    bannerAccent: "#ffd9a3",
    holeShadeTop: "rgba(28, 14, 16, 0.10)",
    holeShadeBottom: "rgba(20, 10, 12, 0.28)"
  },
  midnight: {
    gateFrame: "#8ce0ff",
    gateGlow: "rgba(111, 224, 255, 0.48)",
    gateInner: "#18324f",
    bannerAccent: "#a7e5ff",
    holeShadeTop: "rgba(4, 8, 18, 0.18)",
    holeShadeBottom: "rgba(2, 6, 14, 0.38)"
  }
};

const levels = buildLevels();
const assets = {};

let playerFrames = [];
let playerAnimations = {
  idle: [0],
  run: [0],
  jump: [0]
};
let flyingEnemyFrames = [];
let groundEnemyFrames = [];
let coinFrames = [];
let jumpEffectFrames = [];
let damageEffectFrames = [];
let seedProjectileFrames = [];
let seedPickupFrames = [];
let hitEffectFrames = [];
let plantFrames = [];
let groundTileSource = { x: 0, y: 0, width: 1, height: 1 };

let terrainSegments = [];
let decorations = [];
let enemies = [];
let plants = [];
let coins = [];
let seedPickups = [];
let projectiles = [];
let effects = [];
let currentGate = null;
let currentLevel = null;
let currentLevelIndex = 0;
let levelStartBannerTimer = 0;
const LEVEL_START_BANNER_DURATION = 150; // frames @60fps → ~2.5s
let levelStartBannerTitle = "";
let levelStartBannerSubtitle = "";

let state = STATES.LOADING;
let lastFrameTime = 0;
let bestScore = readBestScore();
let isMuted = false;
let audioUnlocked = false;

const uiState = {
  displayedScore: 0,
  displayedSeeds: 0,
  lastSeedCount: 0,
  hideTimers: new Map(),
  startTransitionActive: false,
  restartTransitionActive: false
};

const world = {
  backgroundOffset: 0,
  offsetX: 0,
  score: 0
};

const sounds = {
  bgm: createAudioAsset("bgm", SOUND_FILES.bgm, {
    loop: true,
    volume: SOUND_VOLUMES.bgm
  }),
  enemyKill: createAudioAsset("enemyKill", SOUND_FILES.enemyKill, {
    volume: SOUND_VOLUMES.enemyKill
  }),
  playerDeath: createAudioAsset("playerDeath", SOUND_FILES.playerDeath, {
    volume: SOUND_VOLUMES.playerDeath
  }),
  coin: createAudioAsset("coin", SOUND_FILES.coin, {
    volume: SOUND_VOLUMES.coin
  })
};

const input = {
  left: false,
  right: false
};

const player = {
  x: CONFIG.playerStartX,
  y: GROUND_TOP - CONFIG.playerHeight,
  width: CONFIG.playerWidth,
  height: CONFIG.playerHeight,
  dx: 0,
  dy: 0,
  moveSpeed: CONFIG.playerMoveSpeed,
  grounded: true,
  facingRight: true,
  isMovingHorizontally: false,
  state: "idle",
  lastState: "idle",
  animationFrame: 0,
  animationTimer: 0,
  seeds: 0,
  coyoteTimer: 0,
  jumpBufferTimer: 0
};

function buildLevels() {
  // A note on the platforms sitting at y:356 — that is not an arbitrary number.
  // Terrain blocks are TILE_HEIGHT (64) deep, so a platform's underside is at
  // y+64, and a player standing on the ground at GROUND_TOP has the top of his
  // head at 476 - 56 + CONFIG.headInset = 421.4. Any platform in the 358..364
  // band therefore has an underside that grazes his hair as he walks beneath
  // it. 356 puts the underside at 420, clearing the head by 1.4px, while still
  // being low enough to walk under. verify/layering.mjs measures what is left.
  const spawn = { x: 80, y: GROUND_TOP - CONFIG.playerHeight };
  const gateAt = (x) => ({ x, y: 356, width: 84, height: 120 });
  const groundDecor = (worldWidth, theme = "grassland") => {
    const list = [
      { type: "sun", x: 140, y: 74, width: 78, height: 78 },
      { type: "mountain", x: 200, y: 300, width: 300, height: 150 },
      { type: "mountain", x: Math.round(worldWidth * 0.55), y: 316, width: 260, height: 140 }
    ];
    return list;
  };

  return [
    {
      id: 1,
      name: "Green Hills",
      subtitle: "Learn the ropes",
      theme: "grassland",
      playerStart: spawn,
      worldWidth: 2800,
      terrain: [
        { type: "ground", x: 0, y: GROUND_TOP, width: 640 },
        { type: "ground", x: 768, y: GROUND_TOP, width: 576 },
        { type: "ground", x: 1472, y: GROUND_TOP, width: 512 },
        { type: "ground", x: 2112, y: GROUND_TOP, width: 688 },
        { type: "platform", x: 1024, y: 404, width: 192 },
        { type: "platform", x: 1632, y: 372, width: 192 },
        { type: "platform", x: 2320, y: 420, width: 192 }
      ],
      enemies: [
        { type: "ground", x: 930, patrolRange: 72, direction: 1, speed: 0.95 },
        { type: "flying", x: 1540, y: 248, patrolRange: 96, direction: -1, speed: 1.05 },
        { type: "ground", x: 1860, patrolRange: 64, direction: -1, speed: 0.9 },
        { type: "plant", x: 2456 }
      ],
      coins: [
        { x: 246, y: 360 }, { x: 310, y: 324 }, { x: 374, y: 360 },
        { x: 1060, y: 332 }, { x: 1124, y: 296 }, { x: 1188, y: 332 },
        { x: 1668, y: 300 }, { x: 1732, y: 268 }, { x: 1796, y: 300 },
        { x: 2218, y: 360 }, { x: 2282, y: 324 }, { x: 2346, y: 292 }, { x: 2410, y: 324 }
      ],
      seeds: [
        // Was x:2490 — that sat 73% inside the platform at (2320,420), and
        // lifting it clear of the deck parked it inside the plant at x:2456.
        // Moved past the platform instead, so it rests on open ground.
        { x: 824, y: 420 }, { x: 1696, y: 330 }, { x: 2560, y: 420 }
      ],
      decorations: groundDecor(2800),
      gate: gateAt(2660)
    },
    {
      id: 2,
      name: "Coin Trail",
      subtitle: "Follow the shinies",
      theme: "grassland",
      playerStart: spawn,
      worldWidth: 2600,
      terrain: [
        { type: "ground", x: 0, y: GROUND_TOP, width: 640 },
        { type: "ground", x: 768, y: GROUND_TOP, width: 576 },
        { type: "ground", x: 1472, y: GROUND_TOP, width: 576 },
        { type: "ground", x: 2176, y: GROUND_TOP, width: 424 }
      ],
      enemies: [
        { type: "ground", x: 1050, patrolRange: 70, direction: 1, speed: 0.9 },
        { type: "ground", x: 1660, patrolRange: 70, direction: -1, speed: 0.9 },
        { type: "flying", x: 2280, y: 270, patrolRange: 90, direction: -1, speed: 1.0 }
      ],
      coins: [
        { x: 200, y: 400 }, { x: 260, y: 400 }, { x: 320, y: 400 }, { x: 380, y: 400 },
        { x: 670, y: 380 }, { x: 704, y: 340 }, { x: 738, y: 380 },
        { x: 830, y: 400 }, { x: 890, y: 400 }, { x: 950, y: 400 },
        { x: 1180, y: 400 }, { x: 1220, y: 400 },
        { x: 1310, y: 380 }, { x: 1344, y: 340 }, { x: 1378, y: 380 },
        { x: 1500, y: 400 }, { x: 1560, y: 400 },
        { x: 1730, y: 400 }, { x: 1790, y: 400 },
        { x: 1950, y: 380 }, { x: 1984, y: 340 }, { x: 2018, y: 380 },
        { x: 2200, y: 400 }, { x: 2260, y: 400 }, { x: 2320, y: 400 }
      ],
      seeds: [
        { x: 150, y: 420 }, { x: 1500, y: 420 }
      ],
      decorations: groundDecor(2600),
      gate: gateAt(2450)
    },
    {
      id: 3,
      name: "First Flight",
      subtitle: "Watch the sky!",
      theme: "grassland",
      playerStart: spawn,
      worldWidth: 2800,
      terrain: [
        { type: "ground", x: 0, y: GROUND_TOP, width: 512 },
        { type: "ground", x: 640, y: GROUND_TOP, width: 576 },
        { type: "ground", x: 1344, y: GROUND_TOP, width: 576 },
        { type: "ground", x: 2048, y: GROUND_TOP, width: 752 },
        { type: "platform", x: 900, y: 400, width: 192 },
        { type: "platform", x: 1500, y: 380, width: 192 },
        { type: "platform", x: 2200, y: 400, width: 192 }
      ],
      enemies: [
        { type: "flying", x: 680, y: 280, patrolRange: 100, direction: 1, speed: 1.0 },
        { type: "flying", x: 1400, y: 240, patrolRange: 120, direction: -1, speed: 1.05 },
        { type: "ground", x: 1700, patrolRange: 80, direction: 1, speed: 0.95 },
        { type: "flying", x: 2350, y: 220, patrolRange: 130, direction: -1, speed: 1.1 }
      ],
      coins: [
        { x: 200, y: 400 }, { x: 260, y: 400 }, { x: 320, y: 400 },
        { x: 930, y: 360 }, { x: 990, y: 360 }, { x: 1050, y: 360 },
        { x: 1400, y: 320 }, { x: 1500, y: 300 }, { x: 1600, y: 320 },
        { x: 1750, y: 400 }, { x: 1810, y: 400 },
        { x: 2230, y: 360 }, { x: 2290, y: 340 }, { x: 2350, y: 360 },
        { x: 2500, y: 400 }, { x: 2560, y: 400 }
      ],
      seeds: [
        { x: 400, y: 420 }, { x: 1300, y: 420 }, { x: 2100, y: 420 }
      ],
      decorations: groundDecor(2800),
      gate: gateAt(2660)
    },
    {
      id: 4,
      name: "Bouncy Path",
      subtitle: "Jump, jump, jump!",
      theme: "grassland",
      playerStart: spawn,
      worldWidth: 3000,
      terrain: [
        { type: "ground", x: 0, y: GROUND_TOP, width: 448 },
        { type: "ground", x: 608, y: GROUND_TOP, width: 448 },
        { type: "ground", x: 1216, y: GROUND_TOP, width: 448 },
        { type: "ground", x: 1824, y: GROUND_TOP, width: 448 },
        { type: "ground", x: 2432, y: GROUND_TOP, width: 568 },
        { type: "platform", x: 470, y: 420, width: 128 },
        { type: "platform", x: 1070, y: 400, width: 128 },
        { type: "platform", x: 1680, y: 380, width: 128 },
        { type: "platform", x: 2000, y: 356, width: 128 },
        { type: "platform", x: 2280, y: 400, width: 128 }
      ],
      enemies: [
        { type: "ground", x: 800, patrolRange: 72, direction: -1, speed: 0.95 },
        { type: "ground", x: 1400, patrolRange: 72, direction: 1, speed: 0.95 },
        { type: "flying", x: 2100, y: 270, patrolRange: 100, direction: -1, speed: 1.05 },
        { type: "ground", x: 2700, patrolRange: 64, direction: -1, speed: 1.0 }
      ],
      coins: [
        { x: 200, y: 400 }, { x: 480, y: 380 }, { x: 534, y: 380 },
        { x: 700, y: 400 }, { x: 800, y: 400 }, { x: 900, y: 400 },
        { x: 1080, y: 360 }, { x: 1134, y: 360 },
        { x: 1300, y: 400 }, { x: 1500, y: 400 },
        { x: 1690, y: 340 }, { x: 1744, y: 340 },
        { x: 2000, y: 320 }, { x: 2054, y: 320 },
        { x: 2290, y: 360 }, { x: 2344, y: 360 },
        { x: 2500, y: 400 }, { x: 2580, y: 400 }, { x: 2660, y: 400 }, { x: 2820, y: 400 }
      ],
      seeds: [
        { x: 200, y: 420 }, { x: 1000, y: 420 }, { x: 2020, y: 320 }
      ],
      decorations: groundDecor(3000),
      gate: gateAt(2900)
    },
    {
      id: 5,
      name: "Seed Hunt",
      subtitle: "Collect. Aim. Fire!",
      theme: "grassland",
      playerStart: spawn,
      worldWidth: 3200,
      terrain: [
        { type: "ground", x: 0, y: GROUND_TOP, width: 640 },
        { type: "ground", x: 800, y: GROUND_TOP, width: 576 },
        { type: "ground", x: 1536, y: GROUND_TOP, width: 512 },
        { type: "ground", x: 2208, y: GROUND_TOP, width: 512 },
        { type: "ground", x: 2880, y: GROUND_TOP, width: 320 },
        { type: "platform", x: 400, y: 400, width: 128 },
        { type: "platform", x: 1050, y: 380, width: 128 },
        { type: "platform", x: 1800, y: 356, width: 128 },
        { type: "platform", x: 2450, y: 356, width: 128 }
      ],
      enemies: [
        { type: "ground", x: 900, patrolRange: 72, direction: 1, speed: 0.95 },
        { type: "flying", x: 1200, y: 260, patrolRange: 100, direction: -1, speed: 1.0 },
        { type: "ground", x: 1700, patrolRange: 76, direction: -1, speed: 1.0 },
        { type: "flying", x: 2300, y: 220, patrolRange: 110, direction: 1, speed: 1.05 },
        // Was x:2960, which put the plant's hitbox over the coin at (3000,400).
        { type: "plant", x: 2930 }
      ],
      coins: [
        { x: 220, y: 400 }, { x: 280, y: 400 },
        { x: 720, y: 380 }, { x: 750, y: 340 }, { x: 780, y: 380 },
        { x: 1080, y: 340 }, { x: 1134, y: 340 },
        { x: 1440, y: 380 }, { x: 1470, y: 340 }, { x: 1500, y: 380 },
        { x: 1820, y: 320 }, { x: 1874, y: 320 },
        { x: 2100, y: 400 }, { x: 2160, y: 400 },
        { x: 2470, y: 300 }, { x: 2524, y: 300 },
        { x: 2900, y: 400 }, { x: 3000, y: 400 }
      ],
      seeds: [
        // 410 / 1060 / 1820 used to be authored at deck level, so a third of
        // each sprite sat inside its platform tile. Now they rest on top.
        { x: 150, y: 420 }, { x: 410, y: 366 }, { x: 850, y: 420 },
        { x: 1060, y: 346 }, { x: 1600, y: 420 }, { x: 1820, y: 326 }, { x: 2470, y: 320 }
      ],
      decorations: groundDecor(3200),
      gate: gateAt(3100)
    },
    {
      id: 6,
      name: "Floating Islands",
      subtitle: "Hop across the sky",
      theme: "sunset",
      playerStart: spawn,
      worldWidth: 3400,
      terrain: [
        { type: "ground", x: 0, y: GROUND_TOP, width: 384 },
        { type: "ground", x: 2500, y: GROUND_TOP, width: 900 },
        { type: "platform", x: 500, y: 420, width: 128 },
        { type: "platform", x: 720, y: 400, width: 128 },
        { type: "platform", x: 940, y: 420, width: 128 },
        { type: "platform", x: 1160, y: 400, width: 128 },
        { type: "platform", x: 1380, y: 440, width: 128 },
        { type: "platform", x: 1600, y: 400, width: 128 },
        { type: "platform", x: 1820, y: 420, width: 128 },
        { type: "platform", x: 2040, y: 400, width: 128 },
        { type: "platform", x: 2260, y: 420, width: 128 }
      ],
      enemies: [
        { type: "flying", x: 1000, y: 280, patrolRange: 140, direction: 1, speed: 1.0 },
        { type: "flying", x: 1800, y: 240, patrolRange: 140, direction: -1, speed: 1.05 },
        { type: "ground", x: 2700, patrolRange: 100, direction: -1, speed: 0.95 }
      ],
      coins: [
        { x: 200, y: 400 },
        { x: 520, y: 380 }, { x: 580, y: 380 },
        { x: 740, y: 360 }, { x: 800, y: 360 },
        { x: 960, y: 380 }, { x: 1020, y: 380 },
        { x: 1180, y: 360 }, { x: 1240, y: 360 },
        { x: 1400, y: 400 }, { x: 1460, y: 400 },
        { x: 1620, y: 360 }, { x: 1680, y: 360 },
        { x: 1840, y: 380 }, { x: 1900, y: 380 },
        { x: 2060, y: 360 }, { x: 2120, y: 360 },
        { x: 2280, y: 380 }, { x: 2340, y: 380 },
        { x: 2600, y: 400 }, { x: 2680, y: 400 }, { x: 2760, y: 400 }
      ],
      seeds: [
        { x: 200, y: 420 }, { x: 1400, y: 400 }
      ],
      decorations: groundDecor(3400, "sunset"),
      gate: gateAt(3260)
    },
    {
      id: 7,
      name: "Enemy Valley",
      subtitle: "Watch your step",
      theme: "sunset",
      playerStart: spawn,
      worldWidth: 3400,
      terrain: [
        { type: "ground", x: 0, y: GROUND_TOP, width: 512 },
        { type: "ground", x: 672, y: GROUND_TOP, width: 384 },
        { type: "ground", x: 1216, y: GROUND_TOP, width: 384 },
        { type: "ground", x: 1760, y: GROUND_TOP, width: 384 },
        { type: "ground", x: 2304, y: GROUND_TOP, width: 384 },
        { type: "ground", x: 2848, y: GROUND_TOP, width: 552 },
        { type: "platform", x: 900, y: 400, width: 128 },
        { type: "platform", x: 1900, y: 380, width: 128 },
        { type: "platform", x: 2500, y: 400, width: 128 }
      ],
      enemies: [
        { type: "ground", x: 780, patrolRange: 80, direction: 1, speed: 0.95 },
        { type: "flying", x: 1400, y: 260, patrolRange: 100, direction: -1, speed: 1.0 },
        { type: "ground", x: 1850, patrolRange: 70, direction: -1, speed: 1.0 },
        { type: "flying", x: 2450, y: 240, patrolRange: 110, direction: 1, speed: 1.05 },
        // Was x:2960, which put the plant's hitbox over the coin at (3000,400).
        { type: "plant", x: 2920 }
      ],
      coins: [
        { x: 200, y: 400 }, { x: 260, y: 400 },
        { x: 700, y: 400 }, { x: 900, y: 360 }, { x: 954, y: 360 },
        { x: 1240, y: 400 }, { x: 1300, y: 400 }, { x: 1360, y: 400 },
        { x: 1780, y: 400 }, { x: 1920, y: 340 }, { x: 1974, y: 340 },
        { x: 2340, y: 400 }, { x: 2400, y: 400 },
        { x: 2520, y: 360 }, { x: 2574, y: 360 },
        { x: 2880, y: 400 }, { x: 3000, y: 400 }, { x: 3120, y: 400 }
      ],
      seeds: [
        { x: 150, y: 420 }, { x: 1250, y: 420 }, { x: 2350, y: 420 }
      ],
      decorations: groundDecor(3400, "sunset"),
      gate: gateAt(3300)
    },
    {
      id: 8,
      name: "High Road",
      subtitle: "Choose your path",
      theme: "sunset",
      playerStart: spawn,
      worldWidth: 3600,
      terrain: [
        { type: "ground", x: 0, y: GROUND_TOP, width: 448 },
        { type: "ground", x: 608, y: GROUND_TOP, width: 512 },
        { type: "ground", x: 1272, y: GROUND_TOP, width: 512 },
        { type: "ground", x: 1936, y: GROUND_TOP, width: 512 },
        { type: "ground", x: 2600, y: GROUND_TOP, width: 512 },
        { type: "ground", x: 3200, y: GROUND_TOP, width: 400 },
        { type: "platform", x: 570, y: 380, width: 128 },
        { type: "platform", x: 820, y: 356, width: 128 },
        { type: "platform", x: 1080, y: 340, width: 128 },
        { type: "platform", x: 1400, y: 320, width: 128 },
        { type: "platform", x: 1720, y: 340, width: 128 },
        { type: "platform", x: 2040, y: 356, width: 128 },
        { type: "platform", x: 2360, y: 380, width: 128 },
        { type: "platform", x: 2680, y: 400, width: 128 }
      ],
      enemies: [
        { type: "ground", x: 800, patrolRange: 32, direction: 1, speed: 0.95 },
        { type: "flying", x: 1200, y: 260, patrolRange: 100, direction: -1, speed: 1.0 },
        { type: "ground", x: 1600, patrolRange: 76, direction: -1, speed: 0.95 },
        { type: "flying", x: 2100, y: 240, patrolRange: 110, direction: 1, speed: 1.05 },
        { type: "ground", x: 2800, patrolRange: 80, direction: 1, speed: 1.0 }
      ],
      coins: [
        { x: 200, y: 400 }, { x: 320, y: 400 },
        { x: 590, y: 340 }, { x: 840, y: 320 }, { x: 1100, y: 300 },
        { x: 1420, y: 280 }, { x: 1740, y: 300 }, { x: 2060, y: 320 },
        { x: 2380, y: 340 }, { x: 2700, y: 360 },
        // 2800 was inside the platform at (2680,400); raised onto its deck.
        { x: 700, y: 400 }, { x: 1400, y: 400 }, { x: 2000, y: 400 }, { x: 2800, y: 368 }, { x: 3300, y: 400 }
      ],
      seeds: [
        { x: 150, y: 420 }, { x: 620, y: 340 }, { x: 1900, y: 320 }, { x: 3000, y: 420 }
      ],
      decorations: groundDecor(3600, "sunset"),
      gate: gateAt(3500)
    },
    {
      id: 9,
      name: "Sky Coins",
      subtitle: "Up, up, up!",
      theme: "grassland",
      playerStart: spawn,
      worldWidth: 3400,
      terrain: [
        { type: "ground", x: 0, y: GROUND_TOP, width: 448 },
        { type: "ground", x: 2700, y: GROUND_TOP, width: 700 },
        { type: "platform", x: 500, y: 420, width: 128 },
        { type: "platform", x: 720, y: 380, width: 128 },
        { type: "platform", x: 940, y: 340, width: 128 },
        { type: "platform", x: 1160, y: 300, width: 128 },
        { type: "platform", x: 1380, y: 260, width: 128 },
        { type: "platform", x: 1600, y: 260, width: 128 },
        { type: "platform", x: 1820, y: 300, width: 128 },
        { type: "platform", x: 2040, y: 340, width: 128 },
        { type: "platform", x: 2260, y: 380, width: 128 },
        { type: "platform", x: 2480, y: 420, width: 128 }
      ],
      enemies: [
        { type: "ground", x: 200, patrolRange: 50, direction: 1, speed: 0.85 },
        { type: "flying", x: 1500, y: 180, patrolRange: 130, direction: -1, speed: 1.0 },
        { type: "ground", x: 2900, patrolRange: 80, direction: -1, speed: 0.9 }
      ],
      coins: [
        { x: 300, y: 400 },
        { x: 520, y: 380 }, { x: 566, y: 360 },
        { x: 740, y: 340 }, { x: 786, y: 320 },
        { x: 960, y: 300 }, { x: 1006, y: 280 },
        { x: 1180, y: 260 }, { x: 1226, y: 240 },
        { x: 1400, y: 220 }, { x: 1490, y: 200 }, { x: 1580, y: 200 },
        // The second coin of each descending pair was authored at deck level
        // and clipped its platform tile; each now sits on top of the deck.
        { x: 1620, y: 220 }, { x: 1666, y: 228 },
        { x: 1840, y: 260 }, { x: 1886, y: 268 },
        { x: 2060, y: 300 }, { x: 2106, y: 308 },
        { x: 2280, y: 340 }, { x: 2326, y: 348 },
        { x: 2500, y: 380 }, { x: 2546, y: 388 },
        { x: 2800, y: 400 }, { x: 2900, y: 400 }, { x: 3000, y: 400 }
      ],
      seeds: [
        { x: 150, y: 420 }, { x: 1400, y: 220 }, { x: 2800, y: 420 }
      ],
      decorations: groundDecor(3400),
      gate: gateAt(3300)
    },
    {
      id: 10,
      name: "Danger Gaps",
      subtitle: "Mind the gap",
      theme: "sunset",
      playerStart: spawn,
      worldWidth: 3400,
      terrain: [
        { type: "ground", x: 0, y: GROUND_TOP, width: 384 },
        { type: "ground", x: 544, y: GROUND_TOP, width: 320 },
        { type: "ground", x: 1024, y: GROUND_TOP, width: 320 },
        { type: "ground", x: 1504, y: GROUND_TOP, width: 320 },
        { type: "ground", x: 1984, y: GROUND_TOP, width: 384 },
        { type: "ground", x: 2528, y: GROUND_TOP, width: 400 },
        { type: "ground", x: 3088, y: GROUND_TOP, width: 312 },
        { type: "platform", x: 410, y: 420, width: 128 },
        { type: "platform", x: 890, y: 420, width: 128 },
        { type: "platform", x: 1370, y: 420, width: 128 },
        { type: "platform", x: 1850, y: 420, width: 128 },
        { type: "platform", x: 2400, y: 420, width: 128 },
        { type: "platform", x: 2960, y: 420, width: 128 }
      ],
      enemies: [
        { type: "ground", x: 700, patrolRange: 60, direction: -1, speed: 0.9 },
        { type: "flying", x: 1200, y: 280, patrolRange: 100, direction: 1, speed: 1.0 },
        { type: "ground", x: 1700, patrolRange: 70, direction: 1, speed: 0.95 },
        { type: "flying", x: 2200, y: 260, patrolRange: 110, direction: -1, speed: 1.05 },
        { type: "ground", x: 2700, patrolRange: 70, direction: -1, speed: 0.95 }
      ],
      coins: [
        { x: 200, y: 400 },
        { x: 420, y: 380 }, { x: 472, y: 340 }, { x: 524, y: 380 },
        { x: 900, y: 380 }, { x: 952, y: 340 }, { x: 1004, y: 380 },
        { x: 1380, y: 380 }, { x: 1432, y: 340 }, { x: 1484, y: 380 },
        { x: 1860, y: 380 }, { x: 1912, y: 340 }, { x: 1964, y: 380 },
        { x: 2410, y: 380 }, { x: 2462, y: 340 }, { x: 2514, y: 380 },
        { x: 2970, y: 380 }, { x: 3022, y: 340 }, { x: 3074, y: 380 }
      ],
      seeds: [
        { x: 150, y: 420 }, { x: 1500, y: 400 }, { x: 2600, y: 400 }
      ],
      decorations: groundDecor(3400, "sunset"),
      gate: gateAt(3300)
    },
    {
      id: 11,
      name: "Bee Skyway",
      subtitle: "Sky patrol",
      theme: "grassland",
      playerStart: spawn,
      worldWidth: 3600,
      terrain: [
        { type: "ground", x: 0, y: GROUND_TOP, width: 640 },
        { type: "ground", x: 800, y: GROUND_TOP, width: 640 },
        { type: "ground", x: 1600, y: GROUND_TOP, width: 640 },
        { type: "ground", x: 2400, y: GROUND_TOP, width: 640 },
        { type: "ground", x: 3200, y: GROUND_TOP, width: 400 },
        { type: "platform", x: 400, y: 380, width: 128 },
        { type: "platform", x: 1000, y: 356, width: 128 },
        { type: "platform", x: 1800, y: 356, width: 128 },
        { type: "platform", x: 2500, y: 380, width: 128 }
      ],
      enemies: [
        { type: "flying", x: 350, y: 220, patrolRange: 130, direction: 1, speed: 1.05 },
        { type: "flying", x: 1000, y: 200, patrolRange: 140, direction: -1, speed: 1.05 },
        { type: "flying", x: 1700, y: 200, patrolRange: 150, direction: 1, speed: 1.1 },
        { type: "flying", x: 2500, y: 190, patrolRange: 160, direction: -1, speed: 1.15 },
        { type: "ground", x: 3300, patrolRange: 60, direction: -1, speed: 0.95 }
      ],
      coins: [
        { x: 200, y: 400 }, { x: 420, y: 340 }, { x: 474, y: 340 },
        { x: 850, y: 400 }, { x: 1020, y: 320 }, { x: 1074, y: 320 },
        { x: 1650, y: 400 }, { x: 1820, y: 300 }, { x: 1874, y: 300 },
        { x: 2450, y: 400 }, { x: 2520, y: 340 }, { x: 2574, y: 340 },
        { x: 3260, y: 400 }, { x: 3320, y: 400 }, { x: 3380, y: 400 }
      ],
      seeds: [
        { x: 150, y: 420 }, { x: 410, y: 340 }, { x: 850, y: 420 },
        { x: 1600, y: 420 }, { x: 2400, y: 420 }
      ],
      decorations: groundDecor(3600),
      gate: gateAt(3500)
    },
    {
      id: 12,
      name: "Platform Maze",
      subtitle: "Pick your route",
      theme: "sunset",
      playerStart: spawn,
      worldWidth: 3600,
      terrain: [
        { type: "ground", x: 0, y: GROUND_TOP, width: 448 },
        { type: "ground", x: 608, y: GROUND_TOP, width: 320 },
        { type: "ground", x: 1088, y: GROUND_TOP, width: 320 },
        { type: "ground", x: 1568, y: GROUND_TOP, width: 320 },
        { type: "ground", x: 2048, y: GROUND_TOP, width: 320 },
        { type: "ground", x: 2528, y: GROUND_TOP, width: 320 },
        { type: "ground", x: 2960, y: GROUND_TOP, width: 640 },
        { type: "platform", x: 570, y: 420, width: 160 },
        { type: "platform", x: 900, y: 420, width: 160 },
        { type: "platform", x: 1240, y: 420, width: 160 },
        { type: "platform", x: 1590, y: 420, width: 160 },
        { type: "platform", x: 1940, y: 420, width: 160 },
        { type: "platform", x: 2290, y: 420, width: 160 },
        { type: "platform", x: 2640, y: 420, width: 160 },
        // The pit at 448->608 used to be approached under a platform at
        // (520,340): a 64px-tall solid block whose left face sat exactly on the
        // takeoff arc. It now starts past the pit's far lip, so it no longer
        // overhangs the jump.
        //
        // y is 300 rather than 312 to open the pocket under it. This platform
        // sits over the lower deck at (570,420), and the coin at (660,380) is
        // between the two. At 312 the block's underside (376) hung below the
        // head of a player standing on that deck (372), so he was walled out
        // and the coin could only be taken by passing through the platform. At
        // 300 the underside clears his head and he can simply walk in.
        { type: "platform", x: 620, y: 300, width: 128 },
        { type: "platform", x: 770, y: 320, width: 128 },
        { type: "platform", x: 1060, y: 300, width: 128 },
        { type: "platform", x: 1400, y: 320, width: 128 },
        { type: "platform", x: 1750, y: 340, width: 128 },
        { type: "platform", x: 2100, y: 320, width: 128 },
        { type: "platform", x: 2500, y: 340, width: 128 }
      ],
      enemies: [
        { type: "ground", x: 800, patrolRange: 32, direction: -1, speed: 0.9 },
        { type: "flying", x: 1200, y: 250, patrolRange: 100, direction: -1, speed: 1.0 },
        { type: "ground", x: 1700, patrolRange: 48, direction: 1, speed: 0.95 },
        { type: "flying", x: 2400, y: 240, patrolRange: 110, direction: 1, speed: 1.05 },
        { type: "ground", x: 3100, patrolRange: 60, direction: -1, speed: 0.95 }
      ],
      coins: [
        { x: 200, y: 400 }, { x: 300, y: 400 },
        { x: 590, y: 380 }, { x: 660, y: 380 },
        { x: 920, y: 380 }, { x: 990, y: 380 },
        { x: 1260, y: 380 }, { x: 1330, y: 380 },
        { x: 1610, y: 380 }, { x: 1680, y: 380 },
        { x: 540, y: 300 }, { x: 790, y: 280 }, { x: 1080, y: 260 },
        { x: 1420, y: 280 }, { x: 1770, y: 300 }, { x: 2120, y: 280 }, { x: 2520, y: 300 },
        { x: 3050, y: 400 }, { x: 3150, y: 400 }, { x: 3250, y: 400 }, { x: 3350, y: 400 }
      ],
      seeds: [
        { x: 150, y: 420 }, { x: 520, y: 300 }, { x: 1300, y: 260 }, { x: 2500, y: 300 }
      ],
      decorations: groundDecor(3600, "sunset"),
      gate: gateAt(3480)
    },
    {
      id: 13,
      name: "Hero Run",
      subtitle: "Full speed ahead",
      theme: "grassland",
      playerStart: spawn,
      worldWidth: 3800,
      terrain: [
        { type: "ground", x: 0, y: GROUND_TOP, width: 960 },
        { type: "ground", x: 1120, y: GROUND_TOP, width: 800 },
        { type: "ground", x: 2048, y: GROUND_TOP, width: 800 },
        { type: "ground", x: 2976, y: GROUND_TOP, width: 824 },
        { type: "platform", x: 1500, y: 400, width: 128 },
        { type: "platform", x: 2400, y: 400, width: 128 },
        { type: "platform", x: 3300, y: 400, width: 128 }
      ],
      enemies: [
        { type: "ground", x: 400, patrolRange: 80, direction: 1, speed: 1.0 },
        { type: "flying", x: 1400, y: 260, patrolRange: 100, direction: -1, speed: 1.1 },
        { type: "ground", x: 2200, patrolRange: 70, direction: -1, speed: 1.05 },
        { type: "flying", x: 3100, y: 240, patrolRange: 100, direction: 1, speed: 1.15 }
      ],
      coins: [
        { x: 200, y: 400 }, { x: 260, y: 400 }, { x: 320, y: 400 }, { x: 380, y: 400 },
        { x: 500, y: 400 }, { x: 560, y: 400 }, { x: 620, y: 400 }, { x: 680, y: 400 },
        { x: 800, y: 400 }, { x: 860, y: 400 }, { x: 920, y: 400 },
        { x: 1200, y: 400 }, { x: 1260, y: 400 }, { x: 1320, y: 400 }, { x: 1380, y: 400 },
        { x: 1520, y: 360 }, { x: 1574, y: 360 },
        { x: 1700, y: 400 }, { x: 1760, y: 400 }, { x: 1820, y: 400 }, { x: 1880, y: 400 },
        { x: 2100, y: 400 }, { x: 2160, y: 400 }, { x: 2220, y: 400 }, { x: 2280, y: 400 }, { x: 2340, y: 400 },
        { x: 2420, y: 360 }, { x: 2474, y: 360 },
        { x: 2600, y: 400 }, { x: 2660, y: 400 }, { x: 2720, y: 400 }, { x: 2780, y: 400 },
        { x: 3020, y: 400 }, { x: 3080, y: 400 }, { x: 3140, y: 400 }, { x: 3200, y: 400 },
        { x: 3320, y: 360 }, { x: 3374, y: 360 },
        { x: 3500, y: 400 }, { x: 3560, y: 400 }, { x: 3620, y: 400 }
      ],
      seeds: [
        // 2500 was 93% inside the platform at (2400,400); raised onto its deck.
        { x: 150, y: 420 }, { x: 1400, y: 420 }, { x: 2500, y: 366 }
      ],
      decorations: groundDecor(3800),
      gate: gateAt(3700)
    },
    {
      id: 14,
      name: "Final Journey",
      subtitle: "All you have learned",
      theme: "sunset",
      playerStart: spawn,
      worldWidth: 4000,
      terrain: [
        { type: "ground", x: 0, y: GROUND_TOP, width: 512 },
        { type: "ground", x: 672, y: GROUND_TOP, width: 448 },
        { type: "ground", x: 1248, y: GROUND_TOP, width: 384 },
        { type: "ground", x: 1760, y: GROUND_TOP, width: 448 },
        { type: "ground", x: 2336, y: GROUND_TOP, width: 384 },
        { type: "ground", x: 2848, y: GROUND_TOP, width: 448 },
        { type: "ground", x: 3424, y: GROUND_TOP, width: 576 },
        { type: "platform", x: 750, y: 400, width: 128 },
        { type: "platform", x: 1050, y: 356, width: 128 },
        { type: "platform", x: 1400, y: 380, width: 128 },
        { type: "platform", x: 1900, y: 356, width: 128 },
        { type: "platform", x: 2200, y: 328, width: 128 },
        { type: "platform", x: 2600, y: 380, width: 128 },
        { type: "platform", x: 3050, y: 356, width: 128 }
      ],
      enemies: [
        { type: "ground", x: 800, patrolRange: 32, direction: 1, speed: 1.0 },
        { type: "flying", x: 1100, y: 260, patrolRange: 110, direction: -1, speed: 1.05 },
        { type: "ground", x: 1850, patrolRange: 76, direction: -1, speed: 1.05 },
        { type: "flying", x: 2150, y: 220, patrolRange: 120, direction: 1, speed: 1.1 },
        { type: "ground", x: 2450, patrolRange: 80, direction: 1, speed: 1.1 },
        { type: "plant", x: 3000 },
        { type: "flying", x: 3350, y: 200, patrolRange: 130, direction: -1, speed: 1.15 }
      ],
      coins: [
        { x: 200, y: 400 }, { x: 280, y: 400 }, { x: 360, y: 400 },
        { x: 770, y: 360 }, { x: 830, y: 360 },
        { x: 1070, y: 320 }, { x: 1130, y: 320 },
        { x: 1420, y: 340 }, { x: 1480, y: 340 },
        { x: 1920, y: 300 }, { x: 2220, y: 280 },
        { x: 2620, y: 340 }, { x: 2680, y: 340 },
        { x: 3070, y: 300 }, { x: 3130, y: 300 },
        { x: 3500, y: 400 }, { x: 3580, y: 400 }, { x: 3660, y: 400 }, { x: 3740, y: 400 }
      ],
      seeds: [
        // 760 / 1400 / 2610 clipped the platforms they were meant to sit on.
        { x: 150, y: 420 }, { x: 760, y: 366 }, { x: 1400, y: 346 }, { x: 2610, y: 346 }
      ],
      decorations: groundDecor(4000, "sunset"),
      gate: gateAt(3900)
    },
    {
      id: 15,
      name: "Grand Adventure",
      subtitle: "The finale",
      theme: "midnight",
      playerStart: spawn,
      worldWidth: 4800,
      terrain: [
        // Section 1: easy running
        { type: "ground", x: 0, y: GROUND_TOP, width: 700 },
        // Section 2: floating platforms
        { type: "platform", x: 760, y: 440, width: 128 },
        { type: "platform", x: 940, y: 420, width: 128 },
        { type: "platform", x: 1120, y: 400, width: 128 },
        { type: "platform", x: 1300, y: 420, width: 128 },
        { type: "platform", x: 1480, y: 440, width: 128 },
        // Section 3: ground enemies
        { type: "ground", x: 1660, y: GROUND_TOP, width: 800 },
        // Section 4: flying enemies with platforms above
        { type: "ground", x: 2588, y: GROUND_TOP, width: 800 },
        { type: "platform", x: 2660, y: 380, width: 128 },
        { type: "platform", x: 2860, y: 356, width: 128 },
        { type: "platform", x: 3060, y: 380, width: 128 },
        { type: "platform", x: 3260, y: 400, width: 128 },
        // Section 5: coin trail
        { type: "ground", x: 3516, y: GROUND_TOP, width: 700 },
        // Section 6: final approach + exit
        { type: "ground", x: 4344, y: GROUND_TOP, width: 456 }
      ],
      enemies: [
        { type: "flying", x: 1200, y: 280, patrolRange: 120, direction: 1, speed: 1.0 },
        { type: "ground", x: 1850, patrolRange: 80, direction: 1, speed: 1.0 },
        { type: "ground", x: 2200, patrolRange: 76, direction: -1, speed: 1.05 },
        { type: "flying", x: 2700, y: 250, patrolRange: 130, direction: 1, speed: 1.1 },
        { type: "flying", x: 3000, y: 220, patrolRange: 130, direction: -1, speed: 1.15 },
        { type: "flying", x: 3300, y: 200, patrolRange: 140, direction: 1, speed: 1.2 },
        { type: "plant", x: 4500 }
      ],
      coins: [
        // Section 1: running trail
        { x: 100, y: 400 }, { x: 180, y: 400 }, { x: 260, y: 400 }, { x: 340, y: 400 },
        { x: 420, y: 400 }, { x: 500, y: 400 }, { x: 580, y: 400 }, { x: 660, y: 400 },
        // Section 2: arcs between platforms
        { x: 780, y: 400 }, { x: 960, y: 380 }, { x: 1140, y: 360 }, { x: 1320, y: 380 }, { x: 1500, y: 400 },
        // Section 3: line coins
        { x: 1700, y: 400 }, { x: 1780, y: 400 }, { x: 2000, y: 400 }, { x: 2080, y: 400 },
        { x: 2300, y: 400 }, { x: 2380, y: 400 },
        // Section 4: around flying enemies
        { x: 2680, y: 340 }, { x: 2734, y: 340 },
        { x: 2880, y: 320 }, { x: 2934, y: 320 },
        { x: 3080, y: 340 }, { x: 3134, y: 340 },
        { x: 3280, y: 360 }, { x: 3334, y: 360 },
        // Section 5: HUGE trail
        { x: 3540, y: 400 }, { x: 3600, y: 400 }, { x: 3660, y: 400 }, { x: 3720, y: 400 },
        { x: 3780, y: 400 }, { x: 3840, y: 400 }, { x: 3900, y: 400 }, { x: 3960, y: 400 },
        { x: 4020, y: 400 }, { x: 4080, y: 400 }, { x: 4140, y: 400 }, { x: 4200, y: 400 },
        // Section 6: approach
        { x: 4380, y: 400 }, { x: 4440, y: 400 }, { x: 4600, y: 400 }
      ],
      seeds: [
        { x: 200, y: 420 }, { x: 770, y: 400 }, { x: 2000, y: 420 },
        { x: 2600, y: 340 }, { x: 3600, y: 420 }
      ],
      decorations: groundDecor(4800, "midnight"),
      gate: gateAt(4700)
    }
  ];
}

function createAudioAsset(key, filename, options = {}) {
  const {
    loop = false,
    volume = 1
  } = options;

  const audio = new Audio();
  // preload="none" on purpose: the preloader fetches these bytes itself and
  // hands the element a blob: URL afterwards. Letting the element download as
  // well would pull every track twice — 1.2 MB of that being the music.
  audio.preload = "none";
  audio.loop = loop;
  audio.volume = volume;
  audio.src = encodeURI(filename);

  audio.addEventListener(
    "loadeddata",
    () => {
      console.log(`[Sound Loaded] key="${key}" file="${filename}"`);
    },
    { once: true }
  );

  bindBlobFallback(audio, filename);

  return audio;
}

// Point each sound element at the bytes the preloader already holds, so the
// first play() is instant and never touches the network.
function attachPreloadedAudio() {
  Object.entries(SOUND_FILES).forEach(([key, path]) => {
    const audio = sounds[key];
    const blobUrl = preloadedBlobUrls.get(path);
    if (!audio || !blobUrl) return;

    const wasPlaying = !audio.paused;
    audio.src = blobUrl;
    if (wasPlaying) {
      const resumed = audio.play();
      if (resumed && typeof resumed.catch === "function") resumed.catch(() => {});
    }
  });
}

// One element per sound meant a second coin picked up a few frames after the
// first just rewound the same element, so the two collapsed into one blip.
// Each effect gets a tiny round-robin pool of clones instead. The looping BGM
// is never pooled — it has to stay a single element.
const SFX_POOL_SIZE = 4;
const sfxPools = new Map();

function getSfxVoice(audio) {
  let pool = sfxPools.get(audio);
  if (!pool) {
    pool = { voices: [audio], next: 0 };
    for (let i = 1; i < SFX_POOL_SIZE; i += 1) {
      const clone = audio.cloneNode(true);
      clone.volume = audio.volume;
      pool.voices.push(clone);
    }
    sfxPools.set(audio, pool);
  }

  // Prefer a voice that is not mid-play; otherwise take the oldest in turn.
  const free = pool.voices.find((voice) => voice.paused || voice.ended);
  if (free) return free;

  const voice = pool.voices[pool.next];
  pool.next = (pool.next + 1) % pool.voices.length;
  return voice;
}

function safePlay(audio, label = "audio") {
  if (!audio || !audioUnlocked || isMuted) {
    return;
  }

  const voice = getSfxVoice(audio);
  // Clones are made before attachPreloadedAudio() may swap in a blob: URL, so
  // keep them pointed at whatever the source element currently uses.
  if (voice !== audio && voice.src !== audio.src) {
    voice.src = audio.src;
  }

  try {
    voice.currentTime = 0;
  } catch (error) {
    console.warn(`Could not reset ${label} audio time.`, error);
  }

  voice.play().catch((error) => {
    console.warn(`Audio play blocked for ${label}.`, error);
  });
}

function safeLoopStart(audio, label = "bgm") {
  if (!audio || !audioUnlocked || isMuted) {
    return;
  }

  if (!audio.paused) {
    return;
  }

  audio.play().catch((error) => {
    console.warn(`BGM blocked for ${label}.`, error);
  });
}

function setBackgroundMusicLevel(volume) {
  if (!sounds.bgm) {
    return;
  }

  sounds.bgm.volume = volume;
}

function startBackgroundMusic() {
  if (!sounds.bgm) {
    return;
  }

  setBackgroundMusicLevel(SOUND_VOLUMES.bgm);
  safeLoopStart(sounds.bgm, "bgm");
}

function softenBackgroundMusic() {
  if (!sounds.bgm) {
    return;
  }

  setBackgroundMusicLevel(SOUND_VOLUMES.bgmGameOver);
  if (audioUnlocked && !isMuted) {
    safeLoopStart(sounds.bgm, "bgm");
  }
}

function unlockAudio() {
  if (audioUnlocked) {
    return;
  }

  audioUnlocked = true;

  if (!sounds.bgm) {
    return;
  }

  const previousMuted = sounds.bgm.muted;
  const previousVolume = sounds.bgm.volume;

  sounds.bgm.muted = true;
  sounds.bgm.volume = 0;

  sounds.bgm.play()
    .then(() => {
      sounds.bgm.pause();
      sounds.bgm.currentTime = 0;
      sounds.bgm.muted = previousMuted || isMuted;
      sounds.bgm.volume = previousVolume;

      if (state === STATES.PLAYING && !isMuted) {
        startBackgroundMusic();
      }
    })
    .catch((error) => {
      sounds.bgm.muted = previousMuted || isMuted;
      sounds.bgm.volume = previousVolume;
      console.warn("Audio unlock blocked.", error);
    });
}

function forEachSfxVoice(callback) {
  for (const pool of sfxPools.values()) {
    for (const voice of pool.voices) callback(voice);
  }
}

function setMuteState(muted) {
  isMuted = muted;

  Object.values(sounds).forEach((audio) => {
    if (audio) {
      audio.muted = muted;
    }
  });
  // Pooled clones are separate elements and need the same flag.
  forEachSfxVoice((voice) => { voice.muted = muted; });

  if (!muted && state === STATES.PLAYING) {
    startBackgroundMusic();
  }

  if (soundDisplay) {
    soundDisplay.classList.toggle("is-muted", isMuted);
    triggerHudPop(soundDisplay);
  }
  if (startSoundToggle) {
    startSoundToggle.classList.toggle("is-muted", isMuted);
  }
}

function toggleMute() {
  setMuteState(!isMuted);
}

// ------------------ Character selection lobby ------------------

function extractFirstFrameDataUrl(spriteSheet, size = 512) {
  if (!spriteSheet) return null;
  const frames = extractSpriteFrames(spriteSheet);
  const frame = frames[0];
  if (!frame) return null;

  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const cx = c.getContext("2d");
  cx.imageSmoothingEnabled = false;

  const scale = Math.min(size / frame.width, size / frame.height) * 0.92;
  const w = frame.width * scale;
  const h = frame.height * scale;
  const dx = (size - w) / 2;
  const dy = (size - h) / 2;

  cx.drawImage(spriteSheet, frame.x, frame.y, frame.width, frame.height, dx, dy, w, h);

  try {
    return c.toDataURL("image/png");
  } catch (error) {
    // Exporting a tainted canvas throws (file:// pages). Returning null makes
    // the caller fall back to the sprite sheet's own URL as the portrait.
    console.warn("[Portrait] canvas export blocked; using the sheet directly.", error);
    return null;
  }
}

function getCharacterPortraitSrc(character) {
  if (!character) return null;
  if (characterPortraitCache.has(character.id)) {
    return characterPortraitCache.get(character.id);
  }

  // Prefer the dedicated preview PNG (Lana/Andrew have static portrait art).
  // Crop to opaque bounds so heavy transparent padding in the source doesn't
  // make the character look tiny inside the card / stage frame.
  if (character.previewKey && character.previewKey !== character.spriteKey) {
    const previewAsset = assets[character.previewKey];
    if (previewAsset) {
      const dataUrl = cropImageToBoundsDataUrl(previewAsset, 512);
      const src = dataUrl || previewAsset.src;
      characterPortraitCache.set(character.id, src);
      return src;
    }
  }

  // Otherwise (original hero) crop the first frame out of the sprite sheet.
  const sheet = assets[character.spriteKey] || characterBaseSheet;
  const dataUrl = extractFirstFrameDataUrl(sheet, 512);
  const src = dataUrl || (sheet && sheet.src) || null;
  if (src) characterPortraitCache.set(character.id, src);
  return src;
}

function cropImageToBoundsDataUrl(image, size = 512) {
  if (!image) return null;
  try {
    const bounds = extractOpaqueBounds(image);
    if (!bounds || bounds.width <= 0 || bounds.height <= 0) return null;

    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const cx = c.getContext("2d");
    cx.imageSmoothingEnabled = false;

    const scale = Math.min(size / bounds.width, size / bounds.height) * 0.92;
    const w = bounds.width * scale;
    const h = bounds.height * scale;
    const dx = (size - w) / 2;
    const dy = (size - h) / 2;

    cx.drawImage(image, bounds.x, bounds.y, bounds.width, bounds.height, dx, dy, w, h);
    return c.toDataURL("image/png");
  } catch (err) {
    return null;
  }
}

function getCharacterSpriteData(character) {
  if (!character) return null;
  if (character.id === "original") {
    return {
      image: characterBaseSheet,
      frames: originalPlayerFrames,
      anims: originalPlayerAnimations
    };
  }

  if (characterFrameCache.has(character.id)) {
    return characterFrameCache.get(character.id);
  }

  const sheet = assets[character.spriteKey];
  if (!sheet) return null;

  const frames = extractSpriteFrames(sheet);
  if (!frames || frames.length === 0) return null;

  const data = {
    image: sheet,
    frames,
    anims: buildPlayerAnimations(frames)
  };
  characterFrameCache.set(character.id, data);
  return data;
}

function readSelectedCharacterId() {
  try {
    return localStorage.getItem(SELECTED_CHARACTER_KEY);
  } catch (err) {
    return null;
  }
}

function writeSelectedCharacterId(id) {
  try {
    localStorage.setItem(SELECTED_CHARACTER_KEY, id);
  } catch (err) {
    /* ignore */
  }
}

function loadInitialCharacterSelection() {
  const savedId = readSelectedCharacterId();
  if (!savedId) return;
  const idx = CHARACTERS.findIndex((c) => c.id === savedId && !c.locked);
  if (idx >= 0) selectedCharacterIndex = idx;
}

// ---------------------------------------------------------------------------
// Character stats
//
// The lobby has always drawn speed / jump / power dots, but nothing read them:
// every character ran, jumped and shot identically. These tables turn the dots
// into real differences. 4 is the baseline (the original Hero), and the spread
// is deliberately narrow — every level has to stay clearable by the weakest
// jumper, which is checked against the reachability model.
// ---------------------------------------------------------------------------
const STAT_MOVE_SPEED = { 3: 4.3, 4: 4.8, 5: 5.4 };
const STAT_JUMP_VELOCITY = { 3: -13.6, 4: -14, 5: -14.5 };
const STAT_PROJECTILE_SPEED = { 3: 7, 4: 8, 5: 9.5 };

function getActiveCharacter() {
  return CHARACTERS[selectedCharacterIndex] || CHARACTERS[0];
}

function applyCharacterStats() {
  const stats = getActiveCharacter().stats || {};
  player.moveSpeed = STAT_MOVE_SPEED[stats.speed] ?? CONFIG.playerMoveSpeed;
  player.jumpVelocity = STAT_JUMP_VELOCITY[stats.jump] ?? CONFIG.jumpVelocity;
  player.projectileSpeed = STAT_PROJECTILE_SPEED[stats.power] ?? CONFIG.projectileSpeed;
}

function getJumpVelocity() {
  return player.jumpVelocity ?? CONFIG.jumpVelocity;
}

function applySelectedCharacterSprite() {
  if (!characterBaseSheet) return;

  const character = CHARACTERS[selectedCharacterIndex] || CHARACTERS[0];
  const data = getCharacterSpriteData(character);
  if (!data || !data.image) return;

  assets.character = data.image;
  playerFrames = data.frames;
  playerAnimations = data.anims;
  player.animationFrame = 0;
  player.animationTimer = 0;
  applyCharacterStats();
}

function captureOriginalCharacterFrames() {
  if (!characterBaseSheet) return;
  const baseFrames = extractSpriteFrames(characterBaseSheet);
  if (!baseFrames || baseFrames.length === 0) return;
  originalPlayerFrames = baseFrames;
  originalPlayerAnimations = buildPlayerAnimations(baseFrames);
}

function buildStatDots(container, filled) {
  container.innerHTML = "";
  for (let i = 0; i < 5; i += 1) {
    const dot = document.createElement("span");
    dot.className = "stat-row__dot" + (i < filled ? " is-on" : "");
    container.appendChild(dot);
  }
}

function buildCarouselCards() {
  if (!carouselTrack) return;
  carouselTrack.innerHTML = "";

  CHARACTERS.forEach((character, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "carousel-card";
    card.dataset.index = String(index);
    card.setAttribute("role", "option");
    card.setAttribute("aria-label", character.name);
    if (character.locked) card.classList.add("is-locked");

    const portrait = document.createElement("div");
    portrait.className = "carousel-card__portrait";
    const img = document.createElement("img");
    img.alt = "";
    img.draggable = false;
    portrait.appendChild(img);

    const nameEl = document.createElement("span");
    nameEl.className = "carousel-card__name";
    nameEl.textContent = character.name;

    if (character.locked) {
      const lock = document.createElement("span");
      lock.className = "carousel-card__lock";
      lock.setAttribute("aria-hidden", "true");
      lock.textContent = "\u{1F512}";
      card.appendChild(lock);
    }

    const selectedTag = document.createElement("span");
    selectedTag.className = "carousel-card__selected";
    selectedTag.textContent = "SELECTED";

    card.appendChild(portrait);
    card.appendChild(nameEl);
    card.appendChild(selectedTag);

    card.addEventListener("click", (event) => {
      event.stopPropagation();
      if (character.locked) {
        card.classList.remove("is-shake");
        void card.offsetWidth;
        card.classList.add("is-shake");
        return;
      }
      selectCharacter(index);
    });

    carouselTrack.appendChild(card);
  });
}

function fillCarouselPortraits() {
  if (!carouselTrack) return;
  const cards = carouselTrack.querySelectorAll(".carousel-card");
  cards.forEach((card, index) => {
    const character = CHARACTERS[index];
    if (!character) return;
    const src = getCharacterPortraitSrc(character);
    const img = card.querySelector("img");
    if (img && src) img.src = src;
  });
}

function selectCharacter(index) {
  if (index < 0 || index >= CHARACTERS.length) return;
  const character = CHARACTERS[index];
  if (character.locked) return;
  selectedCharacterIndex = index;
  writeSelectedCharacterId(character.id);
  updateLobbyView();
}

function selectNextCharacter(dir) {
  let idx = selectedCharacterIndex;
  for (let i = 0; i < CHARACTERS.length; i += 1) {
    idx = (idx + dir + CHARACTERS.length) % CHARACTERS.length;
    if (!CHARACTERS[idx].locked) {
      selectCharacter(idx);
      return;
    }
  }
}

function updateLobbyView() {
  const character = CHARACTERS[selectedCharacterIndex] || CHARACTERS[0];
  if (!character || !characterBaseSheet) return;

  if (lobbyHeroImage) {
    const src = getCharacterPortraitSrc(character);
    if (src) {
      lobbyHeroImage.classList.remove("is-swap");
      void lobbyHeroImage.offsetWidth;
      lobbyHeroImage.classList.add("is-swap");
      lobbyHeroImage.src = src;
    }
  }

  if (lobbyHeroName) lobbyHeroName.textContent = character.name;
  if (lobbyHeroAbility) lobbyHeroAbility.textContent = character.ability;

  if (lobbyStats) {
    lobbyStats.querySelectorAll("[data-stat]").forEach((el) => {
      const key = el.getAttribute("data-stat");
      buildStatDots(el, character.stats[key] || 0);
    });
  }

  if (carouselTrack) {
    carouselTrack.querySelectorAll(".carousel-card").forEach((card, index) => {
      card.classList.toggle("is-selected", index === selectedCharacterIndex);
    });
    const activeCard = carouselTrack.querySelector(".carousel-card.is-selected");
    if (activeCard) {
      // Scroll only the carousel track horizontally to center the card.
      // scrollIntoView would also scroll the outer page/overlay vertically,
      // which visibly shifted the PLAY button and other lobby UI upward.
      const target = activeCard.offsetLeft + activeCard.offsetWidth / 2 - carouselTrack.clientWidth / 2;
      const maxScroll = Math.max(0, carouselTrack.scrollWidth - carouselTrack.clientWidth);
      carouselTrack.scrollTo({
        left: Math.max(0, Math.min(maxScroll, target)),
        behavior: "smooth"
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Start-at-level
//
// completeLevel() has always written the highest unlocked level to
// localStorage, but nothing ever read it back: closing the tab silently threw
// the run away and PLAY AGAIN restarted at level 1. The lobby now offers every
// level the player has actually reached.
// ---------------------------------------------------------------------------
let selectedStartLevel = 1; // 1-based

function getUnlockedLevelCount() {
  return clamp(readHighestUnlockedLevel(), 1, levels.length);
}

function changeStartLevel(direction) {
  const unlocked = getUnlockedLevelCount();
  const next = clamp(selectedStartLevel + direction, 1, unlocked);
  if (next === selectedStartLevel) return;
  selectedStartLevel = next;
  playClickSound();
  updateLevelPicker();
}

function updateLevelPicker() {
  if (!levelPicker) return;

  const unlocked = getUnlockedLevelCount();
  selectedStartLevel = clamp(selectedStartLevel, 1, unlocked);

  // Nothing to choose from until a second level has been reached.
  levelPicker.hidden = unlocked <= 1;
  if (levelPicker.hidden) return;

  if (levelPickerValue) {
    const level = levels[selectedStartLevel - 1];
    levelPickerValue.textContent = level
      ? `LEVEL ${level.id} · ${level.name.toUpperCase()}`
      : `LEVEL ${selectedStartLevel}`;
  }
  if (levelPickerPrev) levelPickerPrev.disabled = selectedStartLevel <= 1;
  if (levelPickerNext) levelPickerNext.disabled = selectedStartLevel >= unlocked;
}

function enterLobby() {
  if (state === STATES.LOBBY) return;
  releaseMovementInput();
  state = STATES.LOBBY;
  uiState.lobbyEnteredAt = performance.now();
  softenBackgroundMusic();
  buildCarouselCards();
  fillCarouselPortraits();
  selectedStartLevel = getUnlockedLevelCount();
  updateLevelPicker();
  updateLobbyView();
  updateUI();
}

function exitLobbyToGame() {
  applySelectedCharacterSprite();
  hideLobbyUI();
  startGame(false, selectedStartLevel - 1);
}

function exitLobbyToStart() {
  hideLobbyUI();
  state = STATES.START;
  updateUI();
}

function showLobbyUI() {
  if (!lobbyOverlay) return;
  setLayerVisibility(lobbyOverlay, true);
}

function hideLobbyUI() {
  if (!lobbyOverlay) return;
  setLayerVisibility(lobbyOverlay, false);
}

let clickAudioCtx = null;
function playClickSound() {
  if (isMuted) return;
  try {
    if (!clickAudioCtx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return;
      clickAudioCtx = new Ctor();
    }
    const ctx = clickAudioCtx;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.35, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(1250, now + 0.08);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.24);

    const sparkle = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkle.type = "triangle";
    sparkle.frequency.setValueAtTime(1800, now + 0.02);
    sparkle.frequency.exponentialRampToValueAtTime(2400, now + 0.09);
    sparkleGain.gain.setValueAtTime(0.0001, now + 0.02);
    sparkleGain.gain.exponentialRampToValueAtTime(0.18, now + 0.035);
    sparkleGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    sparkle.connect(sparkleGain).connect(ctx.destination);
    sparkle.start(now + 0.02);
    sparkle.stop(now + 0.15);
  } catch (err) {
    /* ignore audio errors */
  }
}

// Asset loading
//
// Two phases share one monotonic bar: the network preload owns the first 92%,
// and decoding the fetched bytes into Image objects owns the tail. The bar
// therefore only reads 100% once every asset is both fetched AND decodable.
function loadAssets() {
  const requiredAssets = Object.entries(REQUIRED_ASSET_PATHS);
  const optionalAssets = Object.entries(OPTIONAL_ASSET_PATHS);
  const imagePaths = [...requiredAssets, ...optionalAssets].map(([, path]) => path);
  const allPaths = [...imagePaths, ...Object.values(SOUND_FILES)];
  const allAssetCount = requiredAssets.length + optionalAssets.length;
  let loadedCount = 0;
  let barPercent = 0;

  const loadingBarFill = document.getElementById("loadingBarFill");
  const paintBar = (percent) => {
    // Monotonic across both phases.
    barPercent = Math.min(100, Math.max(barPercent, percent));
    const shown = Math.round(barPercent);
    if (loadingText) loadingText.textContent = `${shown}%`;
    if (loadingBarFill) loadingBarFill.style.width = `${shown}%`;
  };

  const updateLoadingProgress = () => {
    loadedCount += 1;
    const decodeShare = (loadedCount / allAssetCount) * (1 - PRELOAD_BAR_SHARE) * 100;
    paintBar(PRELOAD_BAR_SHARE * 100 + decodeShare);
  };

  paintBar(0);

  // Warm the webfonts behind the bar too. No text is painted on the start
  // screen (it is all artwork), so without this the display face is fetched
  // only when the HUD first appears and the score/level text visibly reflows.
  // Never allowed to block: a font that stalls or 404s resolves anyway.
  const warmFonts = () => {
    if (!document.fonts || typeof document.fonts.load !== "function") {
      return Promise.resolve();
    }
    // Only the display face is warmed. Fredoka (--font-ui) has exactly one
    // visible string in the whole app — the rotate prompt's subtitle, which
    // only appears in portrait — so warming it would cost every landscape
    // player ~16 KB for text they never see. It stays lazy.
    const load = document.fonts.load('1em "Lilita One"').catch(() => null);
    return Promise.race([
      load,
      new Promise((resolve) => window.setTimeout(resolve, 4000))
    ]);
  };

  return preloadAssets(allPaths, (percent) => paintBar(percent * PRELOAD_BAR_SHARE))
    .then(() => {
      attachPreloadedAudio();
      return warmFonts();
    })
    .then(() => {
      const loadRequired = Promise.all(
        requiredAssets.map(([key, filename]) =>
          loadImageAsset(key, filename).then((image) => {
            assets[key] = image;
            updateLoadingProgress();
          })
        )
      );

      const loadOptional = Promise.all(
        optionalAssets.map(([key, filename]) =>
          loadImageAsset(key, filename, { optional: true }).then((image) => {
            if (image) {
              assets[key] = image;
            }
            updateLoadingProgress();
          })
        )
      );

      return Promise.all([loadRequired, loadOptional]);
    })
    .then(() => {
      playerFrames = extractSpriteFrames(assets.character);
      flyingEnemyFrames = extractSpriteFrames(assets.flyingEnemy);
      groundEnemyFrames = extractSpriteFrames(assets.groundEnemy);
      coinFrames = extractSpriteFrames(assets.coin);
      jumpEffectFrames = extractSpriteFrames(assets.jumpEffect);
      damageEffectFrames = extractSpriteFrames(assets.damageEffect);
      seedProjectileFrames = extractSpriteFrames(assets.animatedSeed);
      seedPickupFrames = extractSpriteFrames(assets.seedPickup);
      hitEffectFrames = extractSpriteFrames(assets.hitEffect);
      plantFrames = extractSpriteFrames(assets.plant);
      groundTileSource = buildGroundTileSource(assets.path);
      deriveSpriteTrims();
      playerAnimations = buildPlayerAnimations(playerFrames);
      bindUiImages();
      paintBar(100);
    });
}

// 1x1 fully transparent pixel. Stands in for a required image that could not
// be decoded, so every downstream drawImage / getImageData call still has a
// real image to work with instead of throwing on null.
const BLANK_PIXEL_SRC =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4n" +
  "GMAAQAABQABDQottAAAAABJRU5ErkJggg==";

let blankImagePromise = null;

function getBlankImage() {
  if (!blankImagePromise) {
    blankImagePromise = new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(image);
      image.src = BLANK_PIXEL_SRC;
    });
  }
  return blankImagePromise;
}

function loadImageAsset(key, filename, options = {}) {
  const { optional = false } = options;

  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    let triedFileUrl = false;

    image.onload = () => resolve(image);
    image.onerror = (event) => {
      // A blob: URL can be revoked or refused by the decoder; retry once from
      // the real file before giving up on it.
      if (!triedFileUrl && preloadedBlobUrls.has(filename)) {
        triedFileUrl = true;
        console.warn(`[Blob decode failed] retrying "${filename}" from file`);
        image.src = encodeURI(filename);
        return;
      }

      // Never reject: a missing image must not strand the player on the
      // loading screen. Optional art resolves to null (its draw calls are all
      // guarded by `if (assets.x)`); required art resolves to a transparent
      // pixel so sprite extraction and rendering stay crash-free.
      console.error(`[Asset Load Failed] key="${key}" file="${filename}"`, event);
      if (optional) {
        resolve(null);
        return;
      }
      getBlankImage().then(resolve);
    };

    image.src = assetUrl(filename);
  });
}

function bindUiImages() {
  leftControlIcon.src = assets.leftButton.src;
  rightControlIcon.src = assets.rightButton.src;
  fireControlIcon.src = assets.fireButton.src;
  jumpControlIcon.src = assets.jumpButton.src;

  const startCoverImage = document.getElementById("startCoverImage");
  const startButtonImageEl = document.getElementById("startButtonImage");
  if (startCoverImage && assets.startPage) {
    startCoverImage.src = assets.startPage.src;
  }
  if (startButtonImageEl && assets.startButtonImage) {
    startButtonImageEl.src = assets.startButtonImage.src;
  }

  // Snapshot the original character sprite sheet so tinted variants share layout
  if (!characterBaseSheet && assets.character) {
    characterBaseSheet = assets.character;
  }

  // Snapshot the original Hero frames BEFORE any selection swap, so restoring
  // to the original character later never picks up Lana/Andrew's frames by mistake.
  captureOriginalCharacterFrames();

  loadInitialCharacterSelection();
  buildCarouselCards();
  fillCarouselPortraits();
  applySelectedCharacterSprite();
}

function setupUI() {
  setupUIAnimations();
  updateHUD(true);
  updateFireButtonState();
}

function setupUIAnimations() {
  const interactiveButtons = document.querySelectorAll(".game-button, .touch-button");

  for (const button of interactiveButtons) {
    button.addEventListener("pointerenter", () => {
      button.classList.add("hover");
    });

    button.addEventListener("pointerleave", () => {
      button.classList.remove("hover");
      button.classList.remove("pressed");
    });

    button.addEventListener("pointerdown", () => {
      button.classList.add("pressed");
    });

    button.addEventListener("pointerup", () => {
      button.classList.remove("pressed");
    });

    button.addEventListener("pointercancel", () => {
      button.classList.remove("pressed");
    });
  }
}

function triggerButtonBounce(button) {
  button.classList.remove("is-bouncing");
  void button.offsetWidth;
  button.classList.add("is-bouncing");
}

function animateButtonPress(button) {
  button.classList.add("pressed");
  window.setTimeout(() => {
    button.classList.remove("pressed");
    triggerButtonBounce(button);
  }, 110);
}

function triggerFireButtonFlash() {
  fireControl.classList.remove("is-fired");
  void fireControl.offsetWidth;
  fireControl.classList.add("is-fired");
  window.setTimeout(() => {
    fireControl.classList.remove("is-fired");
  }, 220);
}

function triggerHudPop(element) {
  element.classList.remove("is-pop");
  void element.offsetWidth;
  element.classList.add("is-pop");
}

// Sprite helpers
function extractOpaqueBounds(image) {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = image.width;
  tempCanvas.height = image.height;

  const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
  tempCtx.imageSmoothingEnabled = false;
  tempCtx.drawImage(image, 0, 0);

  let data;
  let width;
  let height;
  try {
    ({ data, width, height } = tempCtx.getImageData(0, 0, image.width, image.height));
  } catch (error) {
    // Tainted canvas (file:// pages): fall back to the full image bounds.
    console.warn("[Opaque bounds] pixel read blocked; using full bounds.", error);
    return { x: 0, y: 0, width: image.width, height: image.height };
  }

  const alphaThreshold = 8;
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha <= alphaThreshold) {
        continue;
      }

      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }

  if (right === -1 || bottom === -1) {
    return { x: 0, y: 0, width, height };
  }

  return {
    x: left,
    y: top,
    width: right - left + 1,
    height: bottom - top + 1
  };
}

function buildGroundTileSource(image) {
  const bounds = extractOpaqueBounds(image);
  const sourceSize = Math.min(bounds.width, bounds.height);
  const sourceX = Math.round(bounds.x + (bounds.width - sourceSize) / 2);

  return {
    x: sourceX,
    y: bounds.y,
    width: sourceSize,
    height: sourceSize
  };
}

function extractSpriteFrames(image) {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = image.width;
  tempCanvas.height = image.height;

  const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
  tempCtx.imageSmoothingEnabled = false;
  tempCtx.drawImage(image, 0, 0);

  const wholeImage = [{ x: 0, y: 0, width: image.width, height: image.height }];

  let data;
  let width;
  let height;
  try {
    ({ data, width, height } = tempCtx.getImageData(0, 0, image.width, image.height));
  } catch (error) {
    // Reading pixels back throws when the canvas is tainted, which is exactly
    // what happens on a file:// page where every image counts as cross-origin.
    // Fall back to treating the sheet as a single frame so the game still
    // renders sprites (just without per-frame animation) instead of losing
    // every sprite on the page.
    console.warn("[Sprite frames] pixel read blocked; using the whole sheet.", error);
    return wholeImage;
  }

  const alphaThreshold = 8;
  const columnHasPixels = new Array(width).fill(false);

  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 2) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > alphaThreshold) {
        columnHasPixels[x] = true;
        break;
      }
    }
  }

  // Tolerate up to MAX_GAP consecutive transparent columns inside a single
  // frame — sprite sheets often have small internal gaps between limbs (e.g.
  // between an outstretched arm and torso) that would otherwise cause spurious
  // frame splits and mangle jump/idle animation indices.
  const rawRanges = [];
  const MAX_GAP = 3;
  let rangeStart = -1;
  let rangeEnd = -1;
  let gap = 0;

  for (let x = 0; x < width; x += 1) {
    if (columnHasPixels[x]) {
      if (rangeStart === -1) rangeStart = x;
      rangeEnd = x;
      gap = 0;
    } else if (rangeStart !== -1) {
      gap += 1;
      if (gap > MAX_GAP) {
        rawRanges.push({ start: rangeStart, end: rangeEnd });
        rangeStart = -1;
        rangeEnd = -1;
        gap = 0;
      }
    }
  }

  if (rangeStart !== -1) {
    rawRanges.push({ start: rangeStart, end: rangeEnd });
  }

  const usefulRanges = rawRanges.filter((range) => range.end - range.start + 1 >= 20);
  if (usefulRanges.length === 0) {
    return wholeImage;
  }

  return usefulRanges.map((range) => {
    let top = height;
    let bottom = 0;

    for (let x = range.start; x <= range.end; x += 1) {
      for (let y = 0; y < height; y += 1) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > alphaThreshold) {
          top = Math.min(top, y);
          bottom = Math.max(bottom, y);
        }
      }
    }

    const padding = 6;
    const frameX = Math.max(0, range.start - padding);
    const frameY = Math.max(0, top - padding);
    const frameRight = Math.min(width, range.end + padding + 1);
    const frameBottom = Math.min(height, bottom + padding + 1);

    return {
      x: frameX,
      y: frameY,
      width: frameRight - frameX,
      height: frameBottom - frameY
    };
  });
}

function buildPlayerAnimations(frames) {
  const frameIndexes = frames.map((_, index) => index);

  if (frameIndexes.length === 1) {
    return {
      idle: [0],
      run: [0],
      jump: [0]
    };
  }

  const idleIndex = 0;
  const jumpIndex = frameIndexes.length >= 5 ? Math.floor(frameIndexes.length / 2) : frameIndexes.length - 1;
  let runFrames = frameIndexes.filter((index) => index !== idleIndex && index !== jumpIndex);

  if (runFrames.length === 0) {
    runFrames = frameIndexes.filter((index) => index !== jumpIndex);
  }

  if (runFrames.length === 0) {
    runFrames = [idleIndex];
  }

  return {
    idle: [idleIndex],
    run: runFrames,
    jump: [jumpIndex]
  };
}

// Resize
function resizeGame() {
  // Control and HUD sizing lives in CSS (--touch-button-size and the --uw /
  // --uh frame units), so there is one source of truth and no JS/CSS fight.
  updateOrientationLock();
}

// Level helpers
function getTheme() {
  return LEVEL_THEMES[currentLevel?.theme] || LEVEL_THEMES.grassland;
}

function getLevelMaxOffset() {
  return Math.max(0, (currentLevel?.worldWidth || CONFIG.width) - CONFIG.width);
}

function clearLevelEntities() {
  terrainSegments = [];
  decorations = [];
  enemies = [];
  plants = [];
  coins = [];
  seedPickups = [];
  projectiles = [];
  effects = [];
  currentGate = null;
}

function resetPlayerForLevel(level) {
  input.left = false;
  input.right = false;
  setControlActive(leftControl, false);
  setControlActive(rightControl, false);
  setControlActive(fireControl, false);
  setControlActive(jumpControl, false);

  player.x = level.playerStart?.x ?? CONFIG.playerStartX;
  player.y = level.playerStart?.y ?? (GROUND_TOP - player.height);
  player.dx = 0;
  player.dy = 0;
  player.grounded = true;
  player.facingRight = true;
  player.isMovingHorizontally = false;
  player.state = "idle";
  player.lastState = "idle";
  player.animationFrame = 0;
  player.animationTimer = 0;
  player.seeds = 0;
  player.coyoteTimer = 0;
  player.jumpBufferTimer = 0;
  applyCharacterStats();
}

function loadLevel(levelIndex, options = {}) {
  const { resetScore = false } = options;
  const level = levels[levelIndex];
  if (!level) {
    return;
  }

  currentLevelIndex = levelIndex;
  currentLevel = level;
  gateWarp = null;
  playerInsideGate = false;

  // Level start banner — briefly show "LEVEL N" + name at the top of the canvas.
  levelStartBannerTitle = `LEVEL ${level.id}`;
  levelStartBannerSubtitle = (level.name || "").toUpperCase();
  levelStartBannerTimer = LEVEL_START_BANNER_DURATION;

  clearLevelEntities();

  terrainSegments = level.terrain.map((segment) => ({ ...segment }));
  decorations = buildLevelDecorations(level);

  currentGate = level.gate ? { ...level.gate } : null;
  if (currentGate && currentGate.y == null) {
    currentGate.y = GROUND_TOP - currentGate.height;
  }

  world.offsetX = 0;
  world.backgroundOffset = 0;
  if (resetScore) {
    world.score = 0;
    world.coins = 0;
    world.enemiesDefeated = 0;
  }

  resetPlayerForLevel(level);
  initializeLevelEnemies(level);
  initializeLevelCollectibles(level);
  updateHUD(true);
  // The end card is NOT re-templated here. loadLevel() runs 180ms into the
  // 320ms overlay fade, so resetting it made "LEVEL COMPLETE / GREAT JOB!"
  // visibly flip to "TRY AGAIN / OOPS!" on the way out. gameOver(),
  // completeLevel() and winGame() each set their own text when they show it.
}

function initializeLevelEnemies(level) {
  const levelEnemies = level.enemies || [];

  for (const enemyData of levelEnemies) {
    if (enemyData.type === "plant") {
      const plant = createPlantEnemy(enemyData);
      if (plant) {
        plants.push(plant);
      }
      continue;
    }

    if (enemyData.type === "ground") {
      const enemy = createGroundEnemy(enemyData);
      if (enemy) {
        enemies.push(enemy);
      }
      continue;
    }

    if (enemyData.type === "flying") {
      const enemy = createFlyingEnemy(enemyData);
      if (enemy) {
        enemies.push(enemy);
      }
    }
  }
}

function initializeLevelCollectibles(level) {
  coins = (level.coins || []).map((coinData, index) => createCoin(coinData, index));
  seedPickups = (level.seeds || []).map((seedData, index) => createSeedPickup(seedData, index));
}

function buildLevelDecorations(level) {
  const config = BACKGROUND_LAYER_CONFIG[level.theme] || BACKGROUND_LAYER_CONFIG.grassland;
  const layerItems = [];

  const sunHeight = Math.round(config.sun.height);
  const sunSize = {
    height: sunHeight,
    width: Math.round(sunHeight * getTrimmedAspect(assets.sunDecor, SPRITE_TRIM.sun))
  };
  layerItems.push({
    type: "sun",
    layer: 0,
    anchorX: config.sun.x,
    y: config.sun.y,
    width: sunSize.width,
    height: sunSize.height,
    parallax: config.sun.factor,
    alpha: config.sun.alpha
  });

  if (assets.mountainDecor) {
    const mountainSize = getImageDrawSize(assets.mountainDecor, config.mountain.height);
    const mountainStep = Math.max(config.mountain.spacing, mountainSize.width * 0.86);

    for (
      let worldX = config.mountain.startX;
      worldX < level.worldWidth + mountainSize.width;
      worldX += mountainStep
    ) {
      layerItems.push({
        type: "mountain",
        layer: 1,
        worldX,
        y: config.mountain.bottom - mountainSize.height,
        width: mountainSize.width,
        height: mountainSize.height,
        parallax: config.mountain.factor,
        alpha: config.mountain.alpha
      });
    }
  }

  if (assets.treeDecor) {
    for (
      let clusterX = config.tree.startX;
      clusterX < level.worldWidth + 320;
      clusterX += config.tree.clusterSpacing
    ) {
      for (let index = 0; index < config.tree.clusterOffsets.length; index += 1) {
        const treeScale = config.tree.clusterScales[index] ?? 1;
        const treeSize = getImageDrawSize(
          assets.treeDecor,
          config.tree.baseHeight * treeScale
        );

        layerItems.push({
          type: "tree",
          layer: 2,
          worldX: clusterX + config.tree.clusterOffsets[index],
          y: config.tree.baseY - treeSize.height,
          width: treeSize.width,
          height: treeSize.height,
          parallax: config.tree.factor,
          alpha: config.tree.alpha
        });
      }
    }
  }

  return layerItems;
}

function getImageDrawSize(image, targetHeight) {
  const safeHeight = Math.max(1, image?.height || 1);
  const safeWidth = Math.max(1, image?.width || 1);
  const aspectRatio = safeWidth / safeHeight;
  const height = Math.round(targetHeight);
  const width = Math.round(height * aspectRatio);

  return { width, height };
}

function createGroundEnemy(data) {
  if (groundEnemyFrames.length === 0) {
    return null;
  }

  const width = data.width ?? 42;
  const height = data.height ?? 34;
  const surface = getTopmostSurfaceAtX(data.x + width / 2, terrainSegments);

  if (!surface) {
    return null;
  }

  const maxSafeRange = Math.max(24, (surface.width - width - 20) / 2);
  const patrolRange = clamp(data.patrolRange ?? 72, 24, maxSafeRange);

  return {
    type: "ground",
    x: data.x,
    y: surface.y - height + 2,
    startX: data.x,
    width,
    height,
    patrolRange,
    direction: data.direction ?? 1,
    speed: data.speed ?? 1,
    surfaceLeft: surface.x + 10,
    surfaceRight: surface.x + surface.width - width - 10,
    surfaceY: surface.y,
    isDead: false,
    remove: false,
    frameIndex: 0,
    frameTimer: 0,
    frameDuration: 8
  };
}

function createFlyingEnemy(data) {
  if (flyingEnemyFrames.length === 0) {
    return null;
  }

  return {
    type: "flying",
    x: data.x,
    y: data.y,
    startX: data.x,
    baseY: data.y,
    width: data.width ?? 54,
    height: data.height ?? 42,
    patrolRange: data.patrolRange ?? 96,
    direction: data.direction ?? 1,
    speed: data.speed ?? 1.1,
    floatTime: data.floatTime ?? (data.x * 0.01),
    floatAmount: data.floatAmount ?? 8,
    isDead: false,
    remove: false,
    frameIndex: 0,
    frameTimer: 0,
    frameDuration: 6
  };
}

function createPlantEnemy(data) {
  if (plantFrames.length === 0) {
    return null;
  }

  const width = data.width ?? 50;
  const height = data.height ?? 60;
  const surface = getTopmostSurfaceAtX(data.x + width / 2, terrainSegments);

  if (!surface) {
    return null;
  }

  const baseY = data.y ?? (surface.y - height + 2);

  return {
    type: "plant",
    x: data.x,
    y: baseY,
    baseX: data.x,
    baseY,
    width,
    height,
    active: true,
    remove: false,
    animTime: data.animTime ?? (data.x * 0.014),
    headOffsetX: 0,
    headOffsetY: 0,
    frameIndex: 0,
    frameTimer: 0,
    frameDuration: 8
  };
}

// Sixteen collectibles were authored at deck level, so their sprite sat inside
// the platform tile — three of them almost completely buried. Those coordinates
// are fixed in the level data above, and this is the guard that keeps them
// fixed: anything still overlapping a solid tile is lifted to rest just above
// the deck when the level loads, so editing a level can never re-bury a pickup.
// verify/data.mjs asserts that the authored data needs no lifting at all.
const COLLECTIBLE_CLEARANCE = 4;

function liftClearOfTerrain(x, y, width, height) {
  let top = y;
  for (const segment of terrainSegments) {
    const overlapsX = x + width > segment.x && x < segment.x + segment.width;
    if (!overlapsX) continue;
    const overlapsY = top + height > segment.y && top < segment.y + TILE_HEIGHT;
    if (!overlapsY) continue;
    top = Math.min(top, segment.y - height - COLLECTIBLE_CLEARANCE);
  }
  return top;
}

function createCoin(data, index) {
  const width = data.width ?? 28;
  const height = data.height ?? 28;
  const y = liftClearOfTerrain(data.x, data.y, width, height);

  return {
    x: data.x,
    y,
    baseY: y,
    width,
    height,
    wave: (index + 1) * 0.6,
    frameIndex: 0,
    frameTimer: 0,
    frameDuration: 5,
    collected: false
  };
}

function createSeedPickup(data, index) {
  const width = data.width ?? 30;
  const height = data.height ?? 30;
  const y = liftClearOfTerrain(data.x, data.y, width, height);

  return {
    x: data.x,
    y,
    baseY: y,
    width,
    height,
    wave: (index + 1) * 0.4,
    collected: false,
    frameIndex: 0,
    frameTimer: 0,
    frameDuration: 7
  };
}

function resetGame(startLevelIndex = 0) {
  const index = clamp(startLevelIndex, 0, levels.length - 1);
  currentLevelIndex = index;
  loadLevel(index, { resetScore: true });
  uiState.displayedScore = 0;
  uiState.displayedSeeds = 0;
  uiState.lastSeedCount = 0;
  updateHUD(true);
}

function resetLevel() {
  loadLevel(currentLevelIndex, { resetScore: false });
  updateHUD(true);
}

function startGame(openWithJump = false, startLevelIndex = 0) {
  // The Play button is hidden until the preload finishes, but keyboard and
  // programmatic starts bypass it, so the gate lives in here too. The request
  // is remembered and replayed the moment assets are ready.
  if (!assetsReady) {
    pendingStartRequest = { openWithJump, startLevelIndex };
    console.log("[Start deferred] assets still loading");
    return;
  }
  pendingStartRequest = null;

  resetGame(startLevelIndex);
  state = STATES.PLAYING;
  updateUI();
  startBackgroundMusic();

  if (openWithJump) {
    handleJump();
  }
}

function completeLevel() {
  if (state !== STATES.PLAYING) {
    return;
  }

  releaseMovementInput();
  const hasNext = currentLevelIndex + 1 < levels.length;
  state = hasNext ? STATES.LEVEL_COMPLETE : STATES.WIN;
  player.dx = 0;
  player.isMovingHorizontally = false;
  player.state = "idle";

  commitBestScore();
  // Unlock the next level (or the final "beat the game" marker if this was L15).
  const unlockedTo = Math.min(levels.length, currentLevelIndex + 2);
  writeHighestUnlockedLevel(unlockedTo);
  updateEndScreenText(hasNext ? "complete" : "win");
  updateUI();
}

function loadNextLevel() {
  const nextLevelIndex = currentLevelIndex + 1;
  if (nextLevelIndex >= levels.length) {
    winGame();
    return;
  }

  loadLevel(nextLevelIndex, { resetScore: false });
  state = STATES.PLAYING;
  updateUI();
}

function winGame() {
  if (state === STATES.WIN) {
    return;
  }

  state = STATES.WIN;
  commitBestScore();
  updateEndScreenText("win");
  updateUI();
}

function gameOver() {
  if (state !== STATES.PLAYING) {
    return;
  }

  state = STATES.GAMEOVER;
  safePlay(sounds.playerDeath, "playerDeath");
  softenBackgroundMusic();
  commitBestScore();
  updateEndScreenText("gameover");
  updateUI();
}

function commitBestScore() {
  bestScore = Math.max(bestScore, Math.floor(world.score));
  writeBestScore(bestScore);
}

function updateEndScreenText(mode = "gameover") {
  const coinCount = world.coins || 0;
  const scoreText = formatScore(world.score);
  const bestText = formatScore(Math.max(bestScore, Math.floor(world.score)));

  if (gameOverOverlay) {
    gameOverOverlay.classList.remove("is-win", "is-gameover", "is-complete");
    gameOverOverlay.classList.add(
      mode === "win" ? "is-win" : mode === "complete" ? "is-complete" : "is-gameover"
    );
  }

  if (mode === "win") {
    gameOverKicker.textContent = "ADVENTURE COMPLETE!";
    gameOverTitle.textContent = "GRAND CHAMPION";
    if (restartButtonLabel) restartButtonLabel.textContent = "PLAY AGAIN";
  } else if (mode === "complete") {
    gameOverKicker.textContent = "LEVEL COMPLETE!";
    gameOverTitle.textContent = "GREAT JOB!";
    const hasNext = currentLevelIndex + 1 < levels.length;
    if (restartButtonLabel) restartButtonLabel.textContent = hasNext ? "NEXT LEVEL" : "PLAY AGAIN";
  } else {
    gameOverKicker.textContent = "TRY AGAIN!";
    gameOverTitle.textContent = "OOPS!";
    if (restartButtonLabel) restartButtonLabel.textContent = "PLAY AGAIN";
  }

  if (finalScoreText) finalScoreText.textContent = scoreText;
  if (finalCoinsText) finalCoinsText.textContent = String(coinCount).padStart(2, "0");

  // WIN: swap the "BEST" stat tile to show total enemies defeated on the run.
  if (mode === "win") {
    if (bestScoreLabel) bestScoreLabel.textContent = "ENEMIES";
    if (bestScoreText) bestScoreText.textContent = String(world.enemiesDefeated || 0).padStart(2, "0");
  } else {
    if (bestScoreLabel) bestScoreLabel.textContent = "BEST";
    if (bestScoreText) bestScoreText.textContent = bestText;
  }
}

// Input handling
function bindEvents() {
  document.addEventListener("pointerdown", requestGameFullscreen);
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", releaseMovementInput);
  window.addEventListener("resize", resizeGame);
  window.addEventListener("orientationchange", () => {
    updateOrientationLock();
    resizeGame();
  });
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  canvasShell.addEventListener("pointerdown", (event) => {
    unlockAudio();

    if (event.target.closest("button")) {
      return;
    }

    event.preventDefault();
    handlePrimaryAction();
  });

  canvasShell.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  startButton.addEventListener("click", (event) => {
    event.stopPropagation();
    unlockAudio();
    playClickSound();
    startButton.classList.remove("is-clicked");
    void startButton.offsetWidth;
    startButton.classList.add("is-clicked");
    window.setTimeout(() => startButton.classList.remove("is-clicked"), 600);
    beginStartSequence(false);
  });

  restartButton.addEventListener("click", (event) => {
    event.stopPropagation();
    unlockAudio();
    beginRestartSequence();
  });

  if (replayButton) {
    replayButton.addEventListener("click", (event) => {
      event.stopPropagation();
      unlockAudio();
      beginReplaySequence();
    });
  }

  if (homeButton) {
    homeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      unlockAudio();
      beginHomeSequence();
    });
  }

  if (pauseReplayButton) {
    pauseReplayButton.addEventListener("click", (event) => {
      event.stopPropagation();
      unlockAudio();
      beginReplaySequence();
    });
  }

  if (pauseHomeButton) {
    pauseHomeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      unlockAudio();
      beginHomeSequence();
    });
  }

  if (resumeButton) {
    resumeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      unlockAudio();
      resumeGame();
    });
  }

  if (pauseButton) {
    pauseButton.addEventListener("click", (event) => {
      event.stopPropagation();
      unlockAudio();
      if (state === STATES.PLAYING) {
        pauseGame();
      } else if (state === STATES.PAUSED) {
        resumeGame();
      }
    });
  }

  if (soundDisplay) {
    soundDisplay.addEventListener("click", (event) => {
      event.stopPropagation();
      unlockAudio();
      toggleMute();
      updateHUD(true);
    });
  }

  if (startSoundToggle) {
    startSoundToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      unlockAudio();
      toggleMute();
      updateHUD(true);
    });
  }

  // closest() keeps this working if the markup is ever re-nested; the parent is
  // the fallback so the pads can never end up unbound.
  const moveCluster =
    (leftControl.closest && leftControl.closest(".mobile-cluster")) || leftControl.parentElement;
  bindMovementCluster(moveCluster, { left: leftControl, right: rightControl });
  bindFireButton(fireControl);
  bindJumpButton(jumpControl);

  bindLobbyEvents();
}

function bindLobbyEvents() {
  if (lobbyPlayButton) {
    lobbyPlayButton.addEventListener("click", (event) => {
      event.stopPropagation();
      unlockAudio();
      beginLobbyPlaySequence();
    });
  }

  if (lobbyBackButton) {
    lobbyBackButton.addEventListener("click", (event) => {
      event.stopPropagation();
      unlockAudio();
      exitLobbyToStart();
    });
  }

  if (lobbySoundToggle) {
    lobbySoundToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      unlockAudio();
      toggleMute();
      lobbySoundToggle.classList.toggle("is-muted", isMuted);
      updateHUD(true);
    });
  }

  if (lobbySettingsButton) {
    lobbySettingsButton.addEventListener("click", (event) => {
      event.stopPropagation();
      lobbySettingsButton.classList.remove("is-spun");
      void lobbySettingsButton.offsetWidth;
      lobbySettingsButton.classList.add("is-spun");
    });
  }

  if (levelPickerPrev) {
    levelPickerPrev.addEventListener("click", (event) => {
      event.stopPropagation();
      changeStartLevel(-1);
    });
  }

  if (levelPickerNext) {
    levelPickerNext.addEventListener("click", (event) => {
      event.stopPropagation();
      changeStartLevel(1);
    });
  }

  if (carouselPrev) {
    carouselPrev.addEventListener("click", (event) => {
      event.stopPropagation();
      selectNextCharacter(-1);
    });
  }

  if (carouselNext) {
    carouselNext.addEventListener("click", (event) => {
      event.stopPropagation();
      selectNextCharacter(1);
    });
  }

  // Swipe support on the carousel track
  if (carouselTrack) {
    let startX = 0;
    let dragActive = false;
    carouselTrack.addEventListener("pointerdown", (event) => {
      dragActive = true;
      startX = event.clientX;
    });
    carouselTrack.addEventListener("pointerup", (event) => {
      if (!dragActive) return;
      dragActive = false;
      const dx = event.clientX - startX;
      if (Math.abs(dx) > 40) {
        selectNextCharacter(dx < 0 ? 1 : -1);
      }
    });
    carouselTrack.addEventListener("pointercancel", () => {
      dragActive = false;
    });
  }
}

function handleKeyDown(event) {
  unlockAudio();

  if (event.code === "KeyM" && !event.repeat) {
    event.preventDefault();
    toggleMute();
    updateHUD(true);
    return;
  }

  if ((event.code === "KeyP" || event.code === "Escape") && !event.repeat) {
    if (state === STATES.PLAYING) {
      event.preventDefault();
      pauseGame();
      return;
    }
    if (state === STATES.PAUSED) {
      event.preventDefault();
      resumeGame();
      return;
    }
    // fall through so LOBBY (and other states) can handle Escape themselves
  }

  if (state === STATES.LOBBY) {
    if (event.code === "ArrowLeft") {
      event.preventDefault();
      selectNextCharacter(-1);
      return;
    }
    if (event.code === "ArrowRight") {
      event.preventDefault();
      selectNextCharacter(1);
      return;
    }
    if (event.code === "Enter" || event.code === "Space") {
      event.preventDefault();
      // Ignore Enter/Space for a short window after entering the lobby so a
      // Space still held from the Start→Lobby transition doesn't skip the lobby.
      const enteredAt = uiState.lobbyEnteredAt || 0;
      if (performance.now() - enteredAt < 300) return;
      beginLobbyPlaySequence();
      return;
    }
    if (event.code === "Escape") {
      event.preventDefault();
      exitLobbyToStart();
      return;
    }
  }

  // Escape on any end-screen returns to the start thumbnail.
  if (
    event.code === "Escape" &&
    (state === STATES.GAMEOVER ||
      state === STATES.WIN ||
      state === STATES.LEVEL_COMPLETE)
  ) {
    event.preventDefault();
    beginHomeSequence();
    return;
  }

  if (event.code === "ArrowLeft") {
    event.preventDefault();
    input.left = true;
    return;
  }

  if (event.code === "ArrowRight") {
    event.preventDefault();
    input.right = true;
    return;
  }

  const isShootKey = event.code === "KeyF" || event.code === "KeyX";
  if (isShootKey) {
    if (!event.repeat) {
      event.preventDefault();
      shootSeed();
    }
    return;
  }

  const isJumpKey = event.code === "Space" || event.code === "ArrowUp";
  if (!isJumpKey || event.repeat) {
    return;
  }

  event.preventDefault();
  handlePrimaryAction();
}

function handleKeyUp(event) {
  if (event.code === "ArrowLeft") {
    event.preventDefault();
    input.left = false;
  } else if (event.code === "ArrowRight") {
    event.preventDefault();
    input.right = false;
  }
}

// Touch pointers are implicitly captured by whichever element got pointerdown,
// so per-button listeners meant sliding a thumb from LEFT onto RIGHT never
// fired anything — the player had to lift off and press again. The movement
// pads are therefore driven as one surface: press anywhere in the cluster and
// the direction follows the finger until it lifts.
function bindMovementCluster(cluster, buttons) {
  if (!cluster) return;

  // pointerId -> key, or null whenever the finger is off both pads. The entry
  // is kept either way: deleting on the first miss would drop tracking the
  // moment a thumb strayed off a pad — the exact slide this is here to support.
  // The pads themselves are laid out edge to edge (see .mobile-cluster--move),
  // so a straight LEFT->RIGHT slide never leaves them at all; this keeps
  // working for a thumb that wanders above or below them on the way across.
  // Entries are only removed when the pointer actually ends.
  const activePointers = new Map();

  const keyAtPoint = (x, y) => {
    for (const [key, button] of Object.entries(buttons)) {
      if (!button) continue;
      const rect = button.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return key;
      }
    }
    return null;
  };

  const refresh = () => {
    const held = new Set(activePointers.values());
    let anyHeld = false;
    for (const [key, button] of Object.entries(buttons)) {
      const isHeld = held.has(key);
      if (isHeld) anyHeld = true;
      input[key] = isHeld;
      setControlActive(button, isHeld);
    }
    if (!anyHeld) player.dx = 0;
  };

  cluster.addEventListener("pointerdown", (event) => {
    const key = keyAtPoint(event.clientX, event.clientY);
    if (!key) return;
    event.preventDefault();
    unlockAudio();
    // Capture on the button that was pressed: its events still bubble to this
    // cluster listener, and the cluster itself is pointer-events:none in CSS.
    const captureTarget = event.target.closest ? event.target.closest(".touch-button") : null;
    if (captureTarget && captureTarget.setPointerCapture) {
      try { captureTarget.setPointerCapture(event.pointerId); } catch (error) { /* ignore */ }
    }
    activePointers.set(event.pointerId, key);
    refresh();
  });

  cluster.addEventListener("pointermove", (event) => {
    if (!activePointers.has(event.pointerId)) return;
    event.preventDefault();
    // null while over the gap between the pads: nothing is held, but the
    // pointer stays tracked so arriving at the other pad still registers.
    activePointers.set(event.pointerId, keyAtPoint(event.clientX, event.clientY));
    refresh();
  });

  const drop = (event) => {
    if (!activePointers.delete(event.pointerId)) return;
    refresh();
  };
  cluster.addEventListener("pointerup", drop);
  cluster.addEventListener("pointercancel", drop);
  cluster.addEventListener("lostpointercapture", drop);
}

function bindJumpButton(button) {
  const release = () => {
    setControlActive(button, false);
  };

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    unlockAudio();
    animateButtonPress(button);
    setControlActive(button, true);
    handlePrimaryAction();
  });

  button.addEventListener("pointerup", release);
  button.addEventListener("pointerleave", release);
  button.addEventListener("pointercancel", release);
}

function bindFireButton(button) {
  const release = () => {
    setControlActive(button, false);
  };

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    unlockAudio();
    animateButtonPress(button);
    setControlActive(button, true);
    shootSeed();
  });

  button.addEventListener("pointerup", release);
  button.addEventListener("pointerleave", release);
  button.addEventListener("pointercancel", release);
}

function setControlActive(button, isActive) {
  button.classList.toggle("is-active", isActive);
}

function releaseMovementInput() {
  input.left = false;
  input.right = false;
  player.dx = 0;
  setControlActive(leftControl, false);
  setControlActive(rightControl, false);
  setControlActive(fireControl, false);
  setControlActive(jumpControl, false);
}

function handlePrimaryAction() {
  if (state === STATES.LOADING) {
    return;
  }

  if (state === STATES.START) {
    beginStartSequence(true);
    return;
  }

  if (
    state === STATES.GAMEOVER ||
    state === STATES.WIN ||
    state === STATES.LEVEL_COMPLETE
  ) {
    beginRestartSequence();
    return;
  }

  if (state === STATES.PAUSED) {
    resumeGame();
    return;
  }

  if (state !== STATES.PLAYING) {
    return;
  }

  handleJump();
}

function beginStartSequence(openWithJump = false) {
  if (uiState.startTransitionActive || state !== STATES.START) {
    return;
  }

  uiState.startTransitionActive = true;
  animateButtonPress(startButton);
  window.setTimeout(() => {
    hideStartUI();
  }, 60);

  window.setTimeout(() => {
    uiState.startTransitionActive = false;
    enterLobby();
  }, 200);
}

function beginLobbyPlaySequence() {
  if (state !== STATES.LOBBY) return;
  animateButtonPress(lobbyPlayButton);
  playClickSound();
  window.setTimeout(() => {
    exitLobbyToGame();
  }, 220);
}

function beginRestartSequence() {
  const isEndState =
    state === STATES.GAMEOVER ||
    state === STATES.WIN ||
    state === STATES.LEVEL_COMPLETE;
  if (uiState.restartTransitionActive || !isEndState) {
    return;
  }

  const advanceToNext =
    state === STATES.LEVEL_COMPLETE && currentLevelIndex + 1 < levels.length;

  uiState.restartTransitionActive = true;
  animateButtonPress(restartButton);
  window.setTimeout(() => {
    hideGameOverUI();
  }, 50);

  window.setTimeout(() => {
    uiState.restartTransitionActive = false;
    if (advanceToNext) {
      loadNextLevel();
      startBackgroundMusic();
    } else {
      // Retry from the level the run ended on rather than dumping the player
      // back at level 1 — the score resets, the progress does not.
      startGame(false, state === STATES.WIN ? 0 : currentLevelIndex);
    }
  }, 180);
}

function beginReplaySequence() {
  const isEndState =
    state === STATES.GAMEOVER ||
    state === STATES.WIN ||
    state === STATES.LEVEL_COMPLETE ||
    state === STATES.PAUSED;
  if (uiState.restartTransitionActive || !isEndState) {
    return;
  }

  uiState.restartTransitionActive = true;
  window.setTimeout(() => {
    hideGameOverUI();
    hidePauseUI();
  }, 50);

  window.setTimeout(() => {
    uiState.restartTransitionActive = false;
    resetLevel();
    state = STATES.PLAYING;
    updateUI();
    startBackgroundMusic();
  }, 180);
}

function beginHomeSequence() {
  const canHome =
    state === STATES.GAMEOVER ||
    state === STATES.WIN ||
    state === STATES.LEVEL_COMPLETE ||
    state === STATES.PAUSED;
  if (!canHome) {
    return;
  }

  releaseMovementInput();
  hideGameOverUI();
  hidePauseUI();
  resetGame();
  state = STATES.START;
  softenBackgroundMusic();
  updateUI();
}

function pauseGame() {
  // The warp is a short cutscene; let it finish rather than freezing halfway.
  if (gateWarp) return;

  if (state !== STATES.PLAYING) return;
  state = STATES.PAUSED;
  releaseMovementInput();
  softenBackgroundMusic();
  updateUI();
}

function resumeGame() {
  if (state !== STATES.PAUSED) return;
  // Clear any movement keys/pointers that were held across the pause overlay —
  // no keyup fires under the overlay, so held state would otherwise resume as
  // an instant "walking" input.
  releaseMovementInput();
  input.left = false;
  input.right = false;
  state = STATES.PLAYING;
  updateUI();
  startBackgroundMusic();
}

function handleJump() {
  if (state !== STATES.PLAYING) {
    return;
  }

  if (player.grounded || player.coyoteTimer > 0) {
    performJump();
    return;
  }

  // Airborne: remember the press briefly so a slightly early tap still fires
  // the moment the feet touch down.
  player.jumpBufferTimer = CONFIG.jumpBufferFrames;
}

function performJump() {
  player.grounded = false;
  player.coyoteTimer = 0;
  player.jumpBufferTimer = 0;
  player.dy = getJumpVelocity();
  spawnEffect("jump", player.x + 4, player.y + player.height - 10);
}

function getProjectileSpeed() {
  return player.projectileSpeed ?? CONFIG.projectileSpeed;
}

function shootSeed() {
  if (state !== STATES.PLAYING || player.seeds <= 0) {
    return;
  }

  player.seeds -= 1;
  triggerFireButtonFlash();

  const projectileWidth = CONFIG.projectileWidth;
  const projectileHeight = CONFIG.projectileHeight;
  const xOffset = player.facingRight ? player.width * 0.35 : -player.width * 0.05;

  projectiles.push({
    x: player.x + xOffset,
    y: player.y + player.height * 0.45 - projectileHeight / 2,
    width: projectileWidth,
    height: projectileHeight,
    dx: player.facingRight ? getProjectileSpeed() : -getProjectileSpeed(),
    facingRight: player.facingRight,
    remove: false,
    frameIndex: 0,
    frameTimer: 0,
    frameDuration: CONFIG.projectileFrameDuration
  });
}

// Effects
function spawnEffect(type, x, y) {
  let frames = [];
  let image = null;
  let width = 0;
  let height = 0;
  let frameDuration = 4;
  let riseSpeed = 0;

  if (type === "jump") {
    frames = jumpEffectFrames;
    image = assets.jumpEffect;
    width = 48;
    height = 24;
  } else if (type === "damage") {
    frames = damageEffectFrames;
    image = assets.damageEffect;
    width = 56;
    height = 56;
  } else if (type === "coin") {
    frames = damageEffectFrames;
    image = assets.damageEffect;
    width = 34;
    height = 34;
    frameDuration = 3;
    riseSpeed = 0.35;
  } else if (type === "hit") {
    frames = hitEffectFrames;
    image = assets.hitEffect;
    width = 52;
    height = 52;
    frameDuration = 3;
  }

  if (!image || frames.length === 0) {
    return;
  }

  effects.push({
    type,
    x,
    y,
    width,
    height,
    image,
    frames,
    frameIndex: 0,
    frameTimer: 0,
    frameDuration,
    riseSpeed
  });
}

// Update functions
function scrollWorld(scrollAmount) {
  if (scrollAmount === 0) {
    return;
  }

  const maxOffset = getLevelMaxOffset();
  const nextOffset = clamp(world.offsetX + scrollAmount, 0, maxOffset);
  const appliedScroll = nextOffset - world.offsetX;

  world.offsetX = nextOffset;

  if (appliedScroll === 0) {
    return;
  }

  world.backgroundOffset += appliedScroll * CONFIG.backgroundSpeedFactor;
  if (appliedScroll > 0) {
    world.score += appliedScroll * CONFIG.distanceScoreRate;
  }

  shiftTerrain(appliedScroll);
  shiftGate(appliedScroll);
  shiftEnemies(appliedScroll);
  shiftPlants(appliedScroll);
  shiftCoins(appliedScroll);
  shiftSeedPickups(appliedScroll);
  shiftProjectiles(appliedScroll);
  shiftEffects(appliedScroll);
}

function shiftTerrain(scrollAmount) {
  for (const segment of terrainSegments) {
    segment.x -= scrollAmount;
  }
}

function shiftGate(scrollAmount) {
  if (!currentGate) {
    return;
  }

  currentGate.x -= scrollAmount;
}

function shiftEnemies(scrollAmount) {
  for (const enemy of enemies) {
    enemy.x -= scrollAmount;
    enemy.startX -= scrollAmount;

    if (enemy.surfaceLeft != null) {
      enemy.surfaceLeft -= scrollAmount;
    }

    if (enemy.surfaceRight != null) {
      enemy.surfaceRight -= scrollAmount;
    }
  }
}

function shiftPlants(scrollAmount) {
  for (const plant of plants) {
    plant.baseX -= scrollAmount;
    plant.x -= scrollAmount;
  }
}

function shiftCoins(scrollAmount) {
  for (const coin of coins) {
    coin.x -= scrollAmount;
  }
}

function shiftSeedPickups(scrollAmount) {
  for (const pickup of seedPickups) {
    pickup.x -= scrollAmount;
  }
}

function shiftProjectiles(scrollAmount) {
  for (const projectile of projectiles) {
    projectile.x -= scrollAmount;
  }
}

function shiftEffects(scrollAmount) {
  for (const effect of effects) {
    effect.x -= scrollAmount;
  }
}

function updatePlayer(delta) {
  let scrollAmount = 0;
  const maxOffset = getLevelMaxOffset();
  const moveAmount = player.moveSpeed * delta;

  player.dx = 0;
  player.isMovingHorizontally = false;

  if (input.left && !input.right) {
    player.dx = -player.moveSpeed;
    player.facingRight = false;
    player.isMovingHorizontally = true;

    if (player.x > CONFIG.cameraBacktrackX || world.offsetX <= 0) {
      player.x -= moveAmount;
    } else {
      const worldStep = Math.min(moveAmount, world.offsetX);
      scrollAmount = -worldStep;
      player.x -= moveAmount - worldStep;
    }
  } else if (input.right && !input.left) {
    player.dx = player.moveSpeed;
    player.facingRight = true;
    player.isMovingHorizontally = true;

    const remainingCamera = maxOffset - world.offsetX;

    if (player.x < CONFIG.cameraFollowX) {
      const playerStep = Math.min(moveAmount, CONFIG.cameraFollowX - player.x);
      player.x += playerStep;
      scrollAmount = Math.min(moveAmount - playerStep, remainingCamera);
    } else {
      scrollAmount = Math.min(moveAmount, remainingCamera);
      player.x += moveAmount - scrollAmount;
    }
  }

  player.x = clamp(player.x, 0, canvas.width - player.width);
  scrollWorld(scrollAmount);

  resolveHorizontalCollision();

  const previousBottom = player.y + player.height;
  const previousTop = player.y + CONFIG.headInset;

  player.grounded = false;
  player.dy = Math.min(CONFIG.terminalVelocity, player.dy + CONFIG.gravity * delta);
  player.y += player.dy * delta;

  resolveCeilingCollision(previousTop);
  resolveGroundCollision(previousBottom);
  resolveHorizontalCollision();

  if (player.grounded) {
    player.coyoteTimer = CONFIG.coyoteFrames;
  } else {
    player.coyoteTimer = Math.max(0, player.coyoteTimer - delta);
  }

  if (player.jumpBufferTimer > 0) {
    player.jumpBufferTimer = Math.max(0, player.jumpBufferTimer - delta);
    if (player.grounded) {
      player.jumpBufferTimer = 0;
      performJump();
    }
  }

  if (player.y > canvas.height + player.height) {
    gameOver();
  }

  updatePlayerState();
  updatePlayerAnimation(delta);
}

function updatePlayerState() {
  if (!player.grounded) {
    player.state = "jump";
  } else if (player.isMovingHorizontally) {
    player.state = "run";
  } else {
    player.state = "idle";
  }
}

function updatePlayerAnimation(delta) {
  if (player.state !== player.lastState) {
    player.animationFrame = 0;
    player.animationTimer = 0;
  }
  player.lastState = player.state;

  const sequence = playerAnimations[player.state] || playerAnimations.idle;
  if (sequence.length <= 1) {
    return;
  }

  const frameDuration = player.state === "run" ? 6 : 18;
  player.animationTimer += delta;

  if (player.animationTimer >= frameDuration) {
    player.animationTimer = 0;
    player.animationFrame = (player.animationFrame + 1) % sequence.length;
  }
}

function updateEnemies(delta) {
  updatePlants(delta);

  for (const enemy of enemies) {
    if (enemy.remove) {
      continue;
    }

    updateLoopingAnimation(enemy, getEnemyFrames(enemy), delta);

    enemy.x += enemy.speed * enemy.direction * delta;

    const patrolMin = Math.max(enemy.startX - enemy.patrolRange, enemy.surfaceLeft ?? -Infinity);
    const patrolMax = Math.min(enemy.startX + enemy.patrolRange, enemy.surfaceRight ?? Infinity);

    if (enemy.x > patrolMax) {
      enemy.x = patrolMax;
      enemy.direction = -1;
    } else if (enemy.x < patrolMin) {
      enemy.x = patrolMin;
      enemy.direction = 1;
    }

    if (enemy.type === "flying") {
      enemy.floatTime += 0.08 * delta;
      enemy.y = enemy.baseY + Math.sin(enemy.floatTime) * enemy.floatAmount;
      continue;
    }

    enemy.y = enemy.surfaceY - enemy.height + 2;
  }

  enemies = enemies.filter((enemy) => !enemy.remove && enemy.y < canvas.height + 120);
}

function updatePlants(delta) {
  for (const plant of plants) {
    if (!plant.active || plant.remove) {
      continue;
    }

    updateLoopingAnimation(plant, plantFrames, delta);
    plant.animTime += 0.06 * delta;
    plant.headOffsetY = Math.sin(plant.animTime) * 2;
    plant.headOffsetX = Math.sin(plant.animTime * 0.7) * 1.5;
    plant.x = plant.baseX;
    plant.y = plant.baseY;
  }

  plants = plants.filter((plant) => plant.active && !plant.remove);
}

function updateCoins(delta) {
  for (const coin of coins) {
    coin.wave += 0.12 * delta;
    coin.y = coin.baseY + Math.sin(coin.wave) * 6;
    updateLoopingAnimation(coin, coinFrames, delta);
  }

  coins = coins.filter((coin) => !coin.collected);
}

function updateSeedPickups(delta) {
  for (const pickup of seedPickups) {
    pickup.wave += 0.08 * delta;
    pickup.y = pickup.baseY + Math.sin(pickup.wave) * 5;
    updateLoopingAnimation(pickup, seedPickupFrames, delta);
  }

  seedPickups = seedPickups.filter((pickup) => !pickup.collected);
}

function updateProjectiles(delta) {
  for (const projectile of projectiles) {
    projectile.x += projectile.dx * delta;
    updateLoopingAnimation(projectile, seedProjectileFrames, delta);

    // A seed that runs into scenery bursts instead of passing through it.
    if (hitsTerrain(projectile)) {
      projectile.remove = true;
      spawnEffect("hit", projectile.x - 12, projectile.y - 12);
    }
  }

  projectiles = projectiles.filter(
    (projectile) =>
      !projectile.remove &&
      projectile.x + projectile.width > -80 &&
      projectile.x < canvas.width + 80
  );
}

function hitsTerrain(box) {
  for (const segment of terrainSegments) {
    if (box.x + box.width <= segment.x || box.x >= segment.x + segment.width) continue;
    if (box.y + box.height <= segment.y || box.y >= segment.y + TILE_HEIGHT) continue;
    return true;
  }
  return false;
}

function updateEffects(delta) {
  for (const effect of effects) {
    effect.frameTimer += delta;

    if (effect.riseSpeed > 0) {
      effect.y -= effect.riseSpeed * delta;
    }

    if (effect.frameTimer >= effect.frameDuration) {
      effect.frameTimer = 0;
      effect.frameIndex += 1;
    }
  }

  effects = effects.filter((effect) => effect.frameIndex < effect.frames.length);
}

function updateLoopingAnimation(entity, frames, delta) {
  if (!frames || frames.length <= 1) {
    return;
  }

  entity.frameTimer += delta;
  if (entity.frameTimer >= entity.frameDuration) {
    entity.frameTimer = 0;
    entity.frameIndex = (entity.frameIndex + 1) % frames.length;
  }
}

// Collision helpers
function getPlayerHitbox() {
  return {
    x: player.x + (player.width - CONFIG.hitboxWidth) / 2,
    y: player.y + (player.height - CONFIG.hitboxHeight),
    width: CONFIG.hitboxWidth,
    height: CONFIG.hitboxHeight
  };
}

function getTopmostSurfaceAtX(x, segments = terrainSegments) {
  let bestSegment = null;

  for (const segment of segments) {
    if (x < segment.x || x >= segment.x + segment.width) {
      continue;
    }

    if (!bestSegment || segment.y < bestSegment.y) {
      bestSegment = segment;
    }
  }

  return bestSegment;
}

function getTopmostSurfaceInRange(left, right, minimumY = -Infinity) {
  let bestSegment = null;

  for (const segment of terrainSegments) {
    const overlaps = right > segment.x && left < segment.x + segment.width;
    if (!overlaps || segment.y < minimumY) {
      continue;
    }

    if (!bestSegment || segment.y < bestSegment.y) {
      bestSegment = segment;
    }
  }

  return bestSegment;
}

function getGroundUnderPlayer() {
  const hitbox = getPlayerHitbox();
  const footLeft = hitbox.x + CONFIG.collisionInset;
  const footRight = hitbox.x + hitbox.width - CONFIG.collisionInset;
  const bottomReference = hitbox.y + hitbox.height - 8;
  const segment = getTopmostSurfaceInRange(footLeft, footRight, bottomReference);
  return segment ? segment.y : null;
}

// Terrain is solid on every face, ground and platforms alike, so the character
// can never be inside a tile.
//
// Platforms used to be one-way decks — passable from the sides and from below —
// which is what let a jumping player end up buried in a 64px slab of earth.
// They are solid now, and the type survives only to say which of the two
// terrain layers a segment is painted in (see drawTerrain).
//
// One-way decks were originally introduced to unblock level 12, whose first pit
// was approached under a platform whose left face sat on the takeoff arc. That
// platform has since been moved clear of the arc, so the decks are no longer
// load-bearing: verify/reach.mjs confirms all 15 levels stay completable for
// every character with the faces solid.
function isFloatingPlatform(segment) {
  return segment.type === "platform";
}

function findLandingSurface(previousBottom, currentBottom) {
  const hitbox = getPlayerHitbox();
  const footLeft = hitbox.x + CONFIG.collisionInset;
  const footRight = hitbox.x + hitbox.width - CONFIG.collisionInset;
  let bestSegment = null;

  for (const segment of terrainSegments) {
    const overlaps = footRight > segment.x && footLeft < segment.x + segment.width;
    if (!overlaps) {
      continue;
    }

    // The small upward tolerance keeps a fast landing on a run of tiles from
    // being missed between two frames.
    if (previousBottom <= segment.y + 10 && currentBottom >= segment.y) {
      if (!bestSegment || segment.y < bestSegment.y) {
        bestSegment = segment;
      }
    }
  }

  return bestSegment;
}

function resolveGroundCollision(previousBottom) {
  const currentBottom = player.y + player.height;
  const landingSurface = findLandingSurface(previousBottom, currentBottom);
  if (!landingSurface) {
    return;
  }

  player.y = landingSurface.y - player.height;
  player.dy = 0;
  player.grounded = true;
}

// A rising player's head stops against a block's underside. Without this the
// horizontal push-out below would shove him sideways out of the tile he rose
// into — a 30px+ snap that reads as a teleport — because nothing else in the
// engine ever resolved an upward hit.
function resolveCeilingCollision(previousTop) {
  if (player.dy >= 0) {
    return;
  }

  const hitbox = getPlayerHitbox();
  const headLeft = hitbox.x + CONFIG.collisionInset;
  const headRight = hitbox.x + hitbox.width - CONFIG.collisionInset;
  const headTop = player.y + CONFIG.headInset;
  let ceiling = null;

  for (const segment of terrainSegments) {
    if (headRight <= segment.x || headLeft >= segment.x + segment.width) {
      continue;
    }

    // Only a block whose underside he was below last frame and has now crossed.
    const segmentBottom = segment.y + TILE_HEIGHT;
    if (previousTop < segmentBottom || headTop >= segmentBottom) {
      continue;
    }

    if (ceiling === null || segmentBottom > ceiling) {
      ceiling = segmentBottom;
    }
  }

  if (ceiling === null) {
    return;
  }

  player.y = ceiling - CONFIG.headInset;
  player.dy = 0;
}

function resolveHorizontalCollision() {
  const hitbox = getPlayerHitbox();
  const hbTop = hitbox.y;
  const hbBottom = hitbox.y + hitbox.height;

  for (const segment of terrainSegments) {
    const segTop = segment.y;
    const segBottom = segment.y + TILE_HEIGHT;

    // Skip surfaces the player can stand on (feet at or above the top)
    if (segTop >= hbBottom - 4) continue;

    // Vertical overlap check (hitbox intersects the segment's block)
    if (hbBottom <= segTop || hbTop >= segBottom) continue;

    const hbLeft = hitbox.x;
    const hbRight = hitbox.x + hitbox.width;
    const segLeft = segment.x;
    const segRight = segment.x + segment.width;

    if (hbRight <= segLeft || hbLeft >= segRight) continue;

    const pushLeft = hbRight - segLeft;
    const pushRight = segRight - hbLeft;

    if (pushLeft < pushRight) {
      player.x -= pushLeft;
    } else {
      player.x += pushRight;
    }
  }

  player.x = clamp(player.x, 0, canvas.width - player.width);
}

function handleCollisions() {
  checkCoinCollisions();
  checkSeedPickupCollisions();
  checkProjectileHits();
  checkPlantCollisions();
  checkEnemyCollisions();
  checkGateCollision();
}

function checkCoinCollisions() {
  const playerHitbox = getPlayerHitbox();

  for (const coin of coins) {
    if (coin.collected) {
      continue;
    }

    if (rectsOverlap(playerHitbox, coin)) {
      coin.collected = true;
      world.score += CONFIG.coinScore;
      world.coins = (world.coins || 0) + 1;
      spawnEffect("coin", coin.x - 4, coin.y - 6);
      safePlay(sounds.coin, "coin");
    }
  }
}

function checkSeedPickupCollisions() {
  const playerHitbox = getPlayerHitbox();

  for (const pickup of seedPickups) {
    if (pickup.collected) {
      continue;
    }

    if (rectsOverlap(playerHitbox, pickup)) {
      pickup.collected = true;
      player.seeds += 1;
    }
  }

  seedPickups = seedPickups.filter((pickup) => !pickup.collected);
}

function checkProjectileHits() {
  for (const projectile of projectiles) {
    if (projectile.remove) {
      continue;
    }

    for (const enemy of enemies) {
      if (enemy.remove) {
        continue;
      }

      if (!rectsOverlap(projectile, getEnemyHitbox(enemy))) {
        continue;
      }

      projectile.remove = true;
      enemy.isDead = true;
      enemy.remove = true;
      world.score += CONFIG.seedHitScore;
      world.enemiesDefeated = (world.enemiesDefeated || 0) + 1;
      spawnEffect("hit", enemy.x - 4, enemy.y - 8);
      safePlay(sounds.enemyKill, "enemyKill");
      break;
    }

    if (projectile.remove) {
      continue;
    }

    for (const plant of plants) {
      if (!plant.active || plant.remove) {
        continue;
      }

      if (!rectsOverlap(projectile, getPlantHitbox(plant))) {
        continue;
      }

      projectile.remove = true;
      plant.active = false;
      plant.remove = true;
      world.score += CONFIG.plantScore;
      world.enemiesDefeated = (world.enemiesDefeated || 0) + 1;
      spawnEffect("hit", plant.x - 2, plant.y - 6);
      safePlay(sounds.enemyKill, "enemyKill");
      break;
    }
  }

  projectiles = projectiles.filter((projectile) => !projectile.remove);
  enemies = enemies.filter((enemy) => !enemy.remove);
  plants = plants.filter((plant) => plant.active && !plant.remove);
}

function checkPlantCollisions() {
  const playerHitbox = getPlayerHitbox();
  for (const plant of plants) {
    if (!plant.active || plant.remove) {
      continue;
    }

    const plantHitbox = getPlantHitbox(plant);
    if (!rectsOverlap(playerHitbox, plantHitbox)) {
      continue;
    }

    if (isStompCollision(playerHitbox, plantHitbox)) {
      stompPlant(plant, plantHitbox);
      plants = plants.filter((activePlant) => activePlant.active && !activePlant.remove);
      return;
    }

    applyPlayerDamage();
    return;
  }
}

function checkEnemyCollisions() {
  const playerHitbox = getPlayerHitbox();
  for (const enemy of enemies) {
    if (enemy.remove) {
      continue;
    }

    const enemyHitbox = getEnemyHitbox(enemy);
    if (!rectsOverlap(playerHitbox, enemyHitbox)) {
      continue;
    }

    if (isStompCollision(playerHitbox, enemyHitbox)) {
      stompEnemy(enemy, enemyHitbox);
      enemies = enemies.filter((activeEnemy) => !activeEnemy.remove);
      return;
    }

    applyPlayerDamage();
    return;
  }
}

// ---------------------------------------------------------------------------
// Exit gate geometry
//
// The gate sprite carries a lot of transparent padding (359 of its 1536 rows
// are empty at the bottom), so fitting the whole bitmap into the gate box left
// the doorway floating ~28px above the ground and drawing smaller than its
// box. Everything below works from the sprite's measured art instead, so it
// fills the box and stands on the ground — and the collision box lines up with
// the doorway the player can actually see.
//
// Two boxes are measured, because the sprite's lowest 73 rows are the pool of
// light that spills out from under the arch, not the gate:
//
//   art        every pixel with any alpha, glow included. This is what is drawn.
//   footprint  the structure alone. Its bottom edge is the line the gate stands
//              on, found by scanning up from the base for the last row whose art
//              still reaches both outer edges — i.e. where the two pillars end.
//              Below that only the central glow remains.
//
// Anchoring the whole `art` box to the ground is what made the pillars hover
// 9px in the air: the glow underneath them was holding the gate up.
// ---------------------------------------------------------------------------
let gateArtMetrics = null;

// Fraction of the art's width that an edge may be inset by and still count as
// "this row still has both pillars in it".
const GATE_EDGE_TOLERANCE = 0.06;

function measureGateArt(image) {
  const alphaThreshold = 8;
  const fullBox = () => {
    const box = { x: 0, y: 0, width: image.width, height: image.height };
    return { art: box, footprint: { ...box } };
  };

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = image.width;
  tempCanvas.height = image.height;
  const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
  tempCtx.imageSmoothingEnabled = false;
  tempCtx.drawImage(image, 0, 0);

  let data;
  let width;
  let height;
  try {
    ({ data, width, height } = tempCtx.getImageData(0, 0, image.width, image.height));
  } catch (error) {
    // Tainted canvas (file:// pages) — same fallback the rest of the sprite
    // helpers use: treat the whole bitmap as the art.
    console.warn("[Gate art] pixel read blocked; using full bounds.", error);
    return fullBox();
  }

  // One pass, recording each row's horizontal extent as well as the overall box.
  const rowFirst = new Array(height).fill(-1);
  const rowLast = new Array(height).fill(-1);
  let left = width;
  let right = -1;
  let top = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * width;
    let first = -1;
    let last = -1;
    for (let x = 0; x < width; x += 1) {
      if (data[(rowStart + x) * 4 + 3] <= alphaThreshold) continue;
      if (first === -1) first = x;
      last = x;
    }
    rowFirst[y] = first;
    rowLast[y] = last;
    if (first === -1) continue;
    if (top === -1) top = y;
    bottom = y;
    if (first < left) left = first;
    if (last > right) right = last;
  }

  if (bottom === -1) return fullBox();

  const art = { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
  const footprint = { ...art };

  const tolerance = Math.max(2, Math.round(art.width * GATE_EDGE_TOLERANCE));
  for (let y = bottom; y >= top; y -= 1) {
    if (rowFirst[y] === -1) continue;
    if (rowFirst[y] <= left + tolerance && rowLast[y] >= right - tolerance) {
      footprint.height = y - top + 1;
      break;
    }
  }

  return { art, footprint };
}

function getGateArtMetrics() {
  if (gateArtMetrics) return gateArtMetrics;
  if (!assets.exitGate) return null;
  gateArtMetrics = measureGateArt(assets.exitGate);
  return gateArtMetrics;
}

// The doorway as it appears on screen, in world coordinates: the gate structure
// fitted to its box and standing on the box's floor. This is the rect the
// collision check and the warp cutscene work from, so both line up with the
// arch the player can see.
function getGateVisualRect() {
  if (!currentGate) return null;

  const box = currentGate;
  const metrics = getGateArtMetrics();
  const print = metrics && metrics.footprint;
  if (!print || print.width <= 0 || print.height <= 0) {
    return { x: box.x, y: box.y, width: box.width, height: box.height, scale: 1 };
  }

  const scale = Math.min(box.width / print.width, box.height / print.height);
  const width = print.width * scale;
  const height = print.height * scale;

  return {
    x: box.x + (box.width - width) / 2,
    // Bottom-aligned to the gate box, whose bottom edge is GROUND_TOP. It is
    // the footprint that is aligned, so the pillars land on the ground and the
    // glow below them overhangs onto it.
    y: box.y + box.height - height,
    width,
    height,
    scale
  };
}

// The whole sprite, glow included, placed from the doorway rect. Drawn after
// the terrain, so the light pool under the arch falls across the ground.
function getGateDrawRect() {
  const doorway = getGateVisualRect();
  if (!doorway) return null;

  const metrics = getGateArtMetrics();
  if (!metrics) return doorway;

  const { art } = metrics;
  const scale = doorway.scale || (art.width > 0 ? doorway.width / art.width : 1);
  const width = art.width * scale;

  return {
    x: doorway.x + (doorway.width - width) / 2,
    y: doorway.y,
    width,
    height: art.height * scale
  };
}

// ---------------------------------------------------------------------------
// Exit-gate warp
//
// Touching the doorway used to snap straight to the level-complete card. Now
// the player is drawn into the portal — spiralling inward, shrinking, spinning
// and fading — while sparks are sucked into the arch. The portal then blooms
// and a veil of light wipes the screen; the end card is switched on behind the
// veil, which fades back out over it. Four phases, measured in 60fps frames:
//
//   pull    player + sparks spiral into the doorway
//   bloom   the portal flares
//   veilIn  light floods the screen (end card switched on at the end of this)
//   veilOut the light clears, revealing the card
// ---------------------------------------------------------------------------
const GATE_WARP_PHASES = { pull: 34, bloom: 10, veilIn: 12, veilOut: 22 };
const GATE_WARP_SPARK_COUNT = 28;

let gateWarp = null;
// Stays true from the moment the player disappears into the portal until the
// next level loads. Without it he pops back into view at full size inside the
// gate the instant the warp state is cleared, visible behind the end card.
let playerInsideGate = false;

function gateWarpPhaseAt(timer) {
  const { pull, bloom, veilIn, veilOut } = GATE_WARP_PHASES;
  if (timer < pull) return { name: "pull", t: timer / pull };
  if (timer < pull + bloom) return { name: "bloom", t: (timer - pull) / bloom };
  if (timer < pull + bloom + veilIn) {
    return { name: "veilIn", t: (timer - pull - bloom) / veilIn };
  }
  const done = pull + bloom + veilIn;
  return { name: "veilOut", t: Math.min(1, (timer - done) / veilOut) };
}

function beginGateWarp() {
  if (gateWarp || state !== STATES.PLAYING) return;

  const doorway = getGateVisualRect();
  if (!doorway) {
    // No gate art to warp into — keep the old immediate behaviour.
    completeLevel();
    return;
  }

  releaseMovementInput();
  player.dx = 0;
  player.dy = 0;
  player.isMovingHorizontally = false;
  player.state = "idle";

  gateWarp = {
    timer: 0,
    handedOff: false,
    // The portal's mouth, slightly above centre where the swirl art sits.
    center: {
      x: doorway.x + doorway.width / 2,
      y: doorway.y + doorway.height * 0.46
    },
    from: {
      x: player.x + player.width / 2,
      y: player.y + player.height / 2
    },
    doorway,
    sparks: Array.from({ length: GATE_WARP_SPARK_COUNT }, (_, i) => ({
      angle: (i / GATE_WARP_SPARK_COUNT) * Math.PI * 2 + Math.random() * 0.5,
      radius: 42 + Math.random() * 62,
      spin: 0.14 + Math.random() * 0.13,
      size: 1.4 + Math.random() * 2.6,
      warm: Math.random() < 0.45,
      delay: Math.random() * 7
    }))
  };
}

function updateGateWarp(delta) {
  if (!gateWarp) return;

  gateWarp.timer += delta;
  const phase = gateWarpPhaseAt(gateWarp.timer);

  if (phase.name === "pull") {
    // Accelerate into the portal, arcing up a little on the way in.
    const eased = phase.t * phase.t * (3 - 2 * phase.t);
    const lift = Math.sin(phase.t * Math.PI) * 26;
    const cx = gateWarp.from.x + (gateWarp.center.x - gateWarp.from.x) * eased;
    const cy = gateWarp.from.y + (gateWarp.center.y - gateWarp.from.y) * eased - lift;
    player.x = cx - player.width / 2;
    player.y = cy - player.height / 2;
    gateWarp.playerScale = 1 - 0.9 * eased;
    gateWarp.playerSpin = eased * Math.PI * 2.4;
    gateWarp.playerAlpha = 1 - Math.pow(phase.t, 2.4);
  } else {
    // Fully inside the portal from here on.
    player.x = gateWarp.center.x - player.width / 2;
    player.y = gateWarp.center.y - player.height / 2;
    gateWarp.playerScale = 0.1;
    gateWarp.playerSpin = Math.PI * 2.4;
    gateWarp.playerAlpha = 0;
    playerInsideGate = true;
  }

  // Switch the end card on under the veil, at its brightest.
  if (!gateWarp.handedOff && phase.name === "veilOut") {
    gateWarp.handedOff = true;
    completeLevel();
  }

  if (phase.name === "veilOut" && phase.t >= 1) {
    gateWarp = null;
  }
}

// Sparks + portal flare, drawn in world space over the player.
function drawGateWarp() {
  if (!gateWarp) return;

  const theme = getTheme();
  const phase = gateWarpPhaseAt(gateWarp.timer);
  const { x: cx, y: cy } = gateWarp.center;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  // Sparks spiral inward and wink out as they reach the mouth.
  if (phase.name === "pull" || phase.name === "bloom") {
    for (const spark of gateWarp.sparks) {
      const local = clamp(
        (gateWarp.timer - spark.delay) / GATE_WARP_PHASES.pull,
        0,
        1
      );
      if (local <= 0) continue;

      const angle = spark.angle + spark.spin * gateWarp.timer;
      const radius = spark.radius * (1 - local);
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius * 0.78;
      const alpha = (1 - local) * 0.85;
      const size = spark.size * (0.45 + (1 - local) * 0.55);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = spark.warm ? "#ffe9a8" : "#bff2ff";
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();

      // A short trail that follows the spiral back, so it curves with the
      // swirl instead of shooting off as a straight ray.
      ctx.globalAlpha = alpha * 0.35;
      ctx.lineWidth = size * 0.7;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.beginPath();
      ctx.moveTo(px, py);
      for (let step = 1; step <= 4; step += 1) {
        const backAngle = angle - spark.spin * step * 0.9;
        const backRadius = radius + step * 1.8;
        ctx.lineTo(
          cx + Math.cos(backAngle) * backRadius,
          cy + Math.sin(backAngle) * backRadius * 0.78
        );
      }
      ctx.stroke();
    }
  }

  // Portal flare: grows through the pull, peaks on the bloom.
  const flareT =
    phase.name === "pull" ? phase.t * 0.55
    : phase.name === "bloom" ? 0.55 + phase.t * 0.45
    : 1;
  const flareRadius = Math.max(gateWarp.doorway.width, gateWarp.doorway.height)
    * (0.35 + flareT * 0.95);
  const flareAlpha = phase.name === "pull" ? 0.25 + phase.t * 0.45
    : phase.name === "bloom" ? 0.7 + phase.t * 0.3
    : 0.9;

  const flare = ctx.createRadialGradient(cx, cy, 0, cx, cy, flareRadius);
  flare.addColorStop(0, `rgba(255, 255, 255, ${flareAlpha})`);
  flare.addColorStop(0.35, theme.gateGlow);
  flare.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.globalAlpha = 1;
  ctx.fillStyle = flare;
  ctx.beginPath();
  ctx.arc(cx, cy, flareRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Full-canvas veil, drawn last so it covers the HUD-free canvas entirely.
function drawGateWarpVeil() {
  if (!gateWarp) return;

  const phase = gateWarpPhaseAt(gateWarp.timer);
  let alpha = 0;
  if (phase.name === "bloom") alpha = phase.t * 0.25;
  else if (phase.name === "veilIn") alpha = 0.25 + phase.t * 0.75;
  else if (phase.name === "veilOut") alpha = 1 - phase.t;
  if (alpha <= 0) return;

  const theme = getTheme();
  const { x: cx, y: cy } = gateWarp.center;
  const reach = Math.hypot(CONFIG.width, CONFIG.height);

  const veil = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach * 0.75);
  veil.addColorStop(0, "rgba(255, 255, 255, 1)");
  veil.addColorStop(0.45, "rgba(255, 255, 255, 0.92)");
  veil.addColorStop(1, theme.gateGlow);

  ctx.save();
  ctx.globalAlpha = clamp(alpha, 0, 1);
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);
  ctx.restore();
}

function checkGateCollision() {
  if (state !== STATES.PLAYING || !currentGate) {
    return;
  }

  const playerHitbox = getPlayerHitbox();
  const doorway = getGateVisualRect();
  if (!doorway) return;

  // Inset from the visible doorway so the player has to step into the arch,
  // not merely brush its outer glow.
  const gateHitbox = {
    x: doorway.x + CONFIG.gateInset,
    y: doorway.y + 8,
    width: Math.max(24, doorway.width - CONFIG.gateInset * 2),
    height: Math.max(16, doorway.height - 8)
  };

  if (rectsOverlap(playerHitbox, gateHitbox)) {
    beginGateWarp();
  }
}

function isStompCollision(playerHitbox, enemyHitbox) {
  const playerBottom = playerHitbox.y + playerHitbox.height;
  const playerCenterY = playerHitbox.y + playerHitbox.height / 2;
  const feetLeft = playerHitbox.x + 6;
  const feetRight = playerHitbox.x + playerHitbox.width - 6;
  const feetOverlap = feetRight > enemyHitbox.x && feetLeft < enemyHitbox.x + enemyHitbox.width;
  const closeToTop = playerBottom <= enemyHitbox.y + CONFIG.stompWindow;

  return (
    player.dy > CONFIG.stompMinFallSpeed &&
    playerCenterY < enemyHitbox.y &&
    feetOverlap &&
    closeToTop
  );
}

function stompEnemy(enemy, enemyHitbox) {
  enemy.isDead = true;
  enemy.remove = true;
  player.y = Math.min(player.y, enemyHitbox.y - player.height);
  player.dy = CONFIG.stompBounceVelocity;
  player.grounded = false;
  world.score += CONFIG.stompScore;
  world.enemiesDefeated = (world.enemiesDefeated || 0) + 1;
  spawnEffect("damage", enemy.x - 6, enemy.y - 10);
  safePlay(sounds.enemyKill, "enemyKill");
}

function stompPlant(plant, plantHitbox) {
  plant.active = false;
  plant.remove = true;
  player.y = Math.min(player.y, plantHitbox.y - player.height);
  player.dy = CONFIG.stompBounceVelocity;
  player.grounded = false;
  world.score += CONFIG.plantScore;
  world.enemiesDefeated = (world.enemiesDefeated || 0) + 1;
  spawnEffect("hit", plant.x - 2, plant.y - 8);
  safePlay(sounds.enemyKill, "enemyKill");
}

function getEnemyHitbox(enemy) {
  return {
    x: enemy.x + 4,
    y: enemy.y + 4,
    width: Math.max(12, enemy.width - 8),
    height: Math.max(12, enemy.height - 8)
  };
}

function getPlantHitbox(plant) {
  return {
    x: plant.x + 6,
    y: plant.y + 6,
    width: Math.max(16, plant.width - 12),
    height: Math.max(18, plant.height - 12)
  };
}

// One touch from an enemy or a plant ends the run. The old multi-hit branch
// (hit points + invulnerability flicker) was unreachable: hitPoints was always
// 1 and every caller asked for an instant loss.
function applyPlayerDamage() {
  spawnEffect("damage", player.x - 2, player.y - 2);
  gameOver();
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Drawing functions
// ---------- Moving cloud system (upper sky only) ----------
const CLOUD_COUNT = 7;
// Target cloud widths in canvas pixels (canvas is 960 wide) — chunky sky clouds
// that are wide enough to actually drift across the sun and cover it.
const CLOUD_MIN_WIDTH = 96;
const CLOUD_MAX_WIDTH = 190;
const CLOUD_MIN_SPEED = 0.16; // bigger clouds drift slower
const CLOUD_MAX_SPEED = 0.42; // smaller clouds drift faster
// Sky band the clouds live in — deep enough that their path crosses the sun.
const SKY_BAND_TOP = 4;
const SKY_BAND_BOTTOM = Math.round(GROUND_TOP * 0.58);
let clouds = [];
let cloudsInitialized = false;
// Screen rect of the sun for the current frame, so clouds can shade it.
let sunScreenRect = null;

function initClouds() {
  clouds = [];
  const skyBottom = SKY_BAND_BOTTOM; // keep clouds well above ground
  const skyTop = SKY_BAND_TOP;

  for (let i = 0; i < CLOUD_COUNT; i += 1) {
    const cloud = makeCloud(skyTop, skyBottom);
    // Spread the initial batch across the visible width instead of queuing off-screen.
    cloud.x = Math.round(((i + 0.5) / CLOUD_COUNT) * CONFIG.width - cloud.width / 2 + randomInRange(-40, 40));
    clouds.push(cloud);
  }
  cloudsInitialized = true;
}

function makeCloud(skyTop, skyBottom) {
  const cloudImg = assets.cloud;
  // Aspect of the painted cloud, ignoring the transparent margin in the file.
  const aspect = cloudImg ? 1 / getTrimmedAspect(cloudImg, SPRITE_TRIM.cloud) : 0.5;

  const width = Math.round(randomInRange(CLOUD_MIN_WIDTH, CLOUD_MAX_WIDTH));
  const height = Math.round(width * aspect);
  const speed = mapRange(width, CLOUD_MIN_WIDTH, CLOUD_MAX_WIDTH, CLOUD_MAX_SPEED, CLOUD_MIN_SPEED);

  const top = skyTop ?? SKY_BAND_TOP;
  const bottom = (skyBottom ?? SKY_BAND_BOTTOM) - height;
  const y = Math.round(randomInRange(top, Math.max(top + 1, bottom)));
  const alpha = randomInRange(0.75, 0.95);
  return {
    x: CONFIG.width + Math.round(randomInRange(20, 160)),
    y,
    width,
    height,
    speed,
    alpha
  };
}

function updateClouds(delta) {
  if (!assets.cloud) return;
  if (!cloudsInitialized) initClouds();

  const skyBottom = SKY_BAND_BOTTOM;
  const skyTop = SKY_BAND_TOP;

  for (const cloud of clouds) {
    cloud.x -= cloud.speed * delta;
    if (cloud.x + cloud.width < -20) {
      const fresh = makeCloud(skyTop, skyBottom);
      cloud.x = fresh.x;
      cloud.y = fresh.y;
      cloud.width = fresh.width;
      cloud.height = fresh.height;
      cloud.speed = fresh.speed;
      cloud.alpha = fresh.alpha;
    }
  }
}

function drawClouds() {
  const cloudImg = assets.cloud;
  if (!cloudImg || clouds.length === 0) return;

  const trim = getTrimRect(cloudImg, SPRITE_TRIM.cloud);

  for (const cloud of clouds) {
    ctx.save();
    ctx.globalAlpha = cloud.alpha;
    ctx.drawImage(
      cloudImg,
      trim.sx,
      trim.sy,
      trim.sw,
      trim.sh,
      Math.round(cloud.x),
      Math.round(cloud.y),
      cloud.width,
      cloud.height
    );
    ctx.restore();
  }
}

// How much of the sun's disc the clouds currently cover (0 = clear, 1 = buried).
function getSunCoverage() {
  if (!sunScreenRect || clouds.length === 0) return 0;

  const sun = sunScreenRect;
  const sunArea = Math.max(1, sun.width * sun.height);
  let covered = 0;

  for (const cloud of clouds) {
    const overlapW = Math.min(sun.x + sun.width, cloud.x + cloud.width) - Math.max(sun.x, cloud.x);
    const overlapH = Math.min(sun.y + sun.height, cloud.y + cloud.height) - Math.max(sun.y, cloud.y);
    if (overlapW <= 0 || overlapH <= 0) continue;
    // The cloud sprite is not a solid rectangle, so only count part of the box.
    covered += (overlapW * overlapH) / sunArea * 0.85 * cloud.alpha;
  }

  return Math.min(1, covered);
}

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

function drawBackground() {
  const background = assets.background;
  // The preload watchdog can start a run before the art resolves; a missing
  // background must leave the sky empty, not throw on every frame.
  if (!background || !background.height) {
    return;
  }

  const scale = CONFIG.height / background.height;
  // Use an integer tile width and integer step so adjacent tiles butt up
  // exactly on the same pixel column — no subpixel seams / edge artifacts.
  const tileWidth = Math.max(1, Math.ceil(background.width * scale));
  const offset = ((world.backgroundOffset % tileWidth) + tileWidth) % tileWidth;
  const startX = -Math.round(offset) - tileWidth;

  for (let x = startX; x < CONFIG.width + tileWidth; x += tileWidth) {
    ctx.drawImage(background, x, 0, tileWidth, CONFIG.height);
  }
}

function drawParallax(layers = [0, 1, 2]) {
  // Clip parallax to the sky area PLUS a "root zone" strip inside every
  // ground segment. Trees stay planted where the ground exists, but never
  // hang in mid-air over holes or beside raised platforms.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, CONFIG.width, GROUND_TOP);
  const rootDepth = TILE_HEIGHT; // let trunks reach into the ground tile
  for (const segment of terrainSegments) {
    if (segment.x + segment.width < 0 || segment.x > CONFIG.width) continue;
    // Only natural ground segments (top at GROUND_TOP) act as planting soil.
    if (Math.abs(segment.y - GROUND_TOP) > 4) continue;
    ctx.rect(segment.x, segment.y, segment.width, rootDepth);
  }
  ctx.clip();

  for (const layer of layers) {
    for (const decoration of decorations) {
      if (decoration.layer !== layer) {
        continue;
      }

      const image = getBackgroundDecorationImage(decoration.type);
      if (!image) {
        continue;
      }

      const screenX = getDecorationScreenX(decoration);
      if (screenX + decoration.width < -260 || screenX > CONFIG.width + 260) {
        continue;
      }

      ctx.save();
      let alpha = decoration.alpha ?? 1;
      if (decoration.type === "sun") {
        sunScreenRect = {
          x: screenX,
          y: decoration.y,
          width: decoration.width,
          height: decoration.height
        };
        // Sunlight fades as cloud cover slides in front of it.
        alpha *= 1 - 0.55 * getSunCoverage();
      }
      ctx.globalAlpha = alpha;
      if (decoration.type === "sun") {
        const trim = getTrimRect(image, SPRITE_TRIM.sun);
        ctx.drawImage(
          image,
          trim.sx,
          trim.sy,
          trim.sw,
          trim.sh,
          Math.round(screenX),
          Math.round(decoration.y),
          Math.round(decoration.width),
          Math.round(decoration.height)
        );
      } else {
        ctx.drawImage(
          image,
          Math.round(screenX),
          Math.round(decoration.y),
          Math.round(decoration.width),
          Math.round(decoration.height)
        );
      }
      ctx.restore();
    }
  }

  ctx.restore();
}

function getDecorationScreenX(decoration) {
  if (decoration.type === "sun") {
    return decoration.anchorX - world.offsetX * decoration.parallax;
  }

  return decoration.worldX - world.offsetX * decoration.parallax;
}

function getBackgroundDecorationImage(type) {
  if (type === "sun") {
    return assets.sunDecor;
  }

  if (type === "mountain") {
    return assets.mountainDecor;
  }

  if (type === "tree") {
    return assets.treeDecor;
  }

  return null;
}

// Terrain is painted in two layers around the entities.
//
// `oneWay` picks which half: false for the solid ground, which goes behind
// everything, and true for the floating platforms, which go in front. Now that
// every face is solid the character can barely reach a tile at all, but a few
// pixels of hair still graze an underside or an outside corner, because
// collision works from the hitbox while the sprite's head sits 6.6px above it.
// Painting the platforms last tucks those slivers behind the tile rather than
// letting them show on top of it. verify/layering.mjs holds the residue to a
// few px² and asserts this ordering.
function drawTerrain(oneWay) {
  if (!assets.path) {
    return;
  }

  for (const segment of terrainSegments) {
    if (isFloatingPlatform(segment) !== oneWay) {
      continue;
    }

    const tileCount = Math.ceil(segment.width / TILE_WIDTH);

    for (let i = 0; i < tileCount; i += 1) {
      const tileX = segment.x + i * TILE_WIDTH;
      ctx.drawImage(
        assets.path,
        groundTileSource.x,
        groundTileSource.y,
        groundTileSource.width,
        groundTileSource.height,
        Math.round(tileX),
        Math.round(segment.y),
        TILE_WIDTH,
        TILE_HEIGHT
      );
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fillRect(Math.round(segment.x), Math.round(segment.y), Math.round(segment.width), 4);

    ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
    ctx.fillRect(
      Math.round(segment.x),
      Math.round(segment.y + TILE_HEIGHT - 6),
      Math.round(segment.width),
      8
    );
  }
}

function drawGate() {
  if (!currentGate) {
    return;
  }

  const theme = getTheme();
  const pulse = 0.72 + Math.sin(performance.now() * 0.008) * 0.18;
  const doorX = currentGate.x;
  const doorY = currentGate.y;
  const doorWidth = currentGate.width;
  const doorHeight = currentGate.height;

  // If the exit-gate art loaded, draw its measured art (not the padded bitmap)
  // filling the gate box, with a soft pulsing glow behind it. The doorway rect
  // is what stands on the ground; the drawn rect adds the sprite's own light
  // pool, which hangs below it over the grass.
  const metrics = getGateArtMetrics();
  const doorway = getGateVisualRect();
  const rect = getGateDrawRect();
  if (assets.exitGate && metrics && doorway && rect) {
    ctx.save();

    // Centred on the doorway, not the drawn art, so the halo does not drift
    // downwards with the overhanging glow.
    const cx = doorway.x + doorway.width / 2;
    const cy = doorway.y + doorway.height / 2;
    const glowRadius = Math.max(doorway.width, doorway.height) * (0.75 + pulse * 0.12);
    const glow = ctx.createRadialGradient(cx, cy, glowRadius * 0.25, cx, cy, glowRadius);
    glow.addColorStop(0, theme.gateGlow);
    glow.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(cx - glowRadius, cy - glowRadius, glowRadius * 2, glowRadius * 2);

    ctx.drawImage(
      assets.exitGate,
      metrics.art.x,
      metrics.art.y,
      metrics.art.width,
      metrics.art.height,
      Math.round(rect.x),
      Math.round(rect.y),
      Math.round(rect.width),
      Math.round(rect.height)
    );

    ctx.restore();
    return;
  }

  // Fallback: procedural rounded doorway (used only when the asset is missing).
  ctx.save();
  ctx.shadowColor = theme.gateGlow;
  ctx.shadowBlur = 18;
  ctx.fillStyle = theme.gateFrame;
  fillRoundRect(doorX, doorY, doorWidth, doorHeight, 14);

  ctx.shadowBlur = 0;
  ctx.fillStyle = theme.gateInner;
  fillRoundRect(doorX + 12, doorY + 12, doorWidth - 24, doorHeight - 18, 10);

  ctx.fillStyle = `rgba(255, 255, 255, ${0.18 + pulse * 0.28})`;
  fillRoundRect(doorX + 20, doorY + 20, doorWidth - 40, doorHeight - 34, 8);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px 'Lucida Console', 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("EXIT", doorX + doorWidth / 2, doorY + 24);

  ctx.restore();
}

function drawCoins() {
  for (const coin of coins) {
    drawAnimatedSprite(assets.coin, coinFrames, coin.frameIndex, coin.x, coin.y, coin.width, coin.height);
  }
}

function drawSeedPickups() {
  for (const pickup of seedPickups) {
    drawAnimatedSprite(
      assets.seedPickup,
      seedPickupFrames,
      pickup.frameIndex,
      pickup.x,
      pickup.y,
      pickup.width,
      pickup.height
    );
  }
}

function drawEnemies() {
  drawPlants();

  for (const enemy of enemies) {
    if (enemy.remove) {
      continue;
    }

    drawEnemy(enemy);
  }
}

function drawEnemy(enemy) {
  const image = enemy.type === "flying" ? assets.flyingEnemy : assets.groundEnemy;
  const frames = getEnemyFrames(enemy);
  const frame = frames[Math.min(enemy.frameIndex, frames.length - 1)] || frames[0];
  if (!frame) {
    return;
  }

  ctx.save();
  if (enemy.direction < 0) {
    const flipCenterX = Math.round(enemy.x + enemy.width / 2);
    ctx.translate(flipCenterX, 0);
    ctx.scale(-1, 1);
    ctx.translate(-flipCenterX, 0);
  }

  drawFrame(image, frame, enemy.x, enemy.y, enemy.width, enemy.height);
  ctx.restore();
}

function drawPlants() {
  for (const plant of plants) {
    if (!plant.active || plant.remove) {
      continue;
    }

    const animatedFrame = plantFrames[Math.min(plant.frameIndex, plantFrames.length - 1)] || plantFrames[0];
    const baseFrame = plantFrames[0];
    if (!animatedFrame || !baseFrame) {
      continue;
    }

    const headRatio = 0.58;
    const headSourceHeight = Math.round(animatedFrame.height * headRatio);
    const stemSourceHeight = animatedFrame.height - headSourceHeight;
    const headDrawHeight = Math.round(plant.height * headRatio);
    const stemDrawHeight = plant.height - headDrawHeight;

    ctx.drawImage(
      assets.plant,
      baseFrame.x,
      baseFrame.y + headSourceHeight,
      baseFrame.width,
      stemSourceHeight,
      Math.round(plant.baseX),
      Math.round(plant.baseY + headDrawHeight),
      Math.round(plant.width),
      Math.round(stemDrawHeight)
    );

    ctx.drawImage(
      assets.plant,
      animatedFrame.x,
      animatedFrame.y,
      animatedFrame.width,
      headSourceHeight,
      Math.round(plant.baseX + plant.headOffsetX),
      Math.round(plant.baseY + plant.headOffsetY),
      Math.round(plant.width),
      Math.round(headDrawHeight)
    );
  }
}

function drawProjectiles() {
  for (const projectile of projectiles) {
    const frame = seedProjectileFrames[Math.min(projectile.frameIndex, seedProjectileFrames.length - 1)] || seedProjectileFrames[0];
    if (!frame) {
      continue;
    }

    ctx.save();
    if (!projectile.facingRight) {
      const flipCenterX = Math.round(projectile.x + projectile.width / 2);
      ctx.translate(flipCenterX, 0);
      ctx.scale(-1, 1);
      ctx.translate(-flipCenterX, 0);
    }

    drawFrame(
      assets.animatedSeed,
      frame,
      projectile.x,
      projectile.y,
      projectile.width,
      projectile.height
    );
    ctx.restore();
  }
}

function drawPlayer() {
  // He is inside the portal — nothing to draw until the next level loads.
  if (playerInsideGate) return;

  const sequence = playerAnimations[player.state] || playerAnimations.idle;
  const frameIndex = sequence[Math.min(player.animationFrame, sequence.length - 1)] ?? 0;
  const frame = playerFrames[frameIndex] || playerFrames[0];
  if (!assets.character || !frame) {
    return;
  }

  const scale = Math.min(player.width / frame.width, player.height / frame.height);
  const drawWidth = frame.width * scale;
  const drawHeight = frame.height * scale;
  const drawX = player.x + (player.width - drawWidth) / 2;
  const drawY = player.y + player.height - drawHeight;

  ctx.save();
  // Being pulled into the exit gate: spin down to nothing around the sprite's
  // own centre.
  if (gateWarp) {
    if (gateWarp.playerAlpha <= 0.01) {
      ctx.restore();
      return;
    }
    const spinX = drawX + drawWidth / 2;
    const spinY = drawY + drawHeight / 2;
    ctx.globalAlpha *= clamp(gateWarp.playerAlpha, 0, 1);
    ctx.translate(spinX, spinY);
    ctx.rotate(gateWarp.playerSpin || 0);
    ctx.scale(gateWarp.playerScale || 1, gateWarp.playerScale || 1);
    ctx.translate(-spinX, -spinY);
  }

  if (!player.facingRight) {
    const flipCenterX = Math.round(drawX + drawWidth / 2);
    ctx.translate(flipCenterX, 0);
    ctx.scale(-1, 1);
    ctx.translate(-flipCenterX, 0);
  }

  ctx.drawImage(
    assets.character,
    frame.x,
    frame.y,
    frame.width,
    frame.height,
    Math.round(drawX),
    Math.round(drawY),
    Math.round(drawWidth),
    Math.round(drawHeight)
  );
  ctx.restore();
}

function drawEffects() {
  for (const effect of effects) {
    const frame = effect.frames[Math.min(effect.frameIndex, effect.frames.length - 1)];
    if (!frame) {
      continue;
    }

    drawFrame(effect.image, frame, effect.x, effect.y, effect.width, effect.height);
  }
}

function drawPlayerShadow() {
  const groundY = getGroundUnderPlayer();
  if (groundY === null && !player.grounded) {
    return;
  }

  const shadowCenterX = player.x + player.width / 2;
  const shadowCenterY = (groundY ?? GROUND_TOP) + 14;
  const squash = player.grounded ? 1 : 0.78;

  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "#120a06";
  ctx.beginPath();
  ctx.ellipse(shadowCenterX, shadowCenterY, 26 * squash, 10 * squash, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLevelStartBanner() {
  if (levelStartBannerTimer <= 0 || !levelStartBannerTitle) return;
  if (state !== STATES.PLAYING) return;

  // Ease-in for the first ~15 frames, hold, ease-out for the last ~30 frames.
  const total = LEVEL_START_BANNER_DURATION;
  const elapsed = total - levelStartBannerTimer;
  let alpha = 1;
  if (elapsed < 15) alpha = elapsed / 15;
  else if (levelStartBannerTimer < 30) alpha = levelStartBannerTimer / 30;

  const panelWidth = 360;
  const panelHeight = 108;
  const x = (CONFIG.width - panelWidth) / 2;
  const y = 60;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

  // Card
  ctx.fillStyle = "rgba(6, 20, 40, 0.75)";
  fillRoundRect(x, y, panelWidth, panelHeight, 22);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  strokeRoundRect(x, y, panelWidth, panelHeight, 22);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#ffd86f";
  ctx.font = "bold 22px 'Lilita One', 'Lucida Console', sans-serif";
  ctx.fillText(levelStartBannerTitle, CONFIG.width / 2, y + 38);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px 'Lilita One', 'Lucida Console', sans-serif";
  ctx.fillText(levelStartBannerSubtitle, CONFIG.width / 2, y + 74);

  ctx.restore();
}

// Last value written to each HUD node, so a frame that changes nothing writes
// nothing. `muted` starts undefined so the first pass always syncs.
const hudCache = {
  score: null,
  seeds: null,
  level: null,
  progress: null,
  muted: undefined,
  armed: undefined
};

function setText(element, cacheKey, value) {
  if (!element || hudCache[cacheKey] === value) return;
  hudCache[cacheKey] = value;
  element.textContent = value;
}

function updateHUD(force = false) {
  const targetScore = Math.max(0, world.score);
  const targetSeeds = player.seeds;
  const targetCoins = world.coins || 0;

  if (force) {
    uiState.displayedScore = targetScore;
    uiState.displayedSeeds = targetSeeds;
    uiState.lastSeedCount = targetSeeds;
    uiState.lastCoinCount = targetCoins;
  } else {
    uiState.displayedScore += (targetScore - uiState.displayedScore) * 0.18;
    if (Math.abs(targetScore - uiState.displayedScore) < 0.35) {
      uiState.displayedScore = targetScore;
    }

    uiState.displayedSeeds = targetSeeds;
    if (targetSeeds !== uiState.lastSeedCount) {
      triggerHudPop(seedDisplay);
      uiState.lastSeedCount = targetSeeds;
    }

    if (targetCoins !== (uiState.lastCoinCount ?? targetCoins)) {
      triggerHudPop(scoreDisplay);
      uiState.lastCoinCount = targetCoins;
    }
  }

  // updateHUD() runs once per rendered frame, and on most frames nothing has
  // changed. Writing textContent / style / attributes anyway forced a style
  // recalculation 60 times a second, which is real work on a cheap phone.
  // Every write below is now gated on the value actually differing.
  setText(scoreValue, "score", formatScore(uiState.displayedScore));
  setText(seedValue, "seeds", String(uiState.displayedSeeds).padStart(2, "0"));
  setText(levelLabel, "level", `LEVEL ${currentLevelIndex + 1}`);

  if (levelProgress) {
    const worldWidth = currentLevel?.worldWidth || 1;
    const maxOffset = Math.max(1, worldWidth - canvas.width);
    const clamped = Math.max(0, Math.min(1, world.offsetX / maxOffset));
    // Round to whole percent: sub-pixel churn is invisible but still costs a layout.
    const percent = Math.round(clamped * 100);
    if (percent !== hudCache.progress) {
      hudCache.progress = percent;
      levelProgress.style.width = `${percent}%`;
    }
  }

  if (isMuted !== hudCache.muted) {
    hudCache.muted = isMuted;
    const label = isMuted ? "Turn sound on" : "Turn sound off";
    if (soundDisplay) {
      soundDisplay.classList.toggle("is-muted", isMuted);
      soundDisplay.setAttribute("aria-label", label);
    }
    if (startSoundToggle) {
      startSoundToggle.classList.toggle("is-muted", isMuted);
      startSoundToggle.setAttribute("aria-label", label);
    }
  }

  updateFireButtonState();
}

function drawAnimatedSprite(image, frames, frameIndex, x, y, width, height) {
  const frame = frames[Math.min(frameIndex, frames.length - 1)] || frames[0];
  if (!frame) {
    return;
  }

  drawFrame(image, frame, x, y, width, height);
}

function drawFrame(image, frame, x, y, width, height) {
  if (!image) {
    return;
  }

  ctx.drawImage(
    image,
    frame.x,
    frame.y,
    frame.width,
    frame.height,
    Math.round(x),
    Math.round(y),
    Math.round(width),
    Math.round(height)
  );
}

function getEnemyFrames(enemy) {
  return enemy.type === "flying" ? flyingEnemyFrames : groundEnemyFrames;
}

function drawLoadingMessage(message) {
  ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);
  ctx.fillStyle = "#1d2c47";
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px 'Lucida Console', 'Courier New', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(message, CONFIG.width / 2, CONFIG.height / 2);
}

function fillRoundRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function strokeRoundRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.stroke();
}

function render() {
  ctx.clearRect(0, 0, CONFIG.width, CONFIG.height);
  drawBackground();
  drawParallax([0]);
  drawClouds();
  drawParallax([1, 2]);
  drawTerrain(false); // solid ground, behind the entities
  drawGate();
  drawCoins();
  drawSeedPickups();
  drawEnemies();
  drawProjectiles();
  drawPlayer();
  drawTerrain(true); // jump-through platforms, in front of whatever passes through them
  // Drawn after the platform layer so a contact shadow on a deck is not buried
  // by it. The ellipse sits entirely below the feet, so it never covers the
  // player himself. No shadow once he lifts off into the portal.
  if (!gateWarp && !playerInsideGate) drawPlayerShadow();
  drawEffects();
  drawGateWarp();
  drawLevelStartBanner();
  drawGateWarpVeil();
  updateHUD();
}

// UI helpers
function setLayerVisibility(element, isVisible) {
  const existingTimer = uiState.hideTimers.get(element);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  if (isVisible) {
    element.hidden = false;
    requestAnimationFrame(() => {
      element.classList.remove("hidden");
      element.classList.add("visible");
      element.classList.add("is-visible");
    });
    return;
  }

  element.classList.remove("visible");
  element.classList.add("hidden");
  element.classList.remove("is-visible");
  const timerId = window.setTimeout(() => {
    if (!element.classList.contains("is-visible")) {
      element.hidden = true;
    }
  }, UI_ANIMATION_DURATION);
  uiState.hideTimers.set(element, timerId);
}

function showStartUI() {
  setLayerVisibility(startOverlay, true);
}

function hideStartUI() {
  setLayerVisibility(startOverlay, false);
}

function showGameOverUI() {
  setLayerVisibility(gameOverOverlay, true);
}

function hideGameOverUI() {
  setLayerVisibility(gameOverOverlay, false);
}

function showPauseUI() {
  if (!pauseOverlay) return;
  setLayerVisibility(pauseOverlay, true);
}

function hidePauseUI() {
  if (!pauseOverlay) return;
  setLayerVisibility(pauseOverlay, false);
}

function showLoadingScreen() {
  setLayerVisibility(loadingOverlay, true);
}

function hideLoadingScreen() {
  setLayerVisibility(loadingOverlay, false);
}

function updateFireButtonState() {
  // Called from updateHUD(), so this runs once per rendered frame; the class is
  // only touched when the armed state actually flips.
  const hasAmmo = state === STATES.PLAYING && player.seeds > 0;
  if (hasAmmo === hudCache.armed) return;
  hudCache.armed = hasAmmo;
  fireControl.classList.toggle("is-armed", hasAmmo);
}

function updateUI() {
  if (state === STATES.LOADING) {
    showLoadingScreen();
  } else {
    hideLoadingScreen();
  }

  if (state === STATES.START) {
    showStartUI();
  } else {
    hideStartUI();
  }

  if (state === STATES.LOBBY) {
    showLobbyUI();
  } else {
    hideLobbyUI();
  }

  const showEndOverlay =
    state === STATES.GAMEOVER ||
    state === STATES.WIN ||
    state === STATES.LEVEL_COMPLETE;
  if (showEndOverlay) {
    showGameOverUI();
  } else {
    hideGameOverUI();
  }

  if (state === STATES.PAUSED) {
    showPauseUI();
  } else {
    hidePauseUI();
  }

  const showHud =
    state === STATES.PLAYING ||
    state === STATES.PAUSED ||
    state === STATES.LEVEL_COMPLETE ||
    state === STATES.GAMEOVER ||
    state === STATES.WIN;
  const showMobileControls = state === STATES.PLAYING;
  const hudInteractive = state === STATES.PLAYING || state === STATES.PAUSED;

  setLayerVisibility(hud, showHud);
  hud.classList.toggle("is-inactive", !hudInteractive);
  setLayerVisibility(mobileControls, showMobileControls);
  updateFireButtonState();
  updateOrientationLock();
}

// Fullscreen: the game jumps to fullscreen on the player's first tap/click.
// Once the player leaves fullscreen themselves (Esc / system gesture) we stop
// asking, so taps never fight the choice they just made.
let autoFullscreenAllowed = true;

function isFullscreen() {
  return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
}

// Switching apps or tabs stops rAF; coming back used to drop the player
// straight into live gameplay, often mid-jump next to an enemy. Pause instead
// and let them restart from the pause card.
function handleVisibilityChange() {
  if (document.hidden) {
    releaseMovementInput();
    if (state === STATES.PLAYING) {
      pauseGame();
    }
    return;
  }
  // Start the clock fresh so the backlog does not fast-forward the simulation.
  lastFrameTime = 0;
  stepAccumulator = 0;
}

function handleFullscreenChange() {
  if (!isFullscreen()) {
    autoFullscreenAllowed = false;
  }
  resizeGame();
}

function requestGameFullscreen() {
  if (!autoFullscreenAllowed || isFullscreen()) return;

  const target = document.documentElement;
  const request =
    target.requestFullscreen ||
    target.webkitRequestFullscreen ||
    target.webkitRequestFullScreen;

  if (!request) return;

  try {
    const result = request.call(target, { navigationUI: "hide" });
    if (result && typeof result.catch === "function") {
      // Blocked (iframe without permission, iOS Safari, user gesture lost) — keep playing windowed.
      result.then(lockLandscape).catch(() => {});
    } else {
      lockLandscape();
    }
  } catch (error) {
    /* Fullscreen unavailable — the game still fills the viewport. */
  }
}

function lockLandscape() {
  const orientation = window.screen?.orientation;
  if (!orientation || typeof orientation.lock !== "function") return;
  try {
    const result = orientation.lock("landscape");
    if (result && typeof result.catch === "function") result.catch(() => {});
  } catch (error) {
    /* Desktop browsers reject orientation locks — harmless. */
  }
}

function updateOrientationLock() {
  if (!rotateScreen) return;
  // Any device held in portrait (phone or tablet) gets the rotate prompt.
  // The 480 floor avoids nagging on very small dev windows that happen to be taller than wide.
  const isPortrait = window.innerHeight > window.innerWidth && window.innerHeight > 480;
  rotateScreen.classList.toggle("is-visible", isPortrait);
  rotateScreen.setAttribute("aria-hidden", isPortrait ? "false" : "true");

  // The prompt covers the canvas, so the level must not keep running behind it —
  // enemies used to patrol on while the player could not see or reach anything.
  // pauseGame() no-ops unless we are actually playing, so this cannot recurse
  // through the updateUI() call it makes.
  if (isPortrait && state === STATES.PLAYING) {
    pauseGame();
  }
}

function formatScore(value) {
  return Math.floor(value).toString().padStart(4, "0");
}

function readBestScore() {
  try {
    const savedScore = Number(localStorage.getItem(CONFIG.bestScoreKey));
    return Number.isFinite(savedScore) && savedScore > 0 ? savedScore : 0;
  } catch (error) {
    console.warn("Could not read best score from localStorage.", error);
    return 0;
  }
}

function readHighestUnlockedLevel() {
  try {
    const raw = Number(localStorage.getItem(CONFIG.highestUnlockedKey));
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  } catch (error) {
    return 1;
  }
}

function writeHighestUnlockedLevel(levelNumber) {
  try {
    const current = readHighestUnlockedLevel();
    if (levelNumber > current) {
      localStorage.setItem(CONFIG.highestUnlockedKey, String(levelNumber));
    }
  } catch (error) {
    /* ignore */
  }
}

function writeBestScore(score) {
  try {
    localStorage.setItem(CONFIG.bestScoreKey, String(score));
  } catch (error) {
    console.warn("Could not save best score to localStorage.", error);
  }
}

// Utility helpers
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Main game loop
// ---------------------------------------------------------------------------
// Fixed timestep
//
// The simulation used to advance by however long the last frame took, so a
// phone running at 40fps got a measurably lower jump than one at 60 (133px of
// rise at 60fps, 126px at 30) and level geometry tuned near the top of the arc
// became unreachable. Everything below runs in whole 1/60s ticks instead, and
// the renderer simply draws whatever the last tick produced — jump height and
// run speed are now identical at 30, 48, 60 and 120fps.
// ---------------------------------------------------------------------------
const FIXED_STEP_MS = 1000 / 60;
const MAX_CATCHUP_STEPS = 5; // a long stall slows time down rather than teleporting
let stepAccumulator = 0;

// One simulation tick. `delta` is always exactly 1 here; the parameter is kept
// so the update functions stay usable (and testable) at other step sizes.
function stepGame(delta) {
  if (gateWarp && state !== STATES.PAUSED) {
    // Warp cutscene: no physics, no enemies, no collisions — just the effect.
    updateGateWarp(delta);
    updatePlayerAnimation(delta);
    updateEffects(delta);
  } else if (state === STATES.PLAYING) {
    updatePlayer(delta);

    if (state === STATES.PLAYING) {
      updateEnemies(delta);
      updateCoins(delta);
      updateSeedPickups(delta);
      updateProjectiles(delta);
      handleCollisions();
    }

    updateEffects(delta);
  } else {
    updatePlayerAnimation(delta);
    updateEffects(delta);
  }

  updateClouds(delta);
  if (state === STATES.PLAYING && levelStartBannerTimer > 0) {
    levelStartBannerTimer -= delta;
  }
}

function gameLoop(timestamp) {
  // Math.max guards a backwards timestamp (a stale rAF argument after a resume
  // would otherwise push the accumulator negative and freeze the simulation
  // for several seconds while it climbed back).
  const elapsed = lastFrameTime ? Math.max(0, timestamp - lastFrameTime) : FIXED_STEP_MS;
  lastFrameTime = timestamp;

  // Tab was backgrounded, or the device hitched: drop the backlog instead of
  // fast-forwarding the player through it.
  stepAccumulator = Math.min(
    stepAccumulator + elapsed,
    FIXED_STEP_MS * MAX_CATCHUP_STEPS
  );

  let steps = 0;
  while (stepAccumulator >= FIXED_STEP_MS && steps < MAX_CATCHUP_STEPS) {
    stepGame(1);
    stepAccumulator -= FIXED_STEP_MS;
    steps += 1;
  }

  render();
  requestAnimationFrame(gameLoop);
}

// Gate state for the start screen. `assetsReady` also gates startGame(), and
// `pendingStartRequest` replays a start that arrived while we were still
// loading (keyboard, or any programmatic call).
let assetsReady = false;
let startScreenRevealed = false;
let pendingStartRequest = null;

// Idempotent: whichever of the three paths gets here first wins, the rest
// are no-ops.
function revealStartScreen(reason) {
  if (startScreenRevealed) return;
  startScreenRevealed = true;
  assetsReady = true;
  console.log(`[Start ready] revealed via ${reason}`);

  resetGame();
  resizeGame();

  const loadingBarFill = document.getElementById("loadingBarFill");
  if (loadingBarFill) loadingBarFill.style.width = "100%";
  if (loadingText) loadingText.textContent = "100%";

  lastFrameTime = performance.now();
  requestAnimationFrame(gameLoop);

  // Let the filled bar register before the start screen takes over.
  window.setTimeout(() => {
    state = STATES.START;
    updateUI();

    window.setTimeout(() => {
      if (startButton) {
        startButton.classList.remove("is-popping");
        void startButton.offsetWidth;
        startButton.classList.remove("is-locked");
        startButton.classList.add("is-popping");
        window.setTimeout(() => startButton.classList.remove("is-popping"), 700);
      }

      // Replay a start that was requested before the assets were ready.
      if (pendingStartRequest) {
        const { openWithJump, startLevelIndex = 0 } = pendingStartRequest;
        pendingStartRequest = null;
        startGame(openWithJump, startLevelIndex);
      }
    }, 260);
  }, 260);
}

// Initialization
function initialize() {
  setupUI();
  bindEvents();
  resizeGame();
  updateUI();
  drawLoadingMessage("Loading...");

  // Three independent paths reach revealStartScreen(), so the player can
  // never be stranded staring at a loading bar:
  //   1. the preload resolving normally
  //   2. the preload rejecting outright
  //   3. a watchdog, in case a transfer neither resolves nor rejects
  const watchdog = window.setTimeout(
    () => revealStartScreen("watchdog"),
    PRELOAD_WATCHDOG_MS
  );

  loadAssets()
    .then(() => {
      window.clearTimeout(watchdog);
      revealStartScreen("preload");
    })
    .catch((error) => {
      window.clearTimeout(watchdog);
      console.error("Asset preload failed; starting anyway.", error);
      revealStartScreen("error");
    });
}

initialize();
