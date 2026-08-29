/**
 * ============================================================================
 *  SINGLE SOURCE OF TRUTH — EDIT THIS FILE ONLY
 * ============================================================================
 *
 *  Every word, link, number and image path rendered by the website is read
 *  from this file. No component contains hard-coded personal information.
 *
 *  SOURCE OF THE CONTENT BELOW
 *  ---------------------------
 *  Contact details, headline, summary, experience, education and top skills
 *  are taken from Aniket's own LinkedIn profile export (`Profile.pdf`, 2
 *  pages). Nothing has been added beyond what that document states.
 *
 *  The summary paragraphs were rewritten from LinkedIn's third person into
 *  first person for a personal site — the facts are unchanged.
 *
 *  `projects` holds one real, playable build.
 *
 *  STILL UNKNOWN (and therefore left blank, which hides the relevant UI):
 *    · certifications  — none listed
 *    · availability    — not stated, so the STATUS row stays hidden
 *
 *  HOW TO USE
 *  ----------
 *  1. Replace anything marked `placeholder: true` with real information and
 *     then delete the `placeholder` flag (or set it to `false`).
 *  2. Any section whose array is EMPTY is automatically hidden from the page —
 *     it is always better to remove an entry than to invent one.
 *  3. Entries still flagged as placeholders render with a small "PLACEHOLDER"
 *     chip so nothing unverified is ever presented as fact.
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export type Placeholder = { placeholder?: boolean };

export interface SkillGroup extends Placeholder {
  /** Short label shown on the orbiting node, e.g. "FRONTEND". Keep it short. */
  id: string;
  label: string;
  /** One line describing the discipline. */
  summary: string;
  /** Individual technologies / tools. */
  items: string[];
}

export interface Project extends Placeholder {
  id: string;
  title: string;
  category: string;
  year: string;
  /** Shown on the card (clamped to three lines) and in full in the overlay. */
  description: string;
  role?: string;
  technologies: string[];
  /** Path inside /public, e.g. "/projects/project-01.webp". Leave "" for the
   *  intentional "PROJECT VISUAL / COMING SOON" placeholder panel. */
  image?: string;
  /** Extra images for the detail overlay gallery. */
  gallery?: string[];
  /** Case-study fields. Any field left empty is hidden — never shown blank. */
  problem?: string;
  process?: string;
  solution?: string;
  result?: string;
  liveUrl?: string;
  githubUrl?: string;
  caseStudyUrl?: string;
  /**
   * Path to a self-contained playable build inside /public. When set, the
   * project's detail overlay gains a Play surface that runs it in an iframe
   * instead of showing a static image.
   */
  playUrl?: string;
  /** Aspect ratio of the playable build. Defaults to 16 / 9. */
  playAspect?: string;
  /**
   * How this build is controlled, shown as a hint under the frame. Not every
   * playable is a keyboard platformer, so each one says its own — the default
   * covers arrow-keys/WASD builds.
   */
  playControls?: { pointer: string; touch: string };
}

export interface ExperienceEntry extends Placeholder {
  id: string;
  /** e.g. "2024 — PRESENT" */
  period: string;
  role: string;
  company: string;
  location?: string;
  summary?: string;
  highlights?: string[];
  tech?: string[];
}

export interface EducationEntry extends Placeholder {
  id: string;
  year: string;
  institution: string;
  qualification: string;
  detail?: string;
}

export interface CertificationEntry extends Placeholder {
  id: string;
  year: string;
  issuer: string;
  title: string;
  credentialUrl?: string;
}

export interface MetaItem {
  label: string;
  value: string;
}

export interface SocialLink {
  label: string;
  href: string;
  /** External links get target=_blank + rel=noopener noreferrer */
  external?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Profile                                                                    */
/* -------------------------------------------------------------------------- */

export const profile = {
  /* --- Identity ----------------------------------------------------------- */
  name: "Aniket Chauhan",
  firstName: "Aniket",
  lastName: "Chauhan",
  monogram: "AC",

  /* --- Positioning (LinkedIn headline) ------------------------------------ */
  headline: "UI/UX Designer",
  /** LinkedIn headline: "Ui ux @ ConveGenius.AI | Designing Engaging Digital
   *  Experiences", stacked for the hero. Keep each line short — a line that
   *  wraps breaks the clip-mask reveal. */
  heroSubtitle: ["UI / UX DESIGNER", "@ CONVEGENIUS.AI", "ENGAGING DIGITAL EXPERIENCES"],
  /** One sentence, used as social/meta copy. */
  intro:
    "UI/UX designer at ConveGenius.AI, creating visuals and digital assets that make learning more engaging.",

  /* --- Location & time ---------------------------------------------------- */
  locality: "Delhi",
  country: "India",
  location: "Delhi, India",
  /** IANA timezone used for the "LOCAL TIME" hero readout. */
  timezone: "Asia/Kolkata",
  timezoneLabel: "IST",

  /* --- Links -------------------------------------------------------------- */
  linkedin: "https://www.linkedin.com/in/aniket-chauhan-531b57239",
  /** Deliberately empty — with no URL the GITHUB link is hidden everywhere. */
  github: "",
  email: "aniketchauhanac2005@gmail.com",
  /**
   * Deliberately empty. Your LinkedIn export lists a home number, but this
   * file is published to a public repository — a phone number in git history
   * is permanent and gets scraped. Fill it in only if you want it public, and
   * add { label: "PHONE", href: `tel:${profile.phone}` } to `extraLinks` to
   * render it.
   */
  phone: "",
  /** Extra links appended after LinkedIn / GitHub / email, everywhere those
   *  render. Empty, so nothing extra is shown. */
  extraLinks: [] as SocialLink[],

  /* --- Availability ------------------------------------------------------- */
  /** Not stated on LinkedIn, so the STATUS row stays hidden. Set a value such
   *  as "OPEN TO FREELANCE" to show it — do not claim availability you do not
   *  have. */
  availability: "",

  /* --- About -------------------------------------------------------------- */
  /**
   * Editorial statement. Each array entry is one visual line.
   * Prefix a line with "~" to render it as outlined type instead of solid —
   * that is how the emphasis rhythm is controlled, with no code changes.
   */
  aboutStatement: [
    "I BUILD DIGITAL",
    "EXPERIENCES WHERE",
    "~DESIGN",
    "~TECHNOLOGY",
    "~AND STORYTELLING",
    "BECOME ONE.",
  ],
  /** From the LinkedIn summary, moved into first person. No facts added. */
  about: [
    "I'm a UI/UX designer at ConveGenius.AI, where I create visuals and digital assets that make learning more engaging through technology. I work with cross-functional teams on social media creatives, campaign graphics and user-friendly interface design.",
    "Alongside design I work in vibe coding, HTML game creation and AI game development, with a background in graphic design and content creation. I hold a Bachelor of Arts in Political Science and Government from Delhi University.",
    "I'm motivated by opportunities to use design thinking and visual storytelling to support organisational goals and strengthen brand communication.",
  ] as string[],
  aboutPlaceholder: false,

  /** Compact technical metadata shown beside the biography. Rows with an
   *  empty value are dropped automatically. */
  metadata: [
    { label: "NAME", value: "ANIKET CHAUHAN" },
    { label: "BASED", value: "DELHI, INDIA" },
    { label: "FOCUS", value: "UI/UX + GRAPHIC DESIGN" },
    { label: "EXPERIENCE", value: "SINCE 2024" },
  ] as MetaItem[],

  /* --- Skills ------------------------------------------------------------- */
  /** Grouped from the LinkedIn "Top Skills" list and the summary. No tool has
   *  been added that the export does not mention. */
  skills: [
    {
      id: "design",
      label: "DESIGN",
      summary: "Interface and visual design for learning products.",
      items: [
        "UI/UX Design",
        "Graphic Design",
        "Design Thinking",
        "Visual Storytelling",
        "Brand Communication",
      ],
    },
    {
      id: "content",
      label: "CONTENT",
      summary: "Creative that carries a campaign across channels.",
      items: [
        "Social Media Creatives",
        "Campaign Graphics",
        "Content Creation",
        "Content Scheduling",
      ],
    },
    {
      id: "development",
      label: "DEVELOPMENT",
      summary: "Building the things I design.",
      items: ["Web Development", "Vibe Coding", "HTML Game Creation"],
    },
    {
      id: "ai-games",
      label: "AI & GAMES",
      summary: "Playable experiments at the edge of design and code.",
      items: ["AI Game Development", "Game Development"],
    },
  ] as SkillGroup[],

  /* --- Projects ----------------------------------------------------------- */
  /**
   * Add a project by appending an object here. Only `id`, `title`,
   * `category`, `year`, `description` and `technologies` are required; every
   * other field is hidden when absent. Set `playUrl` to a self-contained
   * build in /public/games to make it playable in the browser. Emptying this
   * array hides the whole SELECTED WORK section.
   */
  projects: [
    {
      id: "platform-adventure",
      title: "Platform Adventure",
      category: "GAME / INTERACTIVE",
      year: "2026",
      role: "Design & Development",
      description:
        "A side-scrolling platformer that runs entirely in the browser. Three playable heroes each carry their own speed, jump and power ratings; the run is built from coins to collect, seeds to fire, ground and flying enemies to clear, and an exit gate to reach. It ships a full lobby with character select, a HUD with level progress, pause and sound controls, and on-screen touch controls so it plays on a phone as well as a desktop.",
      technologies: ["HTML5 Canvas", "JavaScript", "CSS"],
      image: "/projects/platform-adventure.jpg",
      /** Playable build lives in /public/games/platform-adventure. */
      playUrl: "/games/platform-adventure/index.html",
    },
    {
      id: "power-up-bots",
      title: "Power Up, Bots!",
      category: "INTERACTIVE STORYBOOK",
      year: "2026",
      role: "Design & Development",
      description:
        "A maths picture book that reads like a real object. The hardcover has thickness and a spine, swings open on tap, and its twelve pages turn in 3D over full-bleed video. Some pages wait to be touched: a shelf of shapes plays a clip for each group the reader taps, and two pages hold on a still frame until the right shape is found. Two thirds of the way in, the page becomes a playable round — cut an energy block into two equal halves with a laser to charge the bots — which expands to fullscreen, then hands control back and turns the page itself when the reader finishes. Every asset is fetched behind a loading bar on the cover, so the book never stalls mid-story.",
      technologies: [
        "CSS 3D Transforms",
        "JavaScript",
        "WebM Video",
        "Web Audio",
      ],
      image: "/projects/power-up-bots.webp",
      /** Playable build lives in /public/games/power-up-bots. */
      playUrl: "/games/power-up-bots/index.html",
      playControls: {
        pointer: "CLICK THE CORNER ARROWS · CLICK THE PAGE",
        touch: "TAP THE CORNER ARROWS · LANDSCAPE",
      },
    },
    {
      id: "great-fish-rescue",
      title: "The Great Fish Rescue",
      category: "INTERACTIVE STORYBOOK",
      year: "2026",
      role: "Design & Development",
      description:
        "A second 3D flipbook, built around two games instead of one. Ten video pages carry the story; three of them stop and wait. On page two, four desert ponds light up one at a time and each has to be found before the book will turn. After page six the leaf uncurls onto a fish-sorting game, and after page eight a fish-counting one — each opening as printed title art, expanding to fullscreen when tapped, then closing itself and turning the page once it is finished. Both title cards are rendered from the games' own start screens by a script in the repo, so the picture the page turns onto is never out of step with the game behind it.",
      technologies: [
        "CSS 3D Transforms",
        "JavaScript",
        "WebM Video",
        "Web Audio",
      ],
      image: "/projects/great-fish-rescue.webp",
      /** Playable build lives in /public/games/great-fish-rescue. */
      playUrl: "/games/great-fish-rescue/index.html",
      playControls: {
        pointer: "CLICK THE CORNER ARROWS · CLICK THE PAGE",
        touch: "TAP THE CORNER ARROWS · LANDSCAPE",
      },
    },
    {
      id: "byte-saves-the-day",
      title: "Byte Saves the Day",
      category: "INTERACTIVE STORYBOOK",
      year: "2026",
      role: "Design & Development",
      description:
        "The third flipbook, and the one that finally solved loading. A hardcover book with real thickness and a spine sits angled on the page; tapping PLAY swings the cover open onto four full-bleed video pages. Two games are bound into the story rather than bolted after it — Byte's Energy Hunt after page three, Right & Left after page four — each opening framed inside the leaf it was printed on, expanding to fullscreen when tapped, then handing the book back and turning the page itself once the closing narration has played out. Fifty-five megabytes of video, art and voice-over sit behind that, so the start control waits on ten files and under a megabyte; everything else arrives during the reading.",
      technologies: [
        "CSS 3D Transforms",
        "JavaScript",
        "WebM Video",
        "Web Audio",
      ],
      image: "/projects/byte-saves-the-day.webp",
      /** Playable build lives in /public/games/byte-saves-the-day. */
      playUrl: "/games/byte-saves-the-day/index.html",
      playControls: {
        pointer: "CLICK THE CORNER ARROWS · CLICK THE PAGE",
        touch: "TAP THE CORNER ARROWS · LANDSCAPE",
      },
    },
    {
      id: "royal-bloom-fest",
      title: "The Royal Bloom Fest",
      category: "INTERACTIVE STORYBOOK",
      year: "2026",
      role: "Design & Development",
      description:
        "The fourth flipbook, and the one where the game stops being a page you wait for. Five video pages carry Aru and Pari to the palace festival; the fifth leaf turns onto Royal Bloom, a weighing game about heavier and lighter, printed at page size as though it had always been part of the book. Tapping it expands to true fullscreen — it has to live in its own layer outside the book, because a CSS 3D transform traps the fixed positioning fullscreen needs — and finishing it folds the game away and turns to page six on its own. The build boots that game silent in a hidden frame while you are still on page one, so arriving at it is a reveal rather than a download, and the loading bar reads from a generated table of real file sizes instead of guessing.",
      technologies: [
        "CSS 3D Transforms",
        "JavaScript",
        "WebM Video",
        "Web Audio",
      ],
      image: "/projects/royal-bloom-fest.webp",
      /** Playable build lives in /public/games/royal-bloom-fest. */
      playUrl: "/games/royal-bloom-fest/index.html",
      playControls: {
        pointer: "CLICK THE CORNER ARROWS · CLICK THE PAGE",
        touch: "TAP THE CORNER ARROWS · LANDSCAPE",
      },
    },
    {
      id: "heavy-and-light",
      title: "Heavy and Light",
      category: "LEARNING GAME",
      year: "2026",
      role: "Design & Development",
      description:
        "Not a storybook this time — a single working object. A bird flies in, the balance assembles itself piece by piece, and she sits in a pan to demonstrate that the heavier side goes down before asking you to try it: eight rounds of dragging two things into the pans and watching which one wins, from apple against watermelon up to dog against elephant. The beam is a real rig rather than a swapped picture — it pivots on its hub and carries the pans and whatever is sitting in them, with every pivot point and sprite anchor measured off the artwork's own pixels. The whole thing is one self-contained HTML file with no build step and no dependencies.",
      technologies: ["JavaScript", "Canvas", "WebP", "Web Audio"],
      image: "/projects/heavy-and-light.webp",
      /** Playable build lives in /public/games/heavy-and-light. */
      playUrl: "/games/heavy-and-light/index.html",
      playControls: {
        pointer: "DRAG THE OBJECTS INTO THE PANS",
        touch: "DRAG THE OBJECTS · LANDSCAPE",
      },
    },
  ] as Project[],

  /* --- Experience --------------------------------------------------------- */
  /** Verbatim from the LinkedIn export, newest first. */
  experience: [
    {
      id: "convegenius-uiux",
      period: "NOV 2025 — PRESENT",
      role: "UI/UX Designer",
      company: "ConveGenius.AI",
      location: "NOIDA, INDIA",
    },
    {
      id: "convegenius-graphic",
      period: "MAY 2025 — NOV 2025",
      role: "Graphic Designer",
      company: "ConveGenius.AI",
      location: "NOIDA, UTTAR PRADESH, INDIA",
      summary:
        "Designed creative visuals and digital assets supporting the company's mission of making learning more engaging through technology — social media creatives, UI/UX designs and campaign graphics, produced with cross-functional teams.",
    },
    {
      id: "ccie-hub",
      period: "JUN 2024 — APR 2025",
      role: "Graphic Designer",
      company: "CCIE HUB",
      location: "DELHI, INDIA",
      summary:
        "Designed and managed visual content across social platforms, keeping brand consistency while growing audience engagement.",
      highlights: [
        "Created posts, stories and promotional material, and oversaw content scheduling and performance tracking.",
        "Worked with marketing to support campaigns and grow the company's online presence through strategic design and content planning.",
      ],
    },
  ] as ExperienceEntry[],

  /* --- Education ---------------------------------------------------------- */
  education: [
    {
      id: "delhi-university",
      year: "2023",
      institution: "Delhi University",
      qualification: "Bachelor of Arts (BA), Political Science and Government",
      detail: "Listed on LinkedIn as August 2023.",
    },
  ] as EducationEntry[],

  /* --- Certifications ----------------------------------------------------- */
  /** None listed on LinkedIn — the section hides itself while this is empty. */
  certifications: [] as CertificationEntry[],

  /* --- Contact ------------------------------------------------------------ */
  contact: {
    /** Rendered above the main statement, one entry per line. */
    eyebrow: ["HAVE", "AN IDEA?"],
    lines: ["LET'S CREATE", "SOMETHING", "UNEXPECTED."],
    /** Falls back to LinkedIn when `email` above is empty. */
    ctaLabel: "START A CONVERSATION",
  },

  /* --- Footer ------------------------------------------------------------- */
  footer: {
    tagline: ["DESIGNED × DEVELOPED", "WITH CURIOSITY"],
  },

  /* --- SEO ---------------------------------------------------------------- */
  seo: {
    title: "Aniket Chauhan — UI/UX Designer",
    description:
      "Aniket Chauhan is a UI/UX designer at ConveGenius.AI in Delhi, India, designing engaging digital experiences across interface, graphic and campaign work.",
    /** Absolute site URL, used for canonical + OpenGraph. Change this if you
     *  deploy the portfolio somewhere other than the Netlify domain. */
    siteUrl: "https://aniketchauhan.netlify.app",
    keywords: [
      "Aniket Chauhan",
      "UI/UX designer",
      "graphic designer",
      "ConveGenius",
      "Delhi",
      "portfolio",
    ],
  },
};

export type Profile = typeof profile;

/* -------------------------------------------------------------------------- */
/*  Derived helpers — components read these instead of branching on data       */
/* -------------------------------------------------------------------------- */

export const socialLinks: SocialLink[] = [
  profile.linkedin && {
    label: "LINKEDIN",
    href: profile.linkedin,
    external: true,
  },
  profile.github && { label: "GITHUB", href: profile.github, external: true },
  profile.email && { label: "EMAIL", href: `mailto:${profile.email}` },
  ...profile.extraLinks,
].filter(Boolean) as SocialLink[];

/** Where the primary "start a conversation" CTA points. */
export const primaryContactHref = profile.email
  ? `mailto:${profile.email}`
  : profile.linkedin;

/** Metadata rows, with anything left blank removed. */
export const metadataRows: MetaItem[] = [
  ...profile.metadata,
  ...(profile.availability
    ? [{ label: "STATUS", value: profile.availability }]
    : []),
].filter((row) => Boolean(row.value));

export const hasSkills = profile.skills.length > 0;
export const hasProjects = profile.projects.length > 0;
export const hasExperience = profile.experience.length > 0;
export const hasKnowledge =
  profile.education.length > 0 || profile.certifications.length > 0;
