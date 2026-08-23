"use client";

import { useRef, type ReactNode } from "react";
import { useSectionChapter } from "@/hooks/useSectionChapter";
import type { SceneChapter } from "@/lib/scene-state";
import { cn } from "@/lib/utils";

export interface SectionProps {
  id: string;
  chapter: SceneChapter;
  children: ReactNode;
  className?: string;
  /** Adds the subtle technical grid behind this section only. */
  grid?: boolean;
  label?: string;
}

/**
 * Every page section is one of these: it owns its anchor id, tells the WebGL
 * layer which chapter it belongs to, and applies the shared vertical rhythm.
 */
export function Section({
  id,
  chapter,
  children,
  className,
  grid = false,
  label,
}: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  useSectionChapter(ref, chapter);

  return (
    <section
      ref={ref}
      id={id}
      aria-label={label}
      className={cn("content-layer relative", className)}
    >
      {grid && (
        <div
          aria-hidden
          className="tech-grid pointer-events-none absolute inset-0 -z-10"
        />
      )}
      {children}
    </section>
  );
}
