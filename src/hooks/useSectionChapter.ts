"use client";

import { useEffect } from "react";
import { sceneState, type SceneChapter } from "@/lib/scene-state";

/**
 * Marks the WebGL "chapter" while a section owns the viewport. Uses an
 * IntersectionObserver rather than a ScrollTrigger so it also settles
 * correctly on refresh-mid-page and on back-navigation.
 */
export function useSectionChapter(
  ref: React.RefObject<HTMLElement | null>,
  chapter: SceneChapter,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) sceneState.chapter = chapter;
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [ref, chapter]);
}
