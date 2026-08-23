"use client";

import { useRef, type ElementType } from "react";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { registerGsap, gsap, EASE } from "@/lib/animations";
import { cn } from "@/lib/utils";

export interface RevealWordsProps {
  /** One entry per visual line; each line is split into words. */
  lines: string[];
  as?: ElementType;
  className?: string;
  /** Extra classes for a whole line, resolved per line index. */
  lineClassName?: (index: number, line: string) => string | undefined;
  stagger?: number;
  disabled?: boolean;
}

/**
 * Word-by-word reveal for editorial statements.
 *
 * Each word rises out of its own clipping mask, cascading across the whole
 * block — a slower, more deliberate read than revealing a line at a time.
 * Splitting stops at words: per-character animation on a paragraph this size
 * reads as a gimmick.
 */
export function RevealWords({
  lines,
  as: Component = "p",
  className,
  lineClassName,
  stagger = 0.045,
  disabled = false,
}: RevealWordsProps) {
  const root = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>(".js-word", el);
      if (!words.length) return;

      if (disabled) {
        gsap.set(words, { yPercent: 0 });
        return;
      }

      gsap.fromTo(
        words,
        { yPercent: 116 },
        {
          yPercent: 0,
          duration: 1.15,
          ease: EASE.type,
          stagger,
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [stagger, disabled]);

  const Comp = Component as unknown as "div";

  return (
    <Comp ref={root} className={className}>
      {lines.map((line, i) => (
        <span
          key={i}
          className={cn("block", lineClassName?.(i, line))}
        >
          {line.split(" ").map((word, w) => (
            <span key={w} className="clip-line inline-block align-bottom">
              <span className="js-word inline-block will-change-transform">
                {word}
                {/* A trailing space inside the mask keeps word spacing intact
                    without letting the gap collapse. */}
                {w < line.split(" ").length - 1 ? " " : ""}
              </span>
            </span>
          ))}
        </span>
      ))}
    </Comp>
  );
}
