"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { registerGsap, gsap, EASE } from "@/lib/animations";
import { cn } from "@/lib/utils";

export interface RevealTextProps {
  /** One entry per visual line. */
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  /**
   * `undefined` → reveal on scroll.
   * `true`/`false` → controlled; reveals the moment it flips to true.
   */
  play?: boolean;
  /** Skip the mask animation entirely (reduced motion). */
  disabled?: boolean;
}

/**
 * Type rising out of a clipping mask — the single reveal primitive used for
 * every heading on the site.
 */
export function RevealText({
  lines,
  as: Component = "div",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.08,
  duration = 1.25,
  play,
  disabled = false,
}: RevealTextProps) {
  const root = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    registerGsap();

    const ctx = gsap.context(() => {
      const inners = gsap.utils.toArray<HTMLElement>(".js-reveal-inner", el);
      if (!inners.length) return;

      if (disabled) {
        gsap.set(inners, { yPercent: 0, opacity: 1 });
        return;
      }

      // Controlled mode: hold hidden until `play` turns true.
      if (play !== undefined) {
        gsap.set(inners, { yPercent: 118 });
        if (!play) return;
      }

      gsap.fromTo(
        inners,
        { yPercent: 118 },
        {
          yPercent: 0,
          duration,
          ease: EASE.type,
          stagger,
          delay,
          ...(play === undefined
            ? { scrollTrigger: { trigger: el, start: "top 85%", once: true } }
            : {}),
        },
      );
    }, root);

    return () => ctx.revert();
  }, [play, disabled, delay, stagger, duration]);

  // Cast the polymorphic tag to a concrete intrinsic element: the props we
  // pass (ref, className, children) are identical for every tag we allow.
  const Comp = Component as unknown as "div";

  return (
    <Comp ref={root} className={className}>
      {lines.map((line, i) => (
        <span key={i} className={cn("clip-line", lineClassName)}>
          <span className="js-reveal-inner block will-change-transform">
            {line}
          </span>
        </span>
      ))}
    </Comp>
  );
}
