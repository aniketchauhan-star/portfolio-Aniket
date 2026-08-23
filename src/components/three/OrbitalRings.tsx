"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { coreLive } from "@/lib/scene-state";
import type { QualityProfile } from "@/lib/quality";
import { RING_VERT, RING_FRAG } from "./shaders";
import { lerp } from "@/lib/utils";

interface RingSpec {
  radius: number;
  /** Resting tilt, in radians. Damped toward 0 as `ringAlign` approaches 1. */
  tilt: [number, number, number];
  color: string;
  speed: number;
  offset: number;
}

const RINGS: RingSpec[] = [
  { radius: 0.82, tilt: [1.32, 0.2, 0.12], color: "#6CF3FF", speed: 0.055, offset: 0 },
  { radius: 1.0, tilt: [0.42, 0.9, -0.55], color: "#846BFF", speed: -0.038, offset: 0.33 },
  { radius: 1.22, tilt: [1.05, -0.6, 0.78], color: "#4E7DFF", speed: 0.026, offset: 0.66 },
];

/**
 * Thin luminous rings plus the small nodes travelling along them.
 *
 * The rings splay apart at rest and fold into a single aligned plane in the
 * contact chapter — the visual "systems ready" beat at the end of the story.
 */
export function OrbitalRings({ quality }: { quality: QualityProfile }) {
  const specs = useMemo(() => RINGS.slice(0, quality.rings), [quality.rings]);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const nodes = useRef<THREE.InstancedMesh>(null);

  // Unit-radius tori: the group scale sets the real radius, so the tube is
  // pre-divided to keep every ring the same hairline thickness on screen.
  const ringGeometries = useMemo(
    () =>
      specs.map(
        (s) => new THREE.TorusGeometry(1, 0.0032 / s.radius, 4, 260),
      ),
    [specs],
  );

  const materials = useMemo(
    () =>
      specs.map(
        (s) =>
          new THREE.ShaderMaterial({
            vertexShader: RING_VERT,
            fragmentShader: RING_FRAG,
            uniforms: {
              uTime: { value: 0 },
              uEnergy: { value: 1 },
              uPulse: { value: 0 },
              uColor: { value: new THREE.Color(s.color) },
              uOffset: { value: s.offset },
            },
            toneMapped: false,
            transparent: false,
          }),
      ),
    [specs],
  );

  /** Deterministic node placement — one node per ring slot, no randomness. */
  const nodeSlots = useMemo(
    () =>
      Array.from({ length: quality.nodes }, (_, i) => ({
        ring: i % specs.length,
        phase: (i / quality.nodes) * Math.PI * 2 + i * 0.7,
        speed: 0.18 + (i % 4) * 0.055,
        size: 0.0105 + (i % 3) * 0.005,
      })),
    [quality.nodes, specs.length],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(
    () => () => {
      ringGeometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
    [ringGeometries, materials],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const align = coreLive.ringAlign;
    const spread = coreLive.ringSpread;

    specs.forEach((spec, i) => {
      const g = groups.current[i];
      const m = materials[i];
      if (m) {
        m.uniforms.uTime.value += dt;
        m.uniforms.uEnergy.value = coreLive.energy;
        m.uniforms.uPulse.value = coreLive.pulse;
      }
      if (!g) return;

      // 1.16rad, not PI/2: a fully edge-on ring would read as a glitch.
      g.rotation.x = lerp(spec.tilt[0], 1.16, align);
      g.rotation.y = lerp(spec.tilt[1], 0.12, align);
      g.rotation.z += dt * spec.speed;

      const r = spec.radius * spread;
      g.scale.setScalar(r);
    });

    const mesh = nodes.current;
    if (mesh) {
      const t = performance.now() * 0.001;
      nodeSlots.forEach((slot, i) => {
        const spec = specs[slot.ring];
        const g = groups.current[slot.ring];
        if (!spec || !g) return;
        const a = slot.phase + t * slot.speed;
        const r = spec.radius * spread;
        dummy.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
        dummy.position.applyEuler(g.rotation);
        const s = slot.size * (1 + coreLive.pulse * 0.8);
        dummy.scale.setScalar(s);
        dummy.rotation.set(a, a * 0.6, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      const nm = mesh.material as THREE.MeshBasicMaterial;
      nm.opacity = 0.55 + coreLive.energy * 0.3;
    }
  });

  return (
    <group>
      {specs.map((spec, i) => (
        <group
          key={spec.radius}
          ref={(el) => {
            groups.current[i] = el;
          }}
        >
          <mesh geometry={ringGeometries[i]} material={materials[i]} />
        </group>
      ))}

      <instancedMesh
        ref={nodes}
        args={[undefined, undefined, nodeSlots.length]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial
          color="#a8f4ff"
          toneMapped={false}
          transparent
          opacity={0.8}
        />
      </instancedMesh>
    </group>
  );
}
