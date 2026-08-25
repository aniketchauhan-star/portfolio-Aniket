"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Whether anything is standing between the visitor and the WebGL scene.
 *
 * The canvas is fixed behind the whole document and renders continuously. That
 * is the right behaviour while the visitor is reading the page — it is the
 * page's background — and it is pure waste the moment something covers it:
 * an open project overlay, the mobile menu, or the tab being in the background.
 *
 * It matters most on a phone. The project overlay is where the playable builds
 * live, so the worst case is a phone GPU running a game in an iframe *and* a
 * particle field, two rings and a lit robot it cannot see — on a battery, in a
 * thermal envelope that will throttle the game first.
 *
 * Occluders are held by name for the same reason the scroll lock is: the
 * overlays that register here can be layered, and the last one to close is the
 * one that should restart the scene.
 */
const occluders = new Set<string>();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setSceneOccluded(occluded: boolean, owner: string) {
  const before = occluders.size > 0;
  if (occluded) occluders.add(owner);
  else occluders.delete(owner);
  if (occluders.size > 0 !== before) emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSceneOccluded(): boolean {
  const occluded = useSyncExternalStore(
    subscribe,
    () => occluders.size > 0,
    () => false,
  );

  // Backgrounding the tab or switching apps counts too. Browsers already
  // throttle rAF for a hidden tab, but they do not stop it, and on iOS this
  // also covers the app switcher and a locked screen.
  useEffect(() => {
    const onVisibility = () =>
      setSceneOccluded(document.visibilityState === "hidden", "document");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      setSceneOccluded(false, "document");
    };
  }, []);

  return occluded;
}

/** Register an overlay as covering the scene for as long as it is open. */
export function useOccludeScene(active: boolean, owner: string) {
  useEffect(() => {
    if (!active) return;
    setSceneOccluded(true, owner);
    return () => setSceneOccluded(false, owner);
  }, [active, owner]);
}
