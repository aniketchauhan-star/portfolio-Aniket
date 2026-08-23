"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { coreLive, sceneState } from "@/lib/scene-state";
import type { QualityProfile } from "@/lib/quality";
import {
  ENERGY_VERT,
  ENERGY_FRAG,
  VISOR_VERT,
  VISOR_FRAG,
  GLOW_VERT,
  GLOW_FRAG,
} from "./shaders";

const CYAN = new THREE.Color("#6CF3FF");
const VIOLET = new THREE.Color("#846BFF");

/**
 * The centrepiece: a hovering machine, built from generated geometry only —
 * no downloaded model, so it costs a few kilobytes and scales across tiers.
 *
 *   · a chamfered head carrying the one emissive surface, its visor
 *   · a torso holding the energy core at its chest
 *   · two shoulder pods, deliberately detached — it hovers, it has no joints
 *   · violet seams down the flanks, a pulse readout on the antenna, and a
 *     hover plume underneath
 *
 * It is the same object the rest of the scene was choreographed around: the
 * chest core runs the shader the old sphere ran, so `energy` still means
 * brightness and `pulse` still flashes through it. What changed is that the
 * thing now has a front, which is why <CoreRig /> oscillates instead of
 * spinning — a face that turns away and never comes back is a bug, not motion.
 */
export function Robot({ quality }: { quality: QualityProfile }) {
  const head = useRef<THREE.Group>(null);
  const chest = useRef<THREE.Mesh>(null);
  const podL = useRef<THREE.Group>(null);
  const podR = useRef<THREE.Group>(null);
  const antenna = useRef<THREE.Mesh>(null);
  const body = useRef<THREE.Group>(null);
  const plume = useRef<THREE.Mesh>(null);
  const clock = useRef(0);

  const low = quality.tier === "low";

  /* --- Materials ---------------------------------------------------------
     Built imperatively: r3f copies a `uniforms` prop, so the frame loop has
     to own the material to keep writing into it. */

  /** The visor — the face plate, and the only part that emits. */
  const visorMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VISOR_VERT,
        fragmentShader: VISOR_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uEnergy: { value: 1 },
          uPulse: { value: 0 },
          uCyan: { value: CYAN.clone() },
          uViolet: { value: VIOLET.clone() },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );

  /** The energy core at the chest — the same shader the old sphere ran. */
  const coreMaterial = useMemo(
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

  /** The chassis. Dark and metallic, lit entirely by the scene's light cards. */
  const shellMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1b2233",
        metalness: 0.72,
        roughness: 0.44,
        emissive: new THREE.Color("#0e3242"),
        emissiveIntensity: 0.4,
      }),
    [],
  );

  /** Slightly lighter machined parts — neck, antenna, pod faces. */
  const trimMaterial = useMemo(
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

  /** Seams and the antenna tip — pure light, never lit. */
  const seamMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: VIOLET.clone(),
        toneMapped: false,
        transparent: true,
        opacity: 0.7,
      }),
    [],
  );
  const tipMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: CYAN.clone(),
        toneMapped: false,
        transparent: true,
        opacity: 0.9,
      }),
    [],
  );

  /** The hover plume under the torso. Inverse fresnel, so it falls off at its
   *  own silhouette and reads as a volume of light rather than a solid shape. */
  const plumeMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: GLOW_VERT,
        fragmentShader: GLOW_FRAG,
        uniforms: {
          uEnergy: { value: 1 },
          uPulse: { value: 0 },
          uCyan: { value: CYAN.clone() },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );

  /* --- Shared geometry ---------------------------------------------------
     One unit box, scaled per instance, shared by every seam and vent. */
  const seamGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  useEffect(
    () => () => {
      seamGeometry.dispose();
      visorMaterial.dispose();
      coreMaterial.dispose();
      shellMaterial.dispose();
      trimMaterial.dispose();
      seamMaterial.dispose();
      tipMaterial.dispose();
      plumeMaterial.dispose();
    },
    [
      seamGeometry,
      visorMaterial,
      coreMaterial,
      shellMaterial,
      trimMaterial,
      seamMaterial,
      tipMaterial,
      plumeMaterial,
    ],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const reduced = sceneState.reducedMotion;
    if (!reduced) clock.current += dt;
    const t = clock.current;

    const energy = coreLive.energy;
    const pulse = coreLive.pulse;

    for (const m of [visorMaterial, coreMaterial]) {
      m.uniforms.uTime.value += dt;
      m.uniforms.uPulse.value = pulse;
    }
    visorMaterial.uniforms.uEnergy.value = energy;
    coreMaterial.uniforms.uEnergy.value = energy;

    // Hover. The whole body rises and falls; nothing here is a bounce.
    if (body.current) {
      body.current.position.y = reduced ? 0 : Math.sin(t * 0.85) * 0.022;
    }

    // The head leads the hover slightly and leans toward the pointer, which
    // is what makes the machine read as attending to the visitor rather than
    // just floating. Kept small — the whole group is already parallaxing.
    if (head.current) {
      const h = head.current;
      h.rotation.y = sceneState.pointerX * 0.26;
      h.rotation.x = sceneState.pointerY * 0.16;
      h.position.y = 0.3 + (reduced ? 0 : Math.sin(t * 0.85 + 0.5) * 0.008);
    }

    // The pods drift out of phase with the body, so the three masses never
    // move as one rigid object.
    if (podL.current) {
      podL.current.position.y = reduced ? 0.02 : 0.02 + Math.sin(t * 0.7 + 1.1) * 0.018;
      podL.current.rotation.z = reduced ? 0 : Math.sin(t * 0.5) * 0.09;
    }
    if (podR.current) {
      podR.current.position.y = reduced ? 0.02 : 0.02 + Math.sin(t * 0.7 + 2.6) * 0.018;
      podR.current.rotation.z = reduced ? 0 : Math.sin(t * 0.5 + 1.7) * -0.09;
    }

    // The chest core keeps turning inside its housing.
    if (chest.current && !reduced) {
      chest.current.rotation.y += dt * 0.5;
      chest.current.rotation.x += dt * 0.22;
    }

    // The antenna tip is the pulse readout: it swells when a timeline node
    // fires and breathes gently the rest of the time.
    if (antenna.current) {
      const s = 1 + pulse * 1.6 + (reduced ? 0 : Math.sin(t * 2.1) * 0.12);
      antenna.current.scale.setScalar(s);
    }
    // The plume breathes against the hover, brightest as the body sinks.
    if (plume.current) {
      const swell = reduced ? 1 : 1 + Math.sin(t * 0.85 + Math.PI) * 0.16;
      plume.current.scale.set(swell, 0.34 * swell, swell);
    }
    plumeMaterial.uniforms.uEnergy.value = energy * (reduced ? 0.7 : 1);
    plumeMaterial.uniforms.uPulse.value = pulse;

    tipMaterial.opacity = 0.55 + energy * 0.3 + pulse * 0.4;
    seamMaterial.opacity = 0.3 + energy * 0.36 + pulse * 0.3;
    shellMaterial.emissiveIntensity = 0.2 + energy * 0.28;
  });

  return (
    <group ref={body} scale={1.4}>
      {/* Head ---------------------------------------------------------- */}
      <group ref={head} position={[0, 0.29, 0]}>
        {/* An octagonal drum, slightly wider at the jaw. Eight facets, each
            catching the cyan and violet cards at a different angle — that is
            what gives a near-black chassis a readable silhouette. */}
        <mesh material={shellMaterial} rotation={[0, Math.PI / 8, 0]}>
          <cylinderGeometry args={[0.165, 0.185, 0.2, 8]} />
        </mesh>

        {/* Crown and jaw rings — machined trim that breaks up the drum. */}
        <mesh material={trimMaterial} position={[0, 0.103, 0]} rotation={[0, Math.PI / 8, 0]}>
          <cylinderGeometry args={[0.15, 0.168, 0.018, 8]} />
        </mesh>
        <mesh material={trimMaterial} position={[0, -0.101, 0]} rotation={[0, Math.PI / 8, 0]}>
          <cylinderGeometry args={[0.176, 0.164, 0.016, 8]} />
        </mesh>

        {/* Visor. An open cylinder wall wrapping the front of the drum —
            theta 0 is +Z in three.js, so a band centred on -thetaLength/2
            faces forward. Its UVs run v = up the wall, which is the axis
            VISOR_FRAG scans. A flat plate cannot work here: the front facet
            is only 0.126 wide, so any readable plate overhangs the
            silhouette. */}
        <mesh material={visorMaterial} renderOrder={5} position={[0, 0.012, 0]}>
          <cylinderGeometry
            args={[
              0.172,
              0.181,
              0.078,
              low ? 10 : 22,
              1,
              true,
              -Math.PI * 0.42,
              Math.PI * 0.84,
            ]}
          />
        </mesh>

        {/* Brow — the same band, shallower, sitting just above the visor */}
        <mesh material={trimMaterial} position={[0, 0.062, 0]}>
          <cylinderGeometry
            args={[0.176, 0.176, 0.016, low ? 10 : 20, 1, true, -Math.PI * 0.46, Math.PI * 0.92]}
          />
        </mesh>

        {/* Cheek vents */}
        {!low &&
          [-1, 1].map((side) => (
            <mesh
              key={side}
              geometry={seamGeometry}
              material={seamMaterial}
              position={[side * 0.128, -0.03, 0.115]}
              scale={[0.011, 0.042, 0.008]}
            />
          ))}

        {/* Antenna + the tip that reads out the pulse */}
        <mesh material={trimMaterial} position={[0, 0.165, -0.03]}>
          <cylinderGeometry args={[0.005, 0.0075, 0.115, low ? 5 : 8]} />
        </mesh>
        <mesh ref={antenna} material={tipMaterial} position={[0, 0.228, -0.03]}>
          <sphereGeometry args={[0.018, low ? 6 : 12, low ? 5 : 10]} />
        </mesh>
      </group>

      {/* Neck ----------------------------------------------------------- */}
      <mesh material={trimMaterial} position={[0, 0.163, 0]}>
        <cylinderGeometry args={[0.042, 0.052, 0.055, low ? 6 : 10]} />
      </mesh>

      {/* Torso ---------------------------------------------------------- */}
      <group position={[0, -0.02, 0]}>
        <mesh material={shellMaterial} rotation={[0, Math.PI / 8, 0]}>
          <cylinderGeometry args={[0.195, 0.15, 0.28, 8]} />
        </mesh>

        {/* Collar */}
        <mesh material={trimMaterial} position={[0, 0.142, 0]} rotation={[0, Math.PI / 8, 0]}>
          <cylinderGeometry args={[0.185, 0.2, 0.022, 8]} />
        </mesh>

        {/* Chest housing + the energy core inside it — the same shader the
            old sphere ran, so `energy` and `pulse` still land here. */}
        <mesh
          material={trimMaterial}
          position={[0, 0.035, 0.153]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.055, 0.013, low ? 5 : 8, low ? 12 : 24]} />
        </mesh>
        <mesh ref={chest} material={coreMaterial} position={[0, 0.035, 0.153]}>
          <icosahedronGeometry args={[0.046, 1]} />
        </mesh>

        {/* Seams: one down each flank, one across the waist */}
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            geometry={seamGeometry}
            material={seamMaterial}
            position={[side * 0.163, -0.01, 0.05]}
            scale={[0.005, 0.17, 0.006]}
          />
        ))}
        <mesh
          geometry={seamGeometry}
          material={seamMaterial}
          position={[0, -0.1, 0.135]}
          scale={[0.11, 0.007, 0.006]}
        />
      </group>

      {/* Shoulder pods — detached, so the machine reads as hovering ----- */}
      {[
        { ref: podL, side: -1 },
        { ref: podR, side: 1 },
      ].map(({ ref, side }) => (
        <group key={side} ref={ref} position={[side * 0.265, 0.075, 0]}>
          <mesh material={shellMaterial} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.062, 0.062, 0.085, 6]} />
          </mesh>
          {/* The lit face, turned outward */}
          <mesh
            material={tipMaterial}
            position={[side * 0.045, 0, 0]}
            rotation={[0, side * Math.PI / 2, 0]}
          >
            <circleGeometry args={[0.034, low ? 6 : 12]} />
          </mesh>
        </group>
      ))}

      {/* Hover plume — what actually sells the machine as floating rather
          than standing. A flattened sphere, not a disc: the camera sits at
          y = 0, so a horizontal disc under the torso is edge-on and
          invisible. */}
      <mesh
        ref={plume}
        material={plumeMaterial}
        position={[0, -0.205, 0]}
        scale={[1, 0.34, 1]}
      >
        <sphereGeometry args={[0.135, low ? 10 : 20, low ? 8 : 14]} />
      </mesh>
      <mesh material={trimMaterial} position={[0, -0.165, 0]} rotation={[0, Math.PI / 8, 0]}>
        <cylinderGeometry args={[0.05, 0.105, 0.05, 8]} />
      </mesh>
    </group>
  );
}
