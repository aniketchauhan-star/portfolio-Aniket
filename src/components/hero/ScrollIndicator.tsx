"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * "There is more below."
 *
 * Two readings of the same hint, because the space available for it is
 * completely different on the two devices:
 *
 *  · Desktop — a tall hairline with a light travelling down it, floated in the
 *    empty band between the hero controls and the metadata strip.
 *  · Phone — that band does not exist. A 14rem-tall indicator pinned above the
 *    metadata strip would land on top of the call-to-action buttons on any
 *    short screen, which is why it used to be hidden below `md` and a phone
 *    got no hint at all. So the phone gets a compact in-flow version instead:
 *    a short tick and a caption, sitting in the layout rather than over it,
 *    where it cannot collide with anything.
 *
 * Both fade out permanently on the first scroll.
 */
export function ScrollIndicator() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 24) {
        setHidden(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Phone — in flow, above the metadata strip. */}
      <div
        aria-hidden
        className={cn(
          "hero-scroll-hint pointer-events-none mb-7 flex w-full flex-col items-center gap-2 transition-all duration-700 md:hidden",
          hidden ? "translate-y-1 opacity-0" : "opacity-100",
        )}
      >
        <span className="relative block h-8 w-px overflow-hidden bg-[var(--color-line)]">
          <span className="scroll-tick absolute inset-x-0 top-0 h-3 bg-[linear-gradient(180deg,transparent,var(--color-cyan))]" />
        </span>
        <span className="label">SCROLL</span>
      </div>

      {/* Desktop — floated in the empty band. */}
      <div
        aria-hidden
        className={cn(
          "hero-scroll-hint pointer-events-none absolute bottom-[6.5rem] left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 transition-all duration-700 md:flex",
          hidden ? "translate-y-2 opacity-0" : "opacity-100",
        )}
      >
        <span className="label">SCROLL TO EXPLORE</span>
        <span className="relative block h-14 w-px overflow-hidden bg-[var(--color-line)]">
          <span className="scroll-tick absolute inset-x-0 top-0 h-5 bg-[linear-gradient(180deg,transparent,var(--color-cyan))]" />
        </span>
      </div>

      <style>{`
        @keyframes scrollTick {
          0%   { transform: translateY(-100%); opacity: 0; }
          25%  { opacity: 1; }
          75%  { opacity: 1; }
          100% { transform: translateY(280%); opacity: 0; }
        }
        .scroll-tick { animation: scrollTick 2.6s cubic-bezier(0.65,0,0.35,1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .scroll-tick { animation: none; opacity: 0.6; transform: none; }
        }
      `}</style>
    </>
  );
}
