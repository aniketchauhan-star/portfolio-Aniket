"use client";

import { useEffect, useRef, useState } from "react";
import { registerGsap, gsap } from "@/lib/animations";
import { useIsTouch } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type CursorMode = "default" | "link" | "open" | "view" | "drag";

/** Ring size and label per state. Labelled states hide the centre dot. */
const MODES: Record<CursorMode, { size: number; label?: string }> = {
  default: { size: 30 },
  link: { size: 52 },
  open: { size: 66, label: "OPEN \u2197" },
  view: { size: 78, label: "VIEW" },
  drag: { size: 66, label: "DRAG" },
};

/**
 * Desktop-only two-part cursor: a precise dot that tracks 1:1 and a ring that
 * trails behind it. Disabled entirely for touch and reduced-motion visitors,
 * who keep their native cursor.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<CursorMode>("default");
  const isTouch = useIsTouch();
  const reduced = useReducedMotion();
  const enabled = !isTouch && !reduced;

  useEffect(() => {
    if (!enabled) {
      document.documentElement.removeAttribute("data-cursor");
      return;
    }
    document.documentElement.setAttribute("data-cursor", "custom");
    return () => document.documentElement.removeAttribute("data-cursor");
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const d = dot.current;
    const r = ring.current;
    if (!d || !r) return;

    registerGsap();
    gsap.set([d, r], { xPercent: -50, yPercent: -50, opacity: 0 });

    const dx = gsap.quickTo(d, "x", { duration: 0.08, ease: "none" });
    const dy = gsap.quickTo(d, "y", { duration: 0.08, ease: "none" });
    const rx = gsap.quickTo(r, "x", { duration: 0.5, ease: "power3.out" });
    const ry = gsap.quickTo(r, "y", { duration: 0.5, ease: "power3.out" });

    let shown = false;

    const onMove = (e: MouseEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([d, r], { opacity: 1, duration: 0.4 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);

      const target = e.target as HTMLElement | null;
      const hit = target?.closest?.("[data-cursor]") as HTMLElement | null;
      const raw = hit?.dataset.cursor;
      // <html> also carries data-cursor="custom", and closest() will find it —
      // anything not in MODES falls back to the default state.
      const next: CursorMode =
        raw && raw in MODES ? (raw as CursorMode) : "default";
      setMode((prev) => (prev === next ? prev : next));
    };

    const onLeave = () => {
      shown = false;
      gsap.to([d, r], { opacity: 0, duration: 0.25 });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf([d, r]);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const r = ring.current;
    const d = dot.current;
    if (!r || !d) return;
    const spec = MODES[mode];
    gsap.to(r, {
      width: spec.size,
      height: spec.size,
      borderColor:
        mode === "default"
          ? "rgba(244,246,255,0.34)"
          : "rgba(108,243,255,0.62)",
      backgroundColor: spec.label
        ? "rgba(108,243,255,0.08)"
        : "rgba(108,243,255,0)",
      duration: 0.45,
      ease: "power3.out",
    });
    // The dot would sit on top of the label, so it retracts for those states.
    gsap.to(d, {
      scale: spec.label ? 0 : 1,
      duration: 0.35,
      ease: "power3.out",
    });
  }, [mode, enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[999]">
      <div
        ref={ring}
        className="fixed top-0 left-0 flex h-[30px] w-[30px] items-center justify-center rounded-full border will-change-transform"
        style={{ borderColor: "rgba(244,246,255,0.34)" }}
      >
        <span
          className="font-mono text-[9px] whitespace-nowrap tracking-[0.22em] text-[var(--color-cyan)] transition-opacity duration-300"
          style={{ opacity: MODES[mode].label ? 1 : 0 }}
        >
          {MODES[mode].label ?? ""}
        </span>
      </div>
      <div
        ref={dot}
        className="fixed top-0 left-0 h-[5px] w-[5px] rounded-full bg-[var(--color-ink)] will-change-transform"
      />
    </div>
  );
}
