"use client";

import dynamic from "next/dynamic";
import { useCallback } from "react";
import { Preloader } from "./Preloader";
import { SmoothScroll } from "./SmoothScroll";
import { Cursor } from "@/components/ui/Cursor";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { setRevealed } from "@/lib/reveal-store";

/**
 * The persistent WebGL canvas is the single heaviest thing on the page, so it
 * is code-split and never server-rendered: the HTML paints first, the scene
 * arrives behind the preloader.
 */
const Scene = dynamic(() => import("@/components/three/Scene"), {
  ssr: false,
  loading: () => null,
});

/**
 * Everything that lives outside the document flow: the 3D layer, the
 * preloader, the cursor, the grain and the progress hairline.
 */
export function Chrome() {
  const onDone = useCallback(() => setRevealed(true), []);

  return (
    <>
      <Scene />
      <SmoothScroll />
      <ScrollProgress />
      <NoiseOverlay />
      <Cursor />
      <Preloader onDone={onDone} />
    </>
  );
}
