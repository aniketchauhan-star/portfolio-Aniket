"use client";

import { useRef } from "react";
import { Section } from "@/components/layout/Section";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { registerGsap, gsap, ScrollTrigger } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { HeroContent, HeroMeta } from "./HeroContent";
import { ScrollIndicator } from "./ScrollIndicator";
import { useRevealed } from "@/lib/reveal-store";

/**
 * Hero shell. Owns the "leaving the hero" scrub: the typography lifts and
 * dissolves while the robot recedes (handled by the scene), so the
 * transition into the about section reads as one continuous move.
 */
export function Hero() {
  const play = useRevealed();
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    registerGsap();

    const ctx = gsap.context(() => {
      gsap.to(".js-hero-lift", {
        yPercent: -22,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }, root);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, [reduced]);

  return (
    <Section
      id="top"
      chapter="hero"
      label="Introduction"
      className="flex min-h-[100svh] flex-col justify-between overflow-hidden pt-[calc(6rem+var(--safe-t))] md:pt-[calc(8rem+var(--safe-t))] [@media(orientation:landscape)_and_(max-height:560px)]:pt-[calc(4rem+var(--safe-t))]"
    >
      <div
        aria-hidden
        className="scan-light pointer-events-none absolute inset-0 -z-10"
      />

      <div ref={root} className="flex flex-1 flex-col justify-center">
        <div className="js-hero-lift shell w-full">
          <div className="max-w-[min(100%,58rem)] lg:max-w-[62%]">
            <HeroContent play={play} />
          </div>
        </div>
      </div>

      {/* Order matters: the phone reading of the indicator is in flow and has
          to sit above the metadata strip. The desktop reading is absolute and
          is unaffected by where it appears in the DOM. */}
      <ScrollIndicator />
      <HeroMeta play={play} />
    </Section>
  );
}
