"use client";

import { useEffect, useRef } from "react";

/** Decorative X / Y pointer coordinates. Desktop only, never on touch. */
export function PointerReadout() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      el.textContent = `X ${String(Math.round(x)).padStart(4, "0")}  Y ${String(
        Math.round(y),
      ).padStart(4, "0")}`;
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden
      className="label label-bright tabular-nums hidden lg:inline"
    >
      X 0000  Y 0000
    </span>
  );
}
