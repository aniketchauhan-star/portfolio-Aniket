"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import { sceneState } from "@/lib/scene-state";
import { detectTier, hasWebGL, profileFor, type Tier } from "@/lib/quality";
import { damp } from "@/lib/utils";
import { CoreRig } from "./CoreRig";
import { IdentityCore } from "./IdentityCore";
import { OrbitalRings } from "./OrbitalRings";
import { ParticleField } from "./ParticleField";
import { AdaptivePerformance } from "./AdaptivePerformance";
import { StaticFallback } from "./StaticFallback";

/* -------------------------------------------------------------------------- */
/*  Camera                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Pointer moves the camera, not the subject — a small ±0.15 / ±0.10 drift that
 * always interpolates and never snaps. Scroll eases the camera back so the
 * whole scene gains depth as the page advances.
 */
function CameraRig() {
  const target = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const { camera, size } = useThree();

  useEffect(() => {
    // Slightly wider framing on narrow screens so the core is never cropped.
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = size.width < 640 ? 48 : size.width < 1024 ? 42 : 38;
    cam.updateProjectionMatrix();
  }, [camera, size.width]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const reduced = sceneState.reducedMotion;

    const px = reduced ? 0 : sceneState.pointerX;
    const py = reduced ? 0 : sceneState.pointerY;

    camera.position.x = damp(camera.position.x, px * 0.15, 0.02, dt);
    camera.position.y = damp(camera.position.y, py * -0.1, 0.02, dt);
    camera.position.z = damp(
      camera.position.z,
      6.4 + sceneState.scroll * 0.9,
      0.05,
      dt,
    );

    target.set(px * 0.05, py * -0.03, 0);
    camera.lookAt(target);
  });

  return null;
}

/* -------------------------------------------------------------------------- */
/*  Lighting                                                                   */
/* -------------------------------------------------------------------------- */

function AmbientLighting({ environment }: { environment: boolean }) {
  return (
    <>
      <ambientLight intensity={0.22} />
      <hemisphereLight
        intensity={0.25}
        color="#8fd7ff"
        groundColor="#0a0d16"
      />
      <pointLight
        position={[3.2, 2.4, 3.6]}
        intensity={16}
        distance={22}
        color="#6CF3FF"
      />
      <pointLight
        position={[-3.6, -1.8, 2.2]}
        intensity={12}
        distance={20}
        color="#846BFF"
      />
      <directionalLight position={[-2, 4, -5]} intensity={0.6} color="#dce7ff" />

      {/* Reflections are built in-engine from light cards — no HDR download,
          no network request, and it renders exactly once. */}
      {environment && (
        <Environment resolution={256} frames={1}>
          <Lightformer
            form="rect"
            intensity={1.15}
            color="#6CF3FF"
            position={[4, 2.4, 4]}
            scale={[2.4, 4.2, 1]}
          />
          <Lightformer
            form="rect"
            intensity={0.85}
            color="#846BFF"
            position={[-4.5, -1.4, 3]}
            scale={[2.2, 3.4, 1]}
          />
          <Lightformer
            form="circle"
            intensity={0.5}
            color="#ffffff"
            position={[0, 5, -3]}
            scale={[2.6, 2.6, 1]}
          />
          <mesh scale={40}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#04060b" side={THREE.BackSide} />
          </mesh>
        </Environment>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Demand-driven rendering for reduced motion                                 */
/* -------------------------------------------------------------------------- */

/**
 * With `prefers-reduced-motion` the scene has no self-motion, so there is
 * nothing to render between interactions. This keeps a short trailing window
 * of frames alive after scroll/resize so damped transitions still complete.
 */
function DemandDriver() {
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    let until = performance.now() + 1500;
    let raf = 0;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (performance.now() < until) invalidate();
    };
    const ping = () => {
      until = performance.now() + 1200;
    };

    raf = requestAnimationFrame(loop);
    window.addEventListener("scroll", ping, { passive: true });
    window.addEventListener("resize", ping);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", ping);
      window.removeEventListener("resize", ping);
    };
  }, [invalidate]);

  return null;
}

/* -------------------------------------------------------------------------- */
/*  Global input tracking                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Writes scroll and pointer into the shared scene state. Lives outside the
 * canvas so the DOM layer still gets these values when WebGL is unavailable.
 */
function useInputBridge() {
  useEffect(() => {
    let frame = 0;

    const readScroll = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      sceneState.scroll = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(readScroll);
    };
    const onPointer = (e: PointerEvent) => {
      sceneState.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onBlur = () => {
      sceneState.pointerX = 0;
      sceneState.pointerY = 0;
    };

    readScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("blur", onBlur);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}

/* -------------------------------------------------------------------------- */
/*  Scene                                                                      */
/* -------------------------------------------------------------------------- */

export default function Scene() {
  const [tier, setTier] = useState<Tier | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);
  const mounted = useRef(false);

  useInputBridge();

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    const ok = hasWebGL();
    setSupported(ok);
    const detected = detectTier();
    setTier(detected);
    sceneState.tier = detected;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    sceneState.reducedMotion = mql.matches;
    const onChange = () => {
      setReduced(mql.matches);
      sceneState.reducedMotion = mql.matches;
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const quality = useMemo(
    () => profileFor(tier ?? "medium"),
    [tier],
  );

  if (supported === false) {
    return (
      <div id="scene-root">
        <StaticFallback />
      </div>
    );
  }

  if (supported === null || tier === null) {
    // Nothing to show yet — the preloader is covering the viewport anyway.
    return <div id="scene-root" />;
  }

  return (
    <div id="scene-root">
      <Canvas
        frameloop={reduced ? "demand" : "always"}
        dpr={quality.dpr}
        gl={{
          antialias: quality.tier !== "low",
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          preserveDrawingBuffer: false,
        }}
        camera={{ position: [0, 0, 6.4], fov: 38, near: 0.1, far: 60 }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <Suspense fallback={null}>
          <CameraRig />
          <AmbientLighting environment={quality.environment} />

          <CoreRig>
            <IdentityCore quality={quality} />
            <OrbitalRings quality={quality} />
          </CoreRig>

          <ParticleField quality={quality} />

          <AdaptivePerformance
            tier={quality.tier}
            onTier={(t) => {
              setTier(t);
              sceneState.tier = t;
            }}
          />
          <AdaptiveDpr pixelated={false} />
          {reduced && <DemandDriver />}
        </Suspense>
      </Canvas>
    </div>
  );
}
