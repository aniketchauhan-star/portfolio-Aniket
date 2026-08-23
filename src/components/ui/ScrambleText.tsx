"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const GLYPHS = "AC01/+×";

export interface ScrambleTextProps {
  text: string;
  className?: string;
  /** Total resolve time in ms. Keep it short — scrambling should feel like a
   *  signal locking on, never like a loading state. */
  duration?: number;
  delay?: number;
  /** Re-run whenever this value changes (e.g. the active skill group). */
  trigger?: string | number;
  /** Wait until the element scrolls into view. */
  onView?: boolean;
  disabled?: boolean;
}

/**
 * Resolves a short label through a handful of technical glyphs.
 *
 * Used sparingly — never on paragraphs, never on a loop. The animation writes
 * straight to the DOM node instead of through state, so a 500ms scramble does
 * not cost 30 React renders.
 */
export function ScrambleText({
  text,
  className,
  duration = 520,
  delay = 0,
  trigger,
  onView = true,
  disabled = false,
}: ScrambleTextProps) {
  const host = useRef<HTMLSpanElement>(null);
  const glyphs = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (disabled) return;
    const out = glyphs.current;
    const el = host.current;
    if (!out || !el) return;

    let raf = 0;
    let startTimer = 0;
    let cancelled = false;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const t = Math.min(1, (now - start) / duration);
        // Eased so the final characters snap rather than crawl.
        const resolved = Math.floor(text.length * (1 - Math.pow(1 - t, 2)));
        let s = "";
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (i < resolved || ch === " ") s += ch;
          else s += GLYPHS[(i * 7 + Math.floor(now / 42)) % GLYPHS.length];
        }
        out.textContent = s;
        if (t < 1) raf = requestAnimationFrame(tick);
        else out.textContent = text;
      };
      raf = requestAnimationFrame(tick);
    };

    const begin = () => {
      startTimer = window.setTimeout(run, delay);
    };

    let io: IntersectionObserver | undefined;
    if (onView) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            begin();
            io?.disconnect();
          }
        },
        { threshold: 0.4 },
      );
      io.observe(el);
    } else {
      begin();
    }

    return () => {
      cancelled = true;
      io?.disconnect();
      if (startTimer) clearTimeout(startTimer);
      if (raf) cancelAnimationFrame(raf);
      out.textContent = text;
    };
  }, [text, duration, delay, trigger, onView, disabled]);

  return (
    <span ref={host} className={cn("tabular-nums", className)}>
      {/* Screen readers always get the resolved string. */}
      <span ref={glyphs} aria-hidden>
        {text}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
