"use client";

import { useRef, useState } from "react";
import type { ExperienceEntry } from "@/data/profile";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { registerGsap, gsap, EASE } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { PlaceholderChip } from "@/components/ui/PlaceholderChip";
import { firePulse } from "@/lib/scene-state";
import { cn } from "@/lib/utils";

/**
 * One node on the timeline. Activating it sends a small light pulse through
 * the robot in the background — a hand-off between the DOM and the
 * WebGL layer, not a separate effect.
 */
export function ExperienceItem({
  entry,
  index,
}: {
  entry: ExperienceEntry;
  index: number;
}) {
  const root = useRef<HTMLLIElement>(null);
  const [active, setActive] = useState(false);
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    registerGsap();

    const ctx = gsap.context(() => {
      if (reduced) {
        setActive(true);
        return;
      }

      gsap.fromTo(
        el,
        { opacity: 0, y: 42 },
        {
          opacity: 1,
          y: 0,
          duration: 1.15,
          ease: EASE.out,
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
            once: true,
            onEnter: () => {
              setActive(true);
              firePulse(0.55);
            },
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <li
      ref={root}
      className="group relative grid grid-cols-[auto_1fr] gap-x-6 pb-16 last:pb-0 md:grid-cols-[12rem_auto_1fr] md:gap-x-10 lg:pb-24"
    >
      {/* Period (desktop column) ------------------------------------- */}
      <span className="label label-bright order-2 pt-1 md:order-none md:text-right">
        {entry.period}
      </span>

      {/* Node --------------------------------------------------------- */}
      <span
        aria-hidden
        className="relative order-1 flex w-4 justify-center md:order-none"
      >
        <span
          className={cn(
            "mt-2 h-2 w-2 shrink-0 rounded-full transition-all duration-700",
            active
              ? "bg-[var(--color-cyan)] shadow-[0_0_14px_2px_rgba(108,243,255,0.55)]"
              : "bg-[rgba(244,246,255,0.18)]",
            "group-hover:shadow-[0_0_20px_4px_rgba(108,243,255,0.6)]",
          )}
        />
      </span>

      {/* Content ------------------------------------------------------ */}
      <div className="order-3 col-span-2 mt-4 md:order-none md:col-span-1 md:mt-0">
        <div className="flex flex-wrap items-center gap-3">
          <span className="label">{String(index + 1).padStart(2, "0")}</span>
          {entry.location && (
            <span className="label label-bright">{entry.location}</span>
          )}
          {entry.placeholder && <PlaceholderChip />}
        </div>

        <h3 className="display-md mt-4 text-[var(--color-ink)]">
          {entry.company}
        </h3>

        <p className="mt-2 font-mono text-[0.72rem] tracking-[0.2em] text-[var(--color-cyan)]">
          {entry.role.toUpperCase()}
        </p>

        {entry.summary && (
          <p className="body-base mt-5 max-w-[58ch]">{entry.summary}</p>
        )}

        {entry.highlights && entry.highlights.length > 0 && (
          <ul className="mt-6 flex flex-col gap-2.5">
            {entry.highlights.map((h) => (
              <li
                key={h}
                className="body-base flex max-w-[58ch] gap-3 before:mt-[0.7em] before:h-px before:w-4 before:shrink-0 before:bg-[var(--color-line)] before:content-['']"
              >
                {h}
              </li>
            ))}
          </ul>
        )}

        {entry.tech && entry.tech.length > 0 && (
          <ul className="mt-7 flex flex-wrap gap-2">
            {entry.tech.map((t) => (
              <li
                key={t}
                className="rounded-full border border-[var(--color-line-soft)] px-3 py-1.5 font-mono text-[0.5875rem] tracking-[0.16em] text-[var(--color-faint)]"
              >
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
