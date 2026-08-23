"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Bottom-centre hint. Fades out permanently on the first scroll. */
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
    </div>
  );
}
