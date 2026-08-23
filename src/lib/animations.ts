"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Idempotent GSAP plugin registration — safe to call from any component. */
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out", duration: 1 });
  registered = true;
}

/**
 * One coherent motion language: slow, weighted, precise. Every section pulls
 * its easing from here rather than inventing its own curve.
 */
export const EASE = {
  /** Entrances — decisive start, long settle. */
  out: "expo.out",
  /** Secondary entrances. */
  soft: "power3.out",
  /** Bi-directional moves (overlays, menus). */
  inOut: "power4.inOut",
  /** Type rising out of a clip mask. */
  type: "power4.out",
} as const;

export const DUR = {
  fast: 0.45,
  base: 0.9,
  slow: 1.4,
  cinematic: 1.8,
} as const;

/** Standard scroll trigger for "reveal once as it enters the viewport". */
export const enterTrigger = (
  trigger: Element,
): ScrollTrigger.Vars => ({
  trigger,
  start: "top 82%",
  once: true,
});

/**
 * Text rising out of a clipping mask. Expects children wrapped in
 * `.clip-line` elements — see <RevealText />.
 */
export function revealLines(
  targets: gsap.TweenTarget,
  opts: { delay?: number; stagger?: number; duration?: number } = {},
) {
  return gsap.fromTo(
    targets,
    { yPercent: 118 },
    {
      yPercent: 0,
      duration: opts.duration ?? 1.25,
      ease: EASE.type,
      stagger: opts.stagger ?? 0.08,
      delay: opts.delay ?? 0,
    },
  );
}

export { gsap, ScrollTrigger };
