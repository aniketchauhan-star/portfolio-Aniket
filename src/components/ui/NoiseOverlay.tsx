/**
 * Film grain. A 128×128 fractal-noise SVG encoded inline — a few hundred
 * bytes, no network request, no 4K texture.
 */
const NOISE_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
      <filter id="n">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <rect width="128" height="128" filter="url(#n)" opacity="0.55"/>
    </svg>`,
  );

export function NoiseOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.025] mix-blend-overlay"
      style={{
        backgroundImage: `url("${NOISE_URI}")`,
        backgroundSize: "128px 128px",
      }}
    />
  );
}
