"use client";

import { useSyncExternalStore } from "react";
import { sceneState } from "./scene-state";

/**
 * Whether the preloader has handed the page over. Kept in a tiny external
 * store so the hero can subscribe without the whole page becoming one big
 * client component — the sections still render on the server.
 */
let revealed = false;
const listeners = new Set<() => void>();

export function setRevealed(value: boolean) {
  if (revealed === value) return;
  revealed = value;
  sceneState.revealed = value;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useRevealed(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => revealed,
    () => false,
  );
}
