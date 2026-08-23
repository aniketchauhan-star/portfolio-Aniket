export type Tier = "high" | "medium" | "low";

export interface QualityProfile {
  tier: Tier;
  /** react-three-fiber dpr clamp — never uncapped devicePixelRatio. */
  dpr: [number, number];
  particles: number;
  /** Icosahedron subdivision for the glass shell. */
  shellDetail: number;
  /** Number of small nodes orbiting the core. */
  nodes: number;
  rings: number;
  /** Build a 256px environment from Lightformers for real reflections. */
  environment: boolean;
}

const PROFILES: Record<Tier, QualityProfile> = {
  high: {
    tier: "high",
    dpr: [1, 1.75],
    particles: 1700,
    shellDetail: 4,
    nodes: 14,
    rings: 3,
    environment: true,
  },
  medium: {
    tier: "medium",
    dpr: [1, 1.4],
    particles: 850,
    shellDetail: 3,
    nodes: 8,
    rings: 3,
    environment: true,
  },
  low: {
    tier: "low",
    dpr: [1, 1.15],
    particles: 360,
    shellDetail: 2,
    nodes: 5,
    rings: 2,
    environment: false,
  },
};

export const profileFor = (tier: Tier): QualityProfile => PROFILES[tier];

/**
 * Best-effort device classification, run once before the canvas mounts.
 * `AdaptivePerformance` corrects this at runtime if the guess was optimistic.
 */
export function detectTier(): Tier {
  if (typeof window === "undefined") return "medium";

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const narrow = window.innerWidth < 768;

  if (coarse || narrow) return cores >= 8 && memory >= 6 ? "medium" : "low";
  if (cores >= 8 && memory >= 8) return "high";
  if (cores >= 4) return "medium";
  return "low";
}

/** Cheap WebGL2/WebGL capability probe. Runs once, result cached. */
let webglSupport: boolean | null = null;
export function hasWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    webglSupport = Boolean(gl);
    if (gl && "getExtension" in gl) {
      (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}
