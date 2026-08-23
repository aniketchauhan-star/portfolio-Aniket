"use client";

import { useRef, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import { sceneState, coreLive } from "@/lib/scene-state";
import { chapterState } from "@/lib/scene-choreography";
import { damp } from "@/lib/utils";

/**
 * Owns the transform shared by the robot and its rings.
 *
 * Runs at priority -1 so the damped values in `coreLive` are already fresh
 * when the child components read them later in the same frame.
 */
export function CoreRig({ children }: { children: ReactNode }) {
  const group = useRef<Group>(null);
  const spin = useRef(0);
  const turn = useRef(0);
  const breathe = useRef(0);
  const width = useThree((s) => s.size.width);

  // Narrow viewports pull the robot toward centre and shrink it, rather than
  // letting a desktop composition run off the edge of a phone. The pull is
  // harder than it was for the old sphere: a sphere clipped by the right edge
  // still reads as a sphere, whereas half a robot reads as debris.
  const narrow = width < 640;
  const offsetFactor = narrow ? 0.32 : width < 1024 ? 0.72 : width < 1280 ? 0.92 : 1;
  const sizeFactor = narrow ? 0.82 : width < 1024 ? 0.9 : 1;

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;

    // Guard against long frames after a tab regains focus.
    const dt = Math.min(delta, 1 / 20);
    const base = chapterState(sceneState.chapter);
    const reduced = sceneState.reducedMotion;

    // Each project gives the robot a distinct posture: the first turns it, the
    // second opens the rings, the third reorganises the particle field. The
    // scene is modulated, never rebuilt.
    const p = sceneState.activeProject;
    const inProjects = sceneState.chapter === "projects" && p >= 0;
    const target = inProjects
      ? {
          ...base,
          spin: base.spin + p * 0.35,
          ringSpread: base.ringSpread + (p % 3 === 1 ? 0.4 : 0),
          particleSpread: base.particleSpread + (p % 3 === 2 ? 0.35 : 0),
          energy: base.energy + (p % 3 === 2 ? 0.12 : 0),
        }
      : base;

    // Pointer parallax on the object itself — deliberately tiny.
    const px = sceneState.pointerX;
    const py = sceneState.pointerY;

    // In the two chapters where the subject is in the foreground, a phone has
    // no horizontal room to put it beside the copy — so it lifts into the
    // empty band above the hero text instead of sitting behind the name. The
    // mid chapters are already high and far, and need no lift.
    const foreground =
      sceneState.chapter === "hero" || sceneState.chapter === "contact";
    const lift = narrow && foreground ? 1.45 : 0;

    g.position.x = damp(g.position.x, target.x * offsetFactor, 0.0015, dt);
    g.position.y = damp(g.position.y, target.y + lift + py * 0.12, 0.0015, dt);
    g.position.z = damp(g.position.z, target.z, 0.0015, dt);

    const s = damp(g.scale.x, target.scale * sizeFactor, 0.0015, dt);
    g.scale.setScalar(s);

    if (!reduced) {
      // An OSCILLATION, not an accumulation. The subject has a face: a spin
      // that keeps adding turns it away and never brings it back, so instead
      // it sways ±0.5rad about front and always returns. The per-chapter
      // `spin` offsets below still stack on top of this.
      turn.current += dt;
      spin.current = Math.sin(turn.current * 0.17) * 0.5;
      breathe.current += dt;
    }

    g.rotation.y = damp(
      g.rotation.y,
      spin.current + target.spin + px * 0.16,
      0.004,
      dt,
    );
    g.rotation.x = damp(g.rotation.x, -py * 0.1, 0.004, dt);

    // Slow breathing — the machine is alive, not idling.
    const breath = reduced ? 0 : Math.sin(breathe.current * 0.55) * 0.014;
    g.scale.multiplyScalar(1 + breath);

    // Decay the experience-timeline light pulse.
    sceneState.pulse = damp(sceneState.pulse, 0, 0.02, dt);

    coreLive.ringAlign = damp(coreLive.ringAlign, target.ringAlign, 0.002, dt);
    coreLive.ringSpread = damp(
      coreLive.ringSpread,
      target.ringSpread,
      0.002,
      dt,
    );
    coreLive.energy = damp(
      coreLive.energy,
      target.energy * (reduced ? 0.85 : 1),
      0.002,
      dt,
    );
    coreLive.particleSpread = damp(
      coreLive.particleSpread,
      target.particleSpread,
      0.003,
      dt,
    );
    coreLive.pulse = damp(coreLive.pulse, sceneState.pulse, 0.001, dt);
    coreLive.attract = damp(coreLive.attract, sceneState.attract, 0.01, dt);
  }, -1);

  return <group ref={group}>{children}</group>;
}
