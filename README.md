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
| `projects` | only `Platform Adventure` is listed — a real, playable build. Append more entries as they are ready |
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

Two builds ship inside this site — `Platform Adventure` (a canvas platformer)
and `Power Up, Bots!` (an interactive 3D flipbook with a maths game embedded in
one of its pages). Each is a self-contained folder:

```
public/games/platform-adventure/
  index.html   game.js   style.css   assets/   audio/

public/games/power-up-bots/
  index.html   script.js   styles.css   preloader.js   preload-manifest.js
  sfx-data.js  assets/     sfx/
  PowerUp-Bots-main/story/     ← the halves game the flipbook embeds
```

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

One caveat on file names: **no commas**. Next.js serves `public/` files itself
and 404s on a literal `,` in the path, which browsers do not percent-encode —
so a build that worked over Live Server can lose exactly one asset here. Spaces,
`!`, `(`, `)` and non-ASCII characters are all fine. `Power Up, Bots!` had one
voice-over clip caught by this; it was renamed.

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
    three/                 Scene, CoreRig, IdentityCore, OrbitalRings,
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
table controls where the core sits in every section.

Scroll position, pointer position and the active chapter live in
`lib/scene-state.ts` — a plain mutable object, deliberately *not* React state,
so the WebGL layer can read them every frame without re-rendering the page.

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
  full-screen overlay) stands in for the navigation pill.
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

### Accessibility & fallbacks

- `prefers-reduced-motion`: smooth scrolling is skipped, the custom cursor is
  disabled, all continuous 3D motion stops, the scene switches to
  demand-driven rendering, and every reveal renders in its final state.
- No WebGL: a pure-CSS reading of the core (`StaticFallback`) takes over —
  same composition, same palette, no canvas.
- Semantic landmarks, a skip link, visible focus states, keyboard-operable
  project cards, Escape-to-close and focus-trapped overlays, and ≥44px touch
  targets throughout.
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
