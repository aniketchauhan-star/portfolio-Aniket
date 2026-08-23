/**
 * Shared, mutable state bridging the DOM layer and the WebGL layer.
 *
 * Deliberately NOT React state: scroll progress and pointer position update
 * every frame, and pushing that through React would re-render the tree 60
 * times a second. `useFrame` reads this object directly instead.
 */

export type SceneChapter =
  | "hero"
  | "about"
  | "skills"
  | "projects"
  | "experience"
  | "knowledge"
  | "contact";

export interface SceneState {
  /** 0 → 1 across the whole document. */
  scroll: number;
  /** Normalised pointer, -1 → 1 on both axes. 0,0 is centre. */
  pointerX: number;
  pointerY: number;
  /** Which narrative chapter the viewport is in. Drives the core's state. */
  chapter: SceneChapter;
  /** 0 → 1 progress inside the projects section. */
  projectProgress: number;
  /** Index of the active project, -1 when none. */
  activeProject: number;
  /** Rises to 1 briefly when a timeline node activates — a light pulse. */
  pulse: number;
  /** 0 → 1, how strongly particles gather at the contact CTA. */
  attract: number;
  /** Set once the preloader has finished; gates the entrance animation. */
  revealed: boolean;
  /** Quality tier resolved by AdaptivePerformance. */
  tier: "high" | "medium" | "low";
  /** True when the visitor asked for reduced motion. */
  reducedMotion: boolean;
}

export const sceneState: SceneState = {
  scroll: 0,
  pointerX: 0,
  pointerY: 0,
  chapter: "hero",
  projectProgress: 0,
  activeProject: -1,
  pulse: 0,
  attract: 0,
  revealed: false,
  tier: "high",
  reducedMotion: false,
};

/** Fire a short light pulse through the identity core. */
export const firePulse = (strength = 1) => {
  sceneState.pulse = Math.min(1, sceneState.pulse + strength);
};

/**
 * Damped, per-frame values written once by <CoreRig /> and read by every other
 * WebGL component in the same frame. Keeps the core, its rings and the
 * particle field perfectly in step without prop drilling or re-renders.
 */
export const coreLive = {
  ringAlign: 0,
  ringSpread: 1,
  energy: 1,
  particleSpread: 1,
  pulse: 0,
  attract: 0,
};
