# Aniket Chauhan — Portfolio

**ANIKET // DIGITAL UNIVERSE** — a premium, futuristic 3D portfolio built as
one continuous scroll experience: a single persistent WebGL scene behind the
whole document, choreographed against the page as the visitor moves through it.

```
00  ENTRY        preloader
01  IDENTITY     about
02  CAPABILITIES skills
03  SELECTED WORK projects
04  EXPERIENCE   timeline
05  KNOWLEDGE    education & certifications
06  CONTACT      the closing moment
```

**Live LinkedIn:** https://www.linkedin.com/in/aniket-chauhan-531b57239

---

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
npm start
```

## Lint & type-check

```bash
npm run lint
npx tsc --noEmit
```

---

## Editing personal information

**Everything you can see on the site comes from one file:**

```
src/data/profile.ts
```

No component contains hard-coded personal information. Change that file and
the whole site updates — headline, biography, metadata, skills, projects,
experience, education, certifications, links, SEO copy.

### Where the current content came from

Contact details, headline, summary, experience, education and the skill list
are taken from Aniket's own LinkedIn export (`Profile.pdf`). The summary was
moved from LinkedIn's third person into first person; no facts were added.

Still unknown, and therefore blank or clearly marked:

| | |
| --- | --- |
| `projects` | five real, playable builds are listed. Append more entries as they are ready |
| `certifications` | none listed, so the section hides itself |
| `availability` | not stated, so the hero `STATUS` row stays hidden |

`phone` holds the number from the export but is **not rendered anywhere**.
Publishing a personal number invites spam; add it to `extraLinks` if you want
it on the page. `Profile.pdf` itself is gitignored for the same reason.

### Placeholders

Nothing in this repository asserts a fact about Aniket that has not been
supplied. Entries that still need real content carry a flag:

```ts
{
  id: "exp-01",
  period: "———— — ————",
  role: "Your Role",
  company: "Company Name",
  placeholder: true,       // ← renders a small "PLACEHOLDER" chip
}
```

To publish real content:

1. Replace the values.
2. Delete the `placeholder: true` line (or set it to `false`).

The chip disappears. `profile.aboutPlaceholder` does the same job for the
biography paragraphs.

### Hiding a whole section

**Empty the array.** Any section with no entries removes itself from the page
— it is always better to delete an entry than to invent one.

| Section                   | Field                                    |
| ------------------------- | ---------------------------------------- |
| Capabilities              | `profile.skills`                         |
| Selected work             | `profile.projects`                       |
| Journey (timeline)        | `profile.experience`                     |
| Knowledge                 | `profile.education`, `profile.certifications` |

Individual links behave the same way: leave `profile.github` or
`profile.email` as `""` and they vanish from the nav, contact block, footer,
mobile menu and structured data.

### A few specific knobs

| What                    | Where                                    |
| ----------------------- | ---------------------------------------- |
| Hero name               | `firstName` / `lastName`                 |
| Headline under the name | `heroSubtitle` — one entry per line      |
| Big editorial statement | `aboutStatement` — prefix a line with `~` to render it as outlined type |
| `NAME / BASED / FOCUS`  | `metadata`                               |
| `STATUS` row            | `availability` — set to `""` to hide it  |
| Hero "LOCAL TIME"       | `timezone` (IANA) + `timezoneLabel`      |
| Contact headline        | `contact.eyebrow` + `contact.lines`      |
| Footer tagline          | `footer.tagline`                         |
| Page title / description| `seo`                                    |

Set `seo.siteUrl` to the real domain before deploying — it drives the
canonical URL, OpenGraph tags, `robots.txt` and `sitemap.xml`.

---

## Playable projects

Five builds ship inside this site — `Platform Adventure` (a canvas platformer)
and four interactive 3D flipbooks, each with games embedded in its pages.
Every one is a self-contained folder:

```
public/games/platform-adventure/
  index.html   game.js   style.css   assets/   audio/

public/games/power-up-bots/
  index.html   script.js   styles.css   preloader.js   preload-manifest.js
  sfx-data.js  assets/     sfx/
  PowerUp-Bots-main/story/     ← the halves game the flipbook embeds

public/games/great-fish-rescue/
  index.html   script.js   styles.css   preload-manifest.js
  sfx-data.js  assets/     sfx/     tools/
  LBD 1/       ← the fish-sorting game  (page 7)
  LBD 2/       ← the fish-counting game (page 10)

public/games/byte-saves-the-day/
  index.html   script.js   styles.css   preload.js
  sfx-data.js  asset-manifest.json      assets/   sfx/
  LBD 1/                   ← Byte's Energy Hunt        (after story page 3)
  LBD 2/Right-and-Left/    ← Right & Left, the parcels (after story page 4)

public/games/royal-bloom-fest/
  index.html   script.js   styles.css   sfx-data.js
  asset-manifest.js        assets/   sfx/
  game/                    ← Royal Bloom, the weighing game (story page 5)
```

The flipbooks reference their embedded games by relative path, so the folder
drops in as-is. `great-fish-rescue/tools/gen-title-card.mjs` is kept because
`script.js` points at it: each game's title card is a render of that game's own
start screen, and it has to be regenerated whenever a title screen changes.

`byte-saves-the-day` arrived with its own `.vercelignore` naming exactly what
ships, and that is what was copied: its `tools/`, `tests/`, `quarantine/` (46MB
of pre-optimisation source media), Playwright config and development reports
are all left behind. Its `script.js` mentions `tools/` only in comments, so
unlike `great-fish-rescue` nothing there is needed at runtime. Two things had
to be corrected on the way in — see the note on file names below.

`royal-bloom-fest` came with a `.vercelignore` too, and the distinction it
draws is worth knowing before editing that build: **`game/` is what ships and
`LBD 1/` is the authoring copy** — the same game plus its God Mode design
suite, QA harness and data scripts, ~13MB, none of it reachable from the page.
`tools/` (the media converter and the manifest generator) is likewise
authoring-only. All of it was left behind; 24MB of the 37MB source ships.

Its `asset-manifest.js` is generated by `tools/gen-asset-manifest.mjs` and
holds the real on-disk byte size of all 140 files the preloader warms, so the
loading bar is accurate from the first frame rather than guessing. It is a
`<script>` tag, not a fetch — so unlike the other flipbooks' JSON manifests it
has to ship whatever else is trimmed. **Regenerate it whenever that build's
media changes**, or the bar will be measured against sizes that no longer
exist.

and the project entry points at it:

```ts
playUrl: "/games/platform-adventure/index.html",
playAspect: "16 / 9",   // optional, defaults to 16:9
playControls: {         // optional, defaults to arrow-keys/WASD
  pointer: "CLICK THE CORNER ARROWS · CLICK THE PAGE",
  touch:   "TAP THE CORNER ARROWS · LANDSCAPE",
},
```

Any project with a `playUrl` gets a Play surface in its detail overlay instead
of a static image: a poster with a play control, then the build in an iframe,
with **Fullscreen** and **Open in new tab** underneath. The build is not
downloaded until the visitor presses play — several megabytes of sprites and
audio should not load just because someone opened a project page. The frame's
width is capped from `100svh` so the whole game is on screen even on a
landscape phone. The build itself is a landscape game and keeps its own rotate
prompt; the surrounding page does not require rotating.

The card marks these projects with a `PLAYABLE` chip and reads
`PLAY PROJECT` instead of `VIEW PROJECT`.

**To add another playable build:** drop a self-contained folder in
`public/games/<name>/` and set `playUrl` on its project entry. Nothing else is
needed.

One caveat on file names: **avoid commas**. `Power Up, Bots!` lost exactly one
voice-over clip to a literal `,` in a path when it was first added, and it was
renamed. Spaces, `!`, `(`, `)` and non-ASCII characters have always been fine.

Re-testing this on Next.js 16, a literal comma now serves correctly under both
`next dev` and `next start`, so the original failure looks like it has since
been fixed upstream. `byte-saves-the-day` was still brought in comma-free —
two voice-over clips named `And just like that, Byte Saved the Day (1).ogg`
were renamed to use ` - `, and the one runtime reference plus three
`asset-manifest.json` entries were updated to match. That is precaution, not a
reproduced bug: the deployment target is Vercel's static edge rather than
`next start`, which is not what was tested here.

The same pass removed 26 entries from that build's generated
`asset-manifest.json` — Playwright screenshots and metrics JSON that the
manifest generator had swept up, all of which are development-only and were
correctly not copied. They sat in the non-blocking `background` stage so they
would not have held up the start control, but they would have been 26 failed
requests during the idle warm-up. The stage tallies and `totalBytes` were
recomputed so the preloader's progress still reaches 100%.

## Adding projects

1. Drop images in `public/projects/` (see `public/projects/README.md` for the
   naming and format conventions).
2. Add an entry to `profile.projects`:

```ts
{
  id: "aurora",
  title: "Aurora",
  category: "INTERFACE",
  year: "2025",
  description: "Clamped to three lines on the card, shown in full in the overlay.",
  role: "Design & Development",
  technologies: ["Next.js", "WebGL", "GSAP"],
  image: "/projects/aurora.webp",
  gallery: ["/projects/aurora-02.webp"],
  problem: "…",
  process: "…",
  solution: "…",
  result: "…",
  liveUrl: "https://…",
  githubUrl: "https://…",
}
```

Only `id`, `title`, `category`, `year`, `description` and `technologies` are
required.
**Every other field is hidden when empty** — a half-filled project still
renders as a finished page, never as an empty heading.

Projects with no `image` render an intentional `PROJECT VISUAL / COMING SOON`
panel rather than a borrowed stock photo.

---

## Main technologies

| | |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Language  | TypeScript (strict) |
| Styling   | Tailwind CSS v4 |
| 3D        | Three.js, React Three Fiber, @react-three/drei |
| Motion    | GSAP + ScrollTrigger |
| Scrolling | Lenis (progressive enhancement only) |
| Icons     | lucide-react |

---

## How it is put together

```
src/
  app/                     layout, page, globals.css, icon, OG image, robots, sitemap
  components/
    layout/                Navbar, MobileMenu, Footer, Preloader, Section,
                           SectionHeader, SmoothScroll, Chrome
    hero/                  Hero, HeroContent, ScrollIndicator, LocalTime, PointerReadout
    three/                 Scene, CoreRig, Robot, OrbitalRings,
                           ParticleField, AdaptivePerformance, StaticFallback, shaders
    skills/                Skills, SkillOrbit, SkillsMobile, OrbitPlanet
    projects/              Projects, ProjectCard, ProjectModal, ProjectVisual, GameFrame
    about/ experience/ education/ contact/
    ui/                    RevealText, RevealWords, RevealLine, FadeUp, Stagger,
                           ScrambleText, SectionLabel, MagneticButton, Cursor,
                           NoiseOverlay, ScrollProgress
  data/profile.ts          ← the only file you need to edit
  hooks/                   useMediaQuery, useReducedMotion, useSectionChapter, …
  lib/                     animations, quality, scene-state, scene-choreography, utils
public/
  projects/                your project imagery
  games/                   self-contained playable builds
```

### One canvas, many chapters

There is exactly one `<Canvas>` on the page, fixed behind the DOM. Sections
declare which narrative *chapter* they belong to; `lib/scene-choreography.ts`
maps each chapter to a position, scale, ring alignment, energy level and
particle spread, and everything damps toward those numbers. The scene is
modulated as you scroll — it is never torn down and rebuilt.

To re-stage the 3D layer, edit `src/lib/scene-choreography.ts`. That single
table controls where the robot sits in every section.

Scroll position, pointer position and the active chapter live in
`lib/scene-state.ts` — a plain mutable object, deliberately *not* React state,
so the WebGL layer can read them every frame without re-rendering the page.

### The robot

The subject of the WebGL scene is a hovering machine (`three/Robot.tsx`), and
like everything else in the scene it is **generated geometry** — there is no
model file to download. Eight-sided drums give the head and torso a machined
silhouette that reads against a near-black page, because each facet catches
the cyan and violet light cards at a different angle. (Flat boxes do not work
here: `boxGeometry`'s segment arguments subdivide faces, they do not chamfer,
so a box robot renders as a stack of unlit slabs.)

The only emissive surfaces are the visor, the chest core, the seams, the
antenna tip and the hover plume:

| Part | How |
| --- | --- |
| Visor | `VISOR_FRAG` — a vertical gradient, a scan line travelling down it, fine ruling and a fresnel edge. Drawn on an *open cylinder wall* wrapping the front of the head: the front facet is only 0.126 wide, so any readable flat plate overhangs the silhouette, and a cylinder's UVs still run `v` = up, which is the axis the scan sweeps |
| Chest core | `ENERGY_FRAG`, the same shader the sphere it replaced ran — which is why `energy` and `pulse` still land on the robot untouched |
| Hover plume | `GLOW_FRAG` — an *inverse* fresnel, brightest facing the eye and falling off at its own silhouette. A flat material has no falloff and reads as a solid lozenge; a normal fresnel lights exactly the wrong half |

Two things in the shared rig had to change because the subject now has a
**front**, where a sphere had none:

- `CoreRig` sways the robot ±0.5rad about front rather than accumulating a
  spin. An ever-increasing rotation turns a face away and never brings it back.
- The per-chapter `spin` offsets in the choreography are bounded to about ±0.6
  instead of climbing 0 → 3.2. At the old contact value the robot showed its
  back at the exact moment the CTA wants it looking at the visitor.

On a phone the robot also lifts into the empty band **above** the hero copy
rather than sitting beside it. A sphere clipped by the right edge still reads
as a sphere; half a robot reads as debris.

### The gas giant

`OrbitPlanet` is the body at the centre of the capability system. It is pure
CSS — layered gradients for the cloud belts, a drifting streak layer twice the
disc's width translated by exactly one tile so the rotation loops seamlessly,
spherical shading, a conic limb highlight and an atmospheric bloom. No texture
is downloaded and no second WebGL context competes with the page's canvas. The
drift stops under `prefers-reduced-motion`. Size is set by the `--planet-size`
custom property at the call site.

### Performance

- Quality tiers (`lib/quality.ts`) pick particle count, geometry detail and a
  clamped `dpr` per device; `AdaptivePerformance` steps the tier down if real
  frame timing disagrees with the initial guess.
- The canvas is code-split and never server-rendered, so the HTML paints first.
- The glass shell is a fresnel shader rather than a physical transmission
  material: it removes an entire extra scene pass per frame.
- Particles are one instanced draw call; the orbital nodes are one
  `InstancedMesh`; geometry and materials are shared and explicitly disposed.

### Every orientation, every resolution

There is no orientation gate. The site renders in portrait and landscape at
any size, from a 320px phone to a 1560px desktop, and nothing asks the visitor
to rotate their device.

Three things carry that:

- **Layout.** Every multi-column section is a single column below `lg`, and the
  two places where a desktop layout would not survive being squeezed have real
  small-screen counterparts rather than shrunken copies: `SkillsMobile` (a
  thumb-driven snap rail) stands in for the `SkillOrbit`, and `MobileMenu` (a
  full-screen index) stands in for the navigation pill.
- **Short landscape.** A phone on its side is roughly 844×390, so height
  becomes the constraint. Under
  `@media (orientation: landscape) and (max-height: 560px)` the display scale
  is re-derived from `vh` and the vertical rhythm compresses — without it the
  hero alone would be taller than the screen.
- **Narrow portrait.** The display clamps bottom out at a floor tuned for a
  ~390px phone, so under `@media (max-width: 389px)` those floors come down
  and the section rhythm tightens. Otherwise the longest heading lines would
  reach the gutter and clip on a 320–375px screen.

The one exception is the embedded platformer, which is a landscape game: it
keeps its own rotate prompt inside the iframe, and the frame offers
**Fullscreen** (which requests a landscape lock where the browser allows it).
That is scoped to the game — the portfolio itself never blocks.

### Designed for touch, not just resized for it

Responding to a viewport width and being usable with a thumb are different
problems. These are the places where the phone gets its own answer rather than
a narrower version of the desktop one.

**The safe area is real estate, not padding.** The viewport is declared
`viewportFit: cover`, so the page genuinely draws underneath the Dynamic
Island and the home indicator. `globals.css` therefore defines `--gutter-l`,
`--gutter-r`, `--safe-t` and `--safe-b` from `env(safe-area-inset-*)`, and
every horizontal gutter and every element pinned to a screen edge is expressed
in terms of those. On a device with no cutouts they resolve to `0px` and
nothing changes. `.rail` has to cancel the inset as well as the gutter in its
negative margin, since it bleeds to the true screen edge.

**Affordances that survive having no hover.** Nearly every signal on the
desktop site is a `:hover` — the hairline across the top of a project card,
the arrow that slides, the label that brightens. A phone fires none of them, so
those cards read as flat panels. The `@media (hover: none)` block in
`globals.css` is the touch reading of the same language: the resting state
carries some of what hover used to reveal (`.touch-edge-light`,
`.touch-affordance`), and the *press* is what completes it — a small scale for
controls, a border-and-fill shift for cards (`.press-card`). The iOS grey tap
flash is turned off, because there is now something better in its place.

**Scroll locking that works on iOS.** `overflow: hidden` on the root element is
enough on a desktop and is simply ignored by Safari on iOS, so the page behind
an open overlay kept scrolling with the drag. `setScrollLocked` in
`SmoothScroll.tsx` takes the body out of flow at a negative offset equal to the
current scroll and restores that scroll on release. Locks are held by *name*
(`"preloader"`, `"mobile-menu"`, `"project-modal"`): the preloader releases its
own lock twice by design, and a counter would let that duplicate release unlock
the page underneath an overlay that is still open.

**The mobile menu is the whole index.** The desktop pill has four slots; the
overlay is a full screen and carries all seven sections in page order, marks
the one you are in, scrolls if a landscape phone cannot fit them, and holds the
primary contact control — which is hidden from the bar below `sm`, so without
it the narrowest phones had no contact affordance in the navigation at all.

**The skills rail says where you are.** A horizontal scroller inside a vertical
page is the one component that can be missed entirely on a phone; with the
cards clipped at the screen edge, three of five disciplines simply never get
read. The rail carries a `01 / 04` counter and a row of markers that track the
snap position and are tappable. The markers run edge to edge with no gap
between them — at four disciplines on a 320px screen each is only ~28px wide,
and any spacing *between* them would be a dead strip a thumb can land in.

**The playable builds open fullscreen.** Every build here is a landscape game,
and playing one in a letterboxed strip inside a scrolling overlay is not really
playing it. On touch the same tap that starts the build also requests
fullscreen — it has to happen in that handler, because `requestFullscreen` is
only granted during a user gesture. Safari on iPhone refuses fullscreen on
non-video elements; the game plays inline there and keeps its own rotate
prompt.

**The scene stops when nobody can see it.** The canvas is fixed behind the
whole document and renders continuously, which is right while the page is being
read and pure waste the moment something covers it. `lib/scene-visibility.ts`
holds named occluders — the project overlay, the mobile menu, a backgrounded
tab — and the canvas switches to `frameloop="demand"` while any are held. It
matters most on a phone: the project overlay is where the playable builds run,
so the worst case was a phone GPU driving a game *and* an invisible particle
field, two rings and a lit robot. Every value in the rig is damped toward a
target rather than integrated from the last frame, so resuming just carries on
from wherever it parked.

**Pointer parallax is a mouse behaviour.** `pointermove` also fires for a
finger, once per frame for the whole length of a scroll drag, so the camera and
the robot were being dragged sideways by the same gesture that scrolls the
page. The listener is now attached only under `(pointer: fine)`.

### Accessibility & fallbacks

- `prefers-reduced-motion`: smooth scrolling is skipped, the custom cursor is
  disabled, all continuous 3D motion stops, the scene switches to
  demand-driven rendering, and every reveal renders in its final state.
- No WebGL: a pure-CSS reading of the robot (`StaticFallback`) takes over —
  same composition, same palette, no canvas.
- Semantic landmarks, a skip link, visible focus states, keyboard-operable
  project cards, Escape-to-close and focus-trapped overlays, and 44px touch
  targets. The one deliberate exception is the skills rail's position markers:
  four of them cannot each be 44px wide on a 320px screen, so they are 44px
  *tall* and contiguous, which is the trade every segmented pagination control
  makes.
- The custom cursor (desktop, non-reduced-motion only) reads `data-cursor` on
  the nearest ancestor: `view` over project cards, `open` over external links,
  `drag` over the scrollable skills rail, `link` elsewhere.

---

## Deployment

Deploys to **Vercel** with no configuration:

```bash
npx vercel
```

Before going live, set `profile.seo.siteUrl` to the production domain.

Any Node host works too — `npm run build && npm start`.
