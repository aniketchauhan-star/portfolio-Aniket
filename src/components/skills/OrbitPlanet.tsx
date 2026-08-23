"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * The gas giant at the centre of the capability system.
 *
 * Built entirely from layered CSS gradients — no texture download, no second
 * WebGL context competing with the page's persistent canvas.
 *
 * Five stacked layers, back to front:
 *   1. atmospheric bloom outside the disc
 *   2. cloud belts — static banding that gives the body its structure
 *   3. a drifting streak/vortex layer, twice the width of the disc and
 *      translated by exactly one tile, so the rotation loops seamlessly
 *   4. spherical shading: a lit shoulder at upper-left, a deep terminator
 *      falling away to lower-right
 *   5. a thin limb highlight plus a technical scan overlay
 */
export function OrbitPlanet({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        className,
      )}
    >
      {/* 1 — atmosphere ------------------------------------------------- */}
      <span
        className="absolute top-1/2 left-1/2 h-[210%] w-[210%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(108,243,255,0.13) 0%, rgba(132,107,255,0.07) 38%, transparent 66%)",
        }}
      />

      {/* The body. Everything inside is clipped to the sphere. */}
      <span className="planet-body relative block overflow-hidden rounded-full">
        {/* 2 + 3 — the surface, tilted a few degrees off the horizontal */}
        <span className="planet-surface">
          <span className="absolute inset-0 planet-belts" />
          <span
            className={cn(
              "absolute inset-y-0 left-0 planet-drift",
              !reduced && "planet-spin",
            )}
          />
        </span>

        {/* 4 — spherical shading -------------------------------------- */}
        <span
          className="absolute inset-0 rounded-full"
          style={{
            background:
              // Falls away from a lit shoulder at upper-left to a deep limb.
              "radial-gradient(118% 118% at 31% 25%, rgba(2,3,6,0) 0%, rgba(2,3,6,0.10) 34%, rgba(2,3,6,0.55) 68%, rgba(2,3,6,0.93) 100%)," +
              // A soft specular sheen where the light actually lands.
              "radial-gradient(46% 42% at 30% 23%, rgba(226,240,255,0.20) 0%, transparent 68%)," +
              // Poles fall off faster than the equator.
              "linear-gradient(to bottom, rgba(2,3,6,0.45) 0%, transparent 16%, transparent 84%, rgba(2,3,6,0.5) 100%)",
          }}
        />

        {/* 5a — technical scan overlay --------------------------------- */}
        <span className="absolute inset-0 rounded-full planet-scan" />

        {/* 5b — limb: full faint rim, brighter along the lit edge ------- */}
        <span
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: "inset 0 0 0 1px rgba(108,243,255,0.18)" }}
        />
        <span className="absolute inset-0 rounded-full planet-limb" />
      </span>

      <style>{`
        .planet-body {
          width: var(--planet-size);
          height: var(--planet-size);
          background: #0a1120;
          box-shadow: 0 0 80px -12px rgba(108,243,255,0.4);
        }

        /* Belts: an opaque surface ramp. Painting the bands as the body's
           own colour (rather than tinting black) is what lets the shading
           on top read as light falling across a sphere. */
        /* Oversized and rotated, so the tilted bands still cover the disc
           right out to the limb. */
        .planet-surface {
          position: absolute;
          inset: -16%;
          transform: rotate(-7deg);
        }

        .planet-belts {
          background-image: linear-gradient(
            to bottom,
            #1c2740 0%,
            #0c1120 6%,
            #46597b 13%,
            #0a0f1c 21%,
            #2f6076 27%,
            #0c111e 34%,
            #51648a 41%,
            #090d18 49%,
            #453e73 56%,
            #0b1019 63%,
            #47597c 70%,
            #080c15 78%,
            #275063 85%,
            #060a12 93%,
            #1e2942 100%
          );
        }

        /* Twice the body's width, tiled once per body-width, so translating
           by exactly -50% returns to the starting frame. */
        .planet-drift {
          width: 200%;
          background-repeat: repeat-x;
          background-size: 50% 100%;
          background-image:
            /* the storm — a bright vortex riding the violet belt */
            radial-gradient(19% 7.5% at 68% 56.5%, rgba(226,240,255,0.85) 0%, rgba(170,140,255,0.55) 38%, rgba(132,107,255,0.22) 66%, transparent 78%),
            radial-gradient(7% 3% at 66% 56.5%, rgba(255,255,255,0.9) 0%, transparent 72%),
            /* cloud streaks drawn through the lighter zones */
            radial-gradient(30% 3.4% at 18% 13%, rgba(226,240,255,0.42), transparent 70%),
            radial-gradient(24% 2.6% at 55% 27%, rgba(108,243,255,0.40), transparent 72%),
            radial-gradient(34% 3.2% at 84% 41%, rgba(226,240,255,0.38), transparent 70%),
            radial-gradient(26% 2.4% at 34% 41%, rgba(190,215,245,0.30), transparent 72%),
            radial-gradient(30% 2.8% at 12% 70%, rgba(108,243,255,0.32), transparent 72%),
            radial-gradient(22% 2.4% at 61% 85%, rgba(215,232,255,0.30), transparent 72%),
            radial-gradient(18% 2.2% at 40% 13%, rgba(255,255,255,0.28), transparent 74%);
        }

        .planet-spin { animation: planetSpin 54s linear infinite; }
        @keyframes planetSpin { to { transform: translateX(-50%); } }

        /* Very low-contrast horizontal scan — the "instrument readout" cue. */
        .planet-scan {
          background-image: repeating-linear-gradient(
            to bottom,
            rgba(244,246,255,0.05) 0px,
            rgba(244,246,255,0.05) 1px,
            transparent 1px,
            transparent 4px
          );
          opacity: 0.5;
          mix-blend-mode: overlay;
        }

        /* An arc of light on the lit limb: a conic wedge, masked to a 1.5%
           band at the very edge of the disc. */
        .planet-limb {
          background: conic-gradient(
            from 272deg,
            rgba(108,243,255,0.55) 0deg,
            rgba(232,244,255,0.9) 42deg,
            rgba(132,107,255,0.35) 92deg,
            transparent 140deg
          );
          -webkit-mask-image: radial-gradient(circle closest-side, transparent 95.5%, #000 96.5%);
          mask-image: radial-gradient(circle closest-side, transparent 95.5%, #000 96.5%);
        }

        @media (prefers-reduced-motion: reduce) {
          .planet-spin { animation: none; }
        }
      `}</style>
    </div>
  );
}
