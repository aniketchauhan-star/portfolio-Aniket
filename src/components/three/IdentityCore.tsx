"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { coreLive } from "@/lib/scene-state";
import type { QualityProfile } from "@/lib/quality";
import {
  ENERGY_VERT,
  ENERGY_FRAG,
  SHELL_VERT,
  SHELL_FRAG,
} from "./shaders";

const CYAN = new THREE.Color("#6CF3FF");
const VIOLET = new THREE.Color("#846BFF");

/**
 * The centrepiece: a digital intelligence core.
 *
 *   · a fresnel glass shell
 *   · a faceted crystal of contained energy at its centre
 *   · dark machined arcs holding the two apart
 *   · a fine point cloud suspended in the shell
 *
 * Nothing here is a downloaded model — it is all generated geometry, so it
 * costs a few kilobytes and scales cleanly across quality tiers.
 */
export function IdentityCore({ quality }: { quality: QualityProfile }) {
  const crystal = useRef<THREE.Mesh>(null);
  const arcs = useRef<THREE.Group>(null);
  const cloud = useRef<THREE.Points>(null);

  /** Built imperatively — see the note in ParticleField: r3f copies a
   *  `uniforms` prop, so the frame loop needs to own the material. */
  const energyMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ENERGY_VERT,
        fragmentShader: ENERGY_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uEnergy: { value: 1 },
          uPulse: { value: 0 },
          uCyan: { value: CYAN.clone() },
          uViolet: { value: VIOLET.clone() },
        },
        toneMapped: false,
      }),
    [],
  );
  const uniforms = energyMaterial.uniforms;

  /** The outer glass bubble. */
  const shellMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SHELL_VERT,
        fragmentShader: SHELL_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uEnergy: { value: 1 },
          uPulse: { value: 0 },
          uCyan: { value: CYAN.clone() },
          uViolet: { value: VIOLET.clone() },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );

  /* Machined arcs — one geometry and one material shared by all three. */
  const arcGeometry = useMemo(
    () => new THREE.TorusGeometry(0.72, 0.0038, 8, 128, Math.PI * 0.55),
    [],
  );
  const arcMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#141926",
        metalness: 1,
        roughness: 0.22,
        emissive: new THREE.Color("#123a46"),
        emissiveIntensity: 0.5,
      }),
    [],
  );

  /* A fine point cloud suspended inside the shell. */
  const cloudGeometry = useMemo(() => {
    const count = quality.tier === "low" ? 90 : quality.tier === "medium" ? 180 : 300;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Fibonacci sphere, jittered inward, so points read as volume not shell.
      const t = (i + 0.5) / count;
      const phi = Math.acos(1 - 2 * t);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 0.3 + Math.sin(i * 12.9898) * 0.14;
      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.cos(phi) * r;
      pos[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [quality.tier]);

  /* Generated geometry/materials are ours, so we dispose them ourselves. */
  useEffect(
    () => () => {
      arcGeometry.dispose();
      arcMaterial.dispose();
      cloudGeometry.dispose();
      energyMaterial.dispose();
      shellMaterial.dispose();
    },
    [arcGeometry, arcMaterial, cloudGeometry, energyMaterial, shellMaterial],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    uniforms.uTime.value += dt;
    uniforms.uEnergy.value = coreLive.energy;
    uniforms.uPulse.value = coreLive.pulse;

    if (crystal.current) {
      crystal.current.rotation.y += dt * 0.14;
      crystal.current.rotation.x += dt * 0.06;
    }
    if (arcs.current) {
      arcs.current.rotation.z -= dt * 0.05;
      arcs.current.rotation.y += dt * 0.03;
    }
    if (cloud.current) {
      cloud.current.rotation.y -= dt * 0.035;
      const m = cloud.current.material as THREE.PointsMaterial;
      m.opacity = 0.22 + coreLive.energy * 0.16 + coreLive.pulse * 0.2;
    }
    const su = shellMaterial.uniforms;
    su.uTime.value += dt;
    su.uEnergy.value = coreLive.energy;
    su.uPulse.value = coreLive.pulse;
  });

  return (
    <group>
      {/* Glass shell ---------------------------------------------------- */}
      <mesh renderOrder={3} material={shellMaterial}>
        <icosahedronGeometry args={[0.55, quality.shellDetail]} />
      </mesh>

      {/* Contained energy ----------------------------------------------- */}
      <mesh ref={crystal} renderOrder={1} material={energyMaterial}>
        <icosahedronGeometry args={[0.225, 1]} />
      </mesh>

      {/* Suspended point cloud ------------------------------------------ */}
      <points ref={cloud} geometry={cloudGeometry} renderOrder={1}>
        <pointsMaterial
          size={0.007}
          color={new THREE.Color("#bfe9ff")}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* Machined arcs --------------------------------------------------- */}
      <group ref={arcs}>
        <mesh
          geometry={arcGeometry}
          material={arcMaterial}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <mesh
          geometry={arcGeometry}
          material={arcMaterial}
          rotation={[Math.PI * 0.46, Math.PI * 0.5, Math.PI * 0.18]}
          scale={1.14}
        />
      </group>
    </group>
  );
}
