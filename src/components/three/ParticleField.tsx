"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { coreLive, sceneState } from "@/lib/scene-state";
import type { QualityProfile } from "@/lib/quality";
import { PARTICLE_VERT, PARTICLE_FRAG } from "./shaders";
import { damp } from "@/lib/utils";

/**
 * The surrounding field of digital spatial points.
 *
 * One draw call, one buffer geometry, one shader. Point count is set by the
 * quality tier and the whole field responds to scroll (spread) and to the
 * contact section (gather), never by rebuilding the buffer.
 */
export function ParticleField({ quality }: { quality: QualityProfile }) {
  const points = useRef<THREE.Points>(null);
  const dpr = useThree((s) => s.viewport.dpr);
  const depth = useRef(0);

  const geometry = useMemo(() => {
    const count = quality.particles;
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const scale = new Float32Array(count);

    // Deterministic pseudo-random: identical every load, so the composition is
    // art-directed rather than left to chance.
    let s = 0x2f6e2b1;
    const rnd = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0xffffffff;
    };

    for (let i = 0; i < count; i++) {
      // Shell distribution biased outward — keeps the space around the core
      // clear so the core always reads as the subject.
      const r = 3.4 + Math.pow(rnd(), 0.62) * 15.5;
      const theta = rnd() * Math.PI * 2;
      const phi = Math.acos(2 * rnd() - 1);
      pos[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.cos(phi) * r * 0.68;
      pos[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
      seed[i] = rnd();
      scale[i] = 0.5 + rnd() * 1.1;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 24);
    return g;
  }, [quality.particles]);

  /**
   * The material is built imperatively rather than via <shaderMaterial>:
   * react-three-fiber copies a `uniforms` prop onto the material, so a
   * memoised uniforms object handed over as JSX would never be the one the
   * frame loop mutates. Owning the material keeps one live reference.
   */
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: PARTICLE_VERT,
        fragmentShader: PARTICLE_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 2.6 },
          uSpread: { value: 1 },
          uAttract: { value: 0 },
          uOpacity: { value: 0 },
          uPixelRatio: { value: 1 },
          uCyan: { value: new THREE.Color("#6CF3FF") },
          uViolet: { value: new THREE.Color("#846BFF") },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  const uniforms = material.uniforms;

  useEffect(() => {
    uniforms.uPixelRatio.value = Math.min(dpr || 1, 2);
  }, [dpr, uniforms]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const reduced = sceneState.reducedMotion;

    if (!reduced) uniforms.uTime.value += dt;
    uniforms.uSpread.value = damp(
      uniforms.uSpread.value,
      coreLive.particleSpread,
      0.003,
      dt,
    );
    uniforms.uAttract.value = coreLive.attract;
    // Fade the field in once, after the reveal.
    uniforms.uOpacity.value = damp(
      uniforms.uOpacity.value,
      sceneState.revealed ? 0.5 + coreLive.pulse * 0.25 : 0,
      0.05,
      dt,
    );

    const p = points.current;
    if (!p) return;

    // Pointer shifts the field's depth, not its position — parallax without
    // the whole background sliding around.
    depth.current = damp(depth.current, sceneState.pointerX, 0.02, dt);
    p.rotation.y = depth.current * 0.09 + (reduced ? 0 : uniforms.uTime.value * 0.006);
    p.rotation.x = sceneState.pointerY * 0.05;
  });

  return (
    <points
      ref={points}
      geometry={geometry}
      material={material}
      frustumCulled={false}
    />
  );
}
