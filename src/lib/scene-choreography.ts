import type { SceneChapter } from "./scene-state";

/**
 * The single place where the narrative maps onto the 3D scene.
 *
 * ENTER → DISCOVER → EXPLORE → JOURNEY → CONNECT
 *
 * Each chapter declares where the identity core sits, how open its rings are
 * and how the particle field behaves. Everything else damps toward these
 * numbers, so the transition between chapters is always continuous — the
 * scene is never rebuilt.
 */
export interface ChapterState {
  /** Core position in world space. */
  x: number;
  y: number;
  z: number;
  scale: number;
  /** 0 = rings splayed at their rest tilt, 1 = rings aligned into one plane. */
  ringAlign: number;
  /** Radial spread multiplier for the rings. */
  ringSpread: number;
  /** Core emissive strength. */
  energy: number;
  /** Particle radius multiplier — > 1 disperses, < 1 gathers. */
  particleSpread: number;
  /** Extra Y rotation offset applied to the whole core group. */
  spin: number;
}

const CHAPTERS: Record<SceneChapter, ChapterState> = {
  hero: {
    // Held in the right third of the frame, clear of the name.
    x: 2.5,
    y: 0.05,
    z: 0,
    scale: 1,
    ringAlign: 0,
    ringSpread: 1,
    energy: 1,
    particleSpread: 1,
    spin: 0,
  },
  about: {
    // Recedes deep into the background and settles into the quiet upper-right
    // margin. From here to the timeline the core is atmosphere; it is never
    // allowed to sit behind a line of type.
    x: 5.0,
    y: 1.9,
    z: -6.8,
    scale: 0.7,
    ringAlign: 0.15,
    ringSpread: 1.12,
    // Dimmest of the mid chapters: the biography column reaches the right
    // margin here, so the core has to sit behind text and must not compete.
    energy: 0.42,
    particleSpread: 1.18,
    spin: 0.5,
  },
  skills: {
    // The DOM gas giant is the subject here, so the core drops right back and
    // reads as a distant object rather than a second focal point.
    x: 5.6,
    y: 1.8,
    z: -10.0,
    scale: 0.6,
    ringAlign: 0.05,
    ringSpread: 1.38,
    energy: 0.4,
    particleSpread: 1.1,
    spin: 1.1,
  },
  projects: {
    x: 5.4,
    y: -0.9,
    z: -7.6,
    scale: 0.72,
    ringAlign: 0.4,
    ringSpread: 0.94,
    energy: 0.5,
    particleSpread: 1.32,
    spin: 1.9,
  },
  experience: {
    x: 5.6,
    y: 0.9,
    z: -7.0,
    scale: 0.78,
    ringAlign: 0.55,
    ringSpread: 1.06,
    energy: 0.66,
    particleSpread: 1.16,
    spin: 2.6,
  },
  knowledge: {
    // The rest stop: furthest away, dimmest, barely moving.
    x: 5.2,
    y: -1.5,
    z: -8.5,
    scale: 0.62,
    ringAlign: 0.7,
    ringSpread: 1.0,
    energy: 0.42,
    particleSpread: 1.05,
    spin: 2.9,
  },
  contact: {
    // Returns to the foreground, rings aligned, particles gathering.
    x: 1.75,
    y: 0.05,
    z: 0.4,
    scale: 1.06,
    ringAlign: 1,
    ringSpread: 0.82,
    energy: 1.4,
    particleSpread: 0.6,
    spin: 3.2,
  },
};

export const chapterState = (c: SceneChapter): ChapterState => CHAPTERS[c];
