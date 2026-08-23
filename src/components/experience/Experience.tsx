"use client";

import { useRef } from "react";
import { profile } from "@/data/profile";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { registerGsap, gsap } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ExperienceItem } from "./ExperienceItem";

export function Experience() {
  const entries = profile.experience;
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  /* The luminous line draws itself as the visitor descends the timeline. */
  useIsomorphicLayoutEffect(() => {
    const el = track.current;
    if (!el || reduced) return;
    registerGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".js-timeline-line",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 72%",
            end: "bottom 72%",
            scrub: 0.7,
          },
        },
      );
    }, track);

    return () => ctx.revert();
  }, [reduced]);

  if (!entries.length) return null;

  return (
    <Section
      id="experience"
      chapter="experience"
      label="Experience"
      className="py-[var(--spacing-section)]"
    >
      <div className="shell">
        <SectionHeader
          index="04"
          label="EXPERIENCE"
          titleLines={["THE", "JOURNEY", "SO FAR."]}
        />

        <div ref={track} className="relative mt-20 lg:mt-28">
          {/* Vertical rail — sits under the nodes at the same column. */}
          <span
            aria-hidden
            className="absolute top-2 bottom-2 left-[calc(0.5rem-0.5px)] w-px bg-[rgba(244,246,255,0.06)] md:left-[calc(15rem-0.5px)]"
          />
          <span
            aria-hidden
            className="js-timeline-line absolute top-2 bottom-2 left-[calc(0.5rem-0.5px)] w-px origin-top md:left-[calc(15rem-0.5px)]"
            style={{
              background:
                "linear-gradient(180deg, rgba(108,243,255,0.85) 0%, rgba(132,107,255,0.55) 55%, rgba(108,243,255,0.08) 100%)",
              boxShadow: "0 0 12px rgba(108,243,255,0.35)",
            }}
          />

          <ol className="relative">
            {entries.map((entry, i) => (
              <ExperienceItem key={entry.id} entry={entry} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
