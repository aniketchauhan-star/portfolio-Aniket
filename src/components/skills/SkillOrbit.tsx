"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SkillGroup } from "@/data/profile";
import { damp } from "@/lib/utils";
import { OrbitPlanet } from "./OrbitPlanet";
import { sceneState } from "@/lib/scene-state";
import { cn } from "@/lib/utils";

interface OrbitRing {
  /** Horizontal radius as a fraction of the container. */
  rx: number;
  /** Vertical radius — smaller, which is what creates the tilted plane. */
  ry: number;
  speed: number;
}

/** Four rings so up to four disciplines each get their own orbit and can
 *  never sit at the same radius. */
const RINGS: OrbitRing[] = [
  { rx: 0.23, ry: 0.235, speed: 0.098 },
  { rx: 0.29, ry: 0.28, speed: -0.074 },
  { rx: 0.35, ry: 0.325, speed: 0.056 },
  { rx: 0.41, ry: 0.37, speed: -0.042 },
];

/**
 * Slow orbital arrangement of the capability groups, built in the DOM rather
 * than in WebGL: the nodes stay real focusable buttons, the labels stay
 * selectable text, and there is no second canvas competing with the scene.
 *
 * One rAF loop writes transforms for a handful of nodes — no React state is
 * touched per frame.
 */
export function SkillOrbit({
  groups,
  activeId,
  onActivate,
}: {
  groups: SkillGroup[];
  activeId: string | null;
  onActivate: (id: string | null) => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLButtonElement | null)[]>([]);
  const speedScale = useRef(1);
  const [hovered, setHovered] = useState<string | null>(null);

  // Golden-angle spacing rather than even division: with rings turning at
  // different speeds, evenly spaced starts drift into clusters where two
  // labels overlap. This keeps them apart for far longer.
  const angles = useMemo(
    () => groups.map((_, i) => i * 2.39996323),
    [groups],
  );

  const paused = Boolean(hovered || activeId);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const reduced = sceneState.reducedMotion;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;

      // Hovering slows the system rather than stopping it dead.
      speedScale.current = damp(
        speedScale.current,
        paused ? 0.12 : 1,
        0.002,
        dt,
      );

      const box = wrap.current;
      if (!box) return;
      const w = box.clientWidth;
      const h = box.clientHeight;

      groups.forEach((group, i) => {
        const el = nodes.current[i];
        if (!el) return;
        const ring = RINGS[i % RINGS.length];

        if (!reduced) {
          angles[i] += dt * ring.speed * speedScale.current;
        }

        const a = angles[i];
        const x = Math.cos(a) * ring.rx * w;
        const y = Math.sin(a) * ring.ry * h;
        // sin(a) also encodes depth: +1 is nearest the viewer.
        const depth = (Math.sin(a) + 1) / 2;
        const scale = 0.82 + depth * 0.26;
        const isActive = activeId === group.id || hovered === group.id;

        el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${
          isActive ? scale * 1.1 : scale
        })`;
        el.style.opacity = String(isActive ? 1 : 0.42 + depth * 0.5);
        el.style.zIndex = String(10 + Math.round(depth * 10));
      });
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [groups, angles, paused, activeId, hovered]);

  const toggle = useCallback(
    (id: string) => onActivate(activeId === id ? null : id),
    [activeId, onActivate],
  );

  return (
    <div
      ref={wrap}
      className="relative mx-auto aspect-[1/0.68] w-full max-w-[44rem]"
    >
      {/* Orbit paths ------------------------------------------------------ */}
      {RINGS.slice(0, Math.min(RINGS.length, groups.length)).map((ring, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border"
          style={{
            width: `${ring.rx * 200}%`,
            height: `${ring.ry * 200}%`,
            borderColor: [
              "rgba(108,243,255,0.14)",
              "rgba(132,107,255,0.11)",
              "rgba(78,125,255,0.09)",
              "rgba(244,246,255,0.07)",
            ][i % 4],
          }}
        />
      ))}

      {/* Centre — the gas giant the disciplines orbit -------------------- */}
      <OrbitPlanet
        className="[--planet-size:7rem] sm:[--planet-size:8rem] lg:[--planet-size:9rem]"
      />

      {/* Nodes ------------------------------------------------------------ */}
      <div className="absolute inset-0">
        {groups.map((group, i) => {
          const isActive = activeId === group.id;
          return (
            <button
              key={group.id}
              ref={(el) => {
                nodes.current[i] = el;
              }}
              type="button"
              data-cursor="link"
              aria-pressed={isActive}
              onMouseEnter={() => setHovered(group.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(group.id)}
              onBlur={() => setHovered(null)}
              onClick={() => toggle(group.id)}
              className={cn(
                "absolute top-1/2 left-1/2 -ml-[3.75rem] -mt-[1.1875rem] flex h-[2.375rem] w-[7.5rem] items-center justify-center rounded-full border px-3 backdrop-blur-md transition-colors duration-500",
                isActive
                  ? "border-[color-mix(in_oklab,var(--color-cyan)_46%,transparent)] bg-[rgba(108,243,255,0.09)]"
                  : "border-[var(--color-line)] bg-[rgba(255,255,255,0.028)] hover:border-[color-mix(in_oklab,var(--color-cyan)_30%,transparent)]",
              )}
            >
              <span
                className={cn(
                  "font-mono text-[0.5875rem] tracking-[0.2em] whitespace-nowrap transition-colors duration-400",
                  isActive
                    ? "text-[var(--color-ink)]"
                    : "text-[var(--color-mute)]",
                )}
              >
                {group.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
