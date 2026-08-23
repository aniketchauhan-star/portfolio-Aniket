"use client";

import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { registerGsap, gsap, EASE } from "@/lib/animations";
import { cn } from "@/lib/utils";

export interface RevealLineProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
  delay?: number;
  duration?: number;
  disabled?: boolean;
}

/** A hairline that draws itself in as it enters the viewport. */
export function RevealLine({
  className,
  orientation = "horizontal",
  delay = 0,
  duration = 1.4,
  disabled = false,
}: RevealLineProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const axis = orientation === "horizontal" ? "scaleX" : "scaleY";
      if (disabled) {
        gsap.set(el, { [axis]: 1 });
        return;
      }
      gsap.fromTo(
        el,
        { [axis]: 0 },
        {
          [axis]: 1,
          duration,
          ease: EASE.inOut,
          delay,
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        },
      );
    }, ref);

    return () => ctx.revert();
  }, [orientation, delay, duration, disabled]);

  return (
    <span
      ref={ref}
      aria-hidden
      className={cn(
        "block bg-[var(--color-line)]",
        orientation === "horizontal"
          ? "h-px w-full origin-left"
          : "w-px h-full origin-top",
        className,
      )}
    />
  );
}
