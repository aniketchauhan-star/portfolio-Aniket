/** Tiny class-name joiner — avoids pulling in clsx for a handful of call sites. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export const clamp = (v: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frame-rate independent smoothing. `smoothing` is the fraction remaining
 *  after one second, so smaller = snappier. */
export const damp = (
  current: number,
  target: number,
  smoothing: number,
  dt: number,
) => lerp(current, target, 1 - Math.pow(smoothing, dt));

/** Maps `v` from [inMin,inMax] to [outMin,outMax], clamped. */
export const mapRange = (
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) => {
  if (inMax === inMin) return outMin;
  const t = clamp((v - inMin) / (inMax - inMin));
  return outMin + (outMax - outMin) * t;
};

/** "01", "02", ... — used for every section and project index. */
export const pad2 = (n: number) => String(n).padStart(2, "0");

export const isBrowser = typeof window !== "undefined";
