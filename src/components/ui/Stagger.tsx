"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { registerGsap, gsap, EASE } from "@/lib/animations";

export interface StaggerProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Selector for the children to stagger. Defaults to direct children. */
  selector?: string;
  delay?: number;
  stagger?: number;
  distance?: number;
  disabled?: boolean;
}

/** Reveals a list of siblings with a 50–80ms cascade. */
export function Stagger({
  children,
  as: Component = "div",
  className,
  selector,
  delay = 0,
  stagger = 0.07,
  distance = 26,
  disabled = false,
}: StaggerProps) {
  const root = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const items = selector
        ? gsap.utils.toArray<HTMLElement>(selector, el)
        : (Array.from(el.children) as HTMLElement[]);
      if (!items.length) return;

      if (disabled) {
        gsap.set(items, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        items,
        { opacity: 0, y: distance },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: EASE.out,
          stagger,
          delay,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [selector, delay, stagger, distance, disabled]);

  // Cast the polymorphic tag to a concrete intrinsic element: the props we
  // pass (ref, className, children) are identical for every tag we allow.
  const Comp = Component as unknown as "div";

  return (
    <Comp ref={root} className={className}>
      {children}
    </Comp>
  );
}
