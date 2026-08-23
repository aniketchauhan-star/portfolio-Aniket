import { useEffect, useLayoutEffect } from "react";

/** `useLayoutEffect` on the client, `useEffect` on the server — silences the
 *  SSR warning while keeping pre-paint timing where it matters. */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
