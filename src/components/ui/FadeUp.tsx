"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { registerGsap, gsap, EASE } from "@/lib/animations";

export interface FadeUpProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  distance?: number;
  duration?: number;
  play?: boolean;
  disabled?: boolean;
}

/** Content drifting up into place. Deliberately short travel — premium motion
 *  is small motion. */
export function FadeUp({
  children,
  as: Component = "div",
  className,
  delay = 0,
  distance = 22,
  duration = 1.1,
  play,
  disabled = false,
}: FadeUpProps) {
  const root = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    registerGsap();

    const ctx = gsap.context(() => {
      if (disabled) {
        gsap.set(el, { opacity: 1, y: 0 });
        return;
      }
      if (play !== undefined) {
        gsap.set(el, { opacity: 0, y: distance });
        if (!play) return;
      }
      gsap.fromTo(
        el,
        { opacity: 0, y: distance },
        {
          opacity: 1,
          y: 0,
          duration,
          ease: EASE.out,
          delay,
          ...(play === undefined
            ? { scrollTrigger: { trigger: el, start: "top 88%", once: true } }
            : {}),
        },
      );
    }, root);

    return () => ctx.revert();
  }, [play, disabled, delay, distance, duration]);

  // Cast the polymorphic tag to a concrete intrinsic element: the props we
  // pass (ref, className, children) are identical for every tag we allow.
  const Comp = Component as unknown as "div";

  return (
    <Comp ref={root} className={className}>
      {children}
    </Comp>
  );
}
