"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { registerGsap, gsap, ScrollTrigger } from "@/lib/animations";

let lenis: Lenis | null = null;

/** Programmatic scrolling that works with or without the smooth-scroll layer. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.4 });
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Lock/unlock page scroll for full-screen overlays.
 *
 * `overflow: hidden` on the root element is enough on a desktop and is simply
 * ignored by Safari on iOS — the page behind an open overlay keeps scrolling
 * with the drag, and closing it leaves the visitor somewhere they never chose
 * to go. The reliable technique everywhere is to take the body out of flow at
 * a negative offset equal to the current scroll, then restore that scroll on
 * release.
 *
 * Locks are held by name rather than counted: the preloader releases its own
 * lock both when the entrance finishes and again if it is torn down, and an
 * overlay may already be open by then. A counter would let that second,
 * duplicate release unlock the page underneath something still on screen — a
 * named set makes releasing a lock you do not hold a no-op.
 */
const locks = new Set<string>();
let lockedScrollY = 0;

export function setScrollLocked(locked: boolean, owner = "default") {
  const held = locks.size > 0;
  if (locked) locks.add(owner);
  else locks.delete(owner);

  const shouldHold = locks.size > 0;
  if (shouldHold === held) return;

  const body = document.body;
  const root = document.documentElement;

  if (shouldHold) {
    lockedScrollY = window.scrollY;
    lenis?.stop();
    body.style.position = "fixed";
    body.style.top = `-${lockedScrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    // The scrollbar is already zero-width, but this keeps a desktop page from
    // reflowing by the gutter width as the body leaves flow.
    root.style.overflow = "hidden";
    return;
  }

  body.style.position = "";
  body.style.top = "";
  body.style.left = "";
  body.style.right = "";
  body.style.width = "";
  root.style.overflow = "";

  // `scrollTo` must be instant here: a smooth restore animates the page
  // underneath the overlay that is still fading out.
  window.scrollTo({ top: lockedScrollY, behavior: "instant" as ScrollBehavior });
  lenis?.start();
  // Lenis caches the scroll position it believes the page is at; without this
  // the next wheel event snaps back to wherever the overlay was opened.
  lenis?.resize();
}


/**
 * Lenis is an enhancement, not a dependency: it is skipped entirely for
 * reduced-motion visitors and on touch devices, where native momentum
 * scrolling is already better than anything we could synthesise.
 */
export function SmoothScroll() {
  useEffect(() => {
    registerGsap();

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    if (reduced || coarse) {
      ScrollTrigger.refresh();
      return;
    }

    const instance = new Lenis({
      duration: 1.05,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
      lerp: 0.1,
    });
    lenis = instance;

    instance.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      lenis = null;
    };
  }, []);

  return null;
}
