"use client";

import { useEffect, useRef, useState } from "react";
import { registerGsap, gsap, EASE } from "@/lib/animations";
import { profile } from "@/data/profile";
import { sceneState } from "@/lib/scene-state";
import { setScrollLocked } from "./SmoothScroll";

const PHASES = [
  { at: 0, text: "INITIALIZING" },
  { at: 24, text: "CALIBRATING INTERFACE" },
  { at: 60, text: "LOADING EXPERIENCE" },
  { at: 96, text: "READY" },
];

const R = 46;
const CIRCUMFERENCE = 2 * Math.PI * R;

/**
 * A short, deliberate entrance.
 *
 * The counter is one eased tween rather than fake random ticks, and it writes
 * to the DOM directly — a preloader that re-rendered React sixty times a
 * second would be the slowest thing on the page.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const pctEl = useRef<HTMLSpanElement>(null);
  const phaseEl = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    registerGsap();
    setScrollLocked(true);

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(failSafe);
      sceneState.revealed = true;
      setScrollLocked(false);
      onDone();
    };

    /**
     * Hard ceiling on the entrance. GSAP's lag smoothing stretches timelines
     * on a struggling device, and nobody should be held at a loading screen
     * because their phone is slow — after this the page reveals regardless.
     */
    const failSafe = window.setTimeout(() => {
      finish();
      setGone(true);
    }, 4200);

    const paint = (v: number) => {
      if (pctEl.current) {
        pctEl.current.textContent = String(Math.round(v)).padStart(3, "0");
      }
      if (phaseEl.current) {
        const next = [...PHASES].reverse().find((p) => v >= p.at);
        if (next && phaseEl.current.textContent !== next.text) {
          phaseEl.current.textContent = next.text;
        }
      }
      if (ring.current) {
        ring.current.style.strokeDashoffset = String(
          CIRCUMFERENCE * (1 - v / 100),
        );
      }
    };

    if (reduced) {
      paint(100);
      const t = window.setTimeout(() => {
        finish();
        setGone(true);
      }, 300);
      return () => {
        window.clearTimeout(t);
        window.clearTimeout(failSafe);
        setScrollLocked(false);
      };
    }

    const counter = { v: 0 };

    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .to(counter, {
          v: 100,
          duration: 1.7,
          ease: "power2.inOut",
          onUpdate: () => paint(counter.v),
        })
        // The ring opens outward and the whole plate lifts away.
        .to(".js-pre-ring", {
          scale: 1.35,
          opacity: 0,
          duration: 1.1,
          ease: EASE.out,
        })
        .to(
          ".js-pre-mark",
          { scale: 1.06, opacity: 0, duration: 0.8, ease: EASE.out },
          "<",
        )
        .to(
          ".js-pre-meta",
          { opacity: 0, y: -8, duration: 0.5, ease: "power2.out" },
          "<",
        )
        .to(
          root.current,
          {
            clipPath: "inset(0% 0% 100% 0%)",
            duration: 1.0,
            ease: EASE.inOut,
            onStart: finish,
            onComplete: () => setGone(true),
          },
          "-=0.55",
        );
    }, root);

    return () => {
      ctx.revert();
      window.clearTimeout(failSafe);
      setScrollLocked(false);
    };
  }, [onDone]);

  if (gone) return null;

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#000]"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="relative flex h-[132px] w-[132px] items-center justify-center">
        <svg
          className="js-pre-ring absolute inset-0 -rotate-90"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="rgba(244,246,255,0.07)"
            strokeWidth="0.6"
          />
          <circle
            ref={ring}
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="#6CF3FF"
            strokeWidth="0.6"
            strokeLinecap="round"
            style={{
              strokeDasharray: CIRCUMFERENCE,
              strokeDashoffset: CIRCUMFERENCE,
            }}
          />
        </svg>

        <span className="js-pre-mark font-display text-[1.55rem] leading-none tracking-[-0.04em] text-[var(--color-ink)]">
          {profile.monogram}
        </span>
      </div>

      <div className="js-pre-meta absolute bottom-[14vh] left-1/2 flex w-full max-w-[420px] -translate-x-1/2 items-baseline justify-between px-8">
        <span ref={phaseEl} className="label label-bright">
          {PHASES[0].text}
        </span>
        <span ref={pctEl} className="label label-bright tabular-nums">
          000
        </span>
      </div>
    </div>
  );
}
