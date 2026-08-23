"use client";

import {
  useRef,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { registerGsap, gsap } from "@/lib/animations";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { useIsTouch } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

export interface MagneticButtonProps {
  children: ReactNode;
  href?: string;
  external?: boolean;
  onClick?: (e: ReactMouseEvent<HTMLElement>) => void;
  className?: string;
  /** Max pull in px. Kept small so the target never runs from the pointer. */
  strength?: number;
  ariaLabel?: string;
  type?: "button" | "submit";
  /** Custom-cursor state for this control. */
  cursor?: "link" | "open" | "view";
}

/**
 * Pointer-attracted control. The wrapper stays put and only the inner layer
 * translates, so the hit area never moves — the button is always clickable.
 */
export function MagneticButton({
  children,
  href,
  external,
  onClick,
  className,
  strength = 8,
  ariaLabel,
  type = "button",
  cursor = "link",
}: MagneticButtonProps) {
  const wrap = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const isTouch = useIsTouch();
  const reduced = useReducedMotion();
  const enabled = !isTouch && !reduced;

  useIsomorphicLayoutEffect(() => {
    const w = wrap.current;
    const el = inner.current;
    if (!w || !el || !enabled) return;
    registerGsap();

    const xTo = gsap.quickTo(el, "x", { duration: 0.65, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.65, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      const r = w.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      xTo(gsap.utils.clamp(-1, 1, dx) * strength);
      yTo(gsap.utils.clamp(-1, 1, dy) * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    w.addEventListener("mousemove", onMove);
    w.addEventListener("mouseleave", onLeave);
    return () => {
      w.removeEventListener("mousemove", onMove);
      w.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(el);
    };
  }, [enabled, strength]);

  /**
   * The caller's classes land on the INNER span: that keeps the caller's
   * flex/gap rules acting directly on `children`, and means only the painted
   * box translates. The anchor/button keeps its original layout box, so the
   * hit area never runs away from the pointer.
   */
  const content = (
    <span ref={inner} className={cn(className, "will-change-transform")}>
      {children}
    </span>
  );

  return (
    <span ref={wrap} className="inline-block">
      {href ? (
        <a
          href={href}
          aria-label={ariaLabel}
          data-cursor={cursor}
          className="inline-block"
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          onClick={onClick}
        >
          {content}
        </a>
      ) : (
        <button
          type={type}
          aria-label={ariaLabel}
          data-cursor={cursor}
          className="inline-block"
          onClick={onClick}
        >
          {content}
        </button>
      )}
    </span>
  );
}
