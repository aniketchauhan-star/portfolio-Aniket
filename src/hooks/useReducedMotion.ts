"use client";

import { useEffect, useState } from "react";
import { sceneState } from "@/lib/scene-state";

/**
 * `prefers-reduced-motion: reduce`. Mirrors the value into `sceneState` so the
 * WebGL layer can respect it without subscribing to React.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      setReduced(mql.matches);
      sceneState.reducedMotion = mql.matches;
    };
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
