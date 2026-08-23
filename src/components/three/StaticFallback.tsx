/**
 * Shown when WebGL is unavailable. A pure-CSS reading of the robot — same
 * composition, same palette, no canvas — so the site still feels designed
 * rather than broken. Deliberately a silhouette rather than a likeness: at
 * this size the head, the lit visor and the orbit rings are the whole read.
 */
export function StaticFallback() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 72% 38%, rgba(108,243,255,0.10) 0%, transparent 62%)," +
            "radial-gradient(55% 45% at 22% 72%, rgba(132,107,255,0.09) 0%, transparent 66%)," +
            "radial-gradient(90% 80% at 50% 50%, rgba(5,6,10,0) 40%, #030407 100%)",
        }}
      />
      <div className="absolute top-[34%] right-[16%] hidden h-[34vmin] w-[34vmin] -translate-y-1/2 md:block">
        {/* Ambient bloom the machine sits in */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 46% 42%, rgba(108,243,255,0.10), rgba(132,107,255,0.05) 48%, transparent 72%)",
            boxShadow: "0 0 120px -34px rgba(108,243,255,0.32)",
          }}
        />

        {/* Head, with its visor */}
        <div
          className="absolute top-[30%] left-1/2 h-[15%] w-[23%] -translate-x-1/2 rounded-[22%]"
          style={{
            background: "linear-gradient(165deg, #232c40, #12182600)",
            border: "1px solid rgba(244,246,255,0.10)",
          }}
        >
          <div
            className="absolute top-[34%] left-[10%] h-[26%] w-[80%] rounded-[2px]"
            style={{
              background:
                "linear-gradient(90deg, rgba(108,243,255,0.35), rgba(108,243,255,0.95), rgba(132,107,255,0.5))",
              boxShadow: "0 0 22px -2px rgba(108,243,255,0.8)",
            }}
          />
        </div>

        {/* Antenna */}
        <div
          className="absolute top-[25%] left-1/2 h-[6%] w-px -translate-x-1/2"
          style={{ background: "rgba(244,246,255,0.16)" }}
        />
        <div
          className="absolute top-[23.5%] left-1/2 h-[2.4%] w-[2.4%] -translate-x-1/2 rounded-full"
          style={{
            background: "rgba(108,243,255,0.95)",
            boxShadow: "0 0 16px 1px rgba(108,243,255,0.7)",
          }}
        />

        {/* Torso, with the chest core */}
        <div
          className="absolute top-[47%] left-1/2 h-[19%] w-[27%] -translate-x-1/2"
          style={{
            background: "linear-gradient(170deg, #1e2637, #10151f)",
            border: "1px solid rgba(244,246,255,0.08)",
            clipPath: "polygon(6% 0%, 94% 0%, 84% 100%, 16% 100%)",
          }}
        />
        <div
          className="absolute top-[52%] left-1/2 h-[5%] w-[5%] -translate-x-1/2 rotate-45 rounded-[16%]"
          style={{
            background:
              "linear-gradient(140deg, rgba(132,107,255,0.9), rgba(108,243,255,0.95))",
            boxShadow: "0 0 34px -4px rgba(108,243,255,0.6)",
          }}
        />

        {/* Hover plume */}
        <div
          className="absolute top-[65%] left-1/2 h-[3.5%] w-[16%] -translate-x-1/2 rounded-[50%]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(108,243,255,0.5), transparent 70%)",
          }}
        />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute inset-[-18%] rounded-full border"
            style={{
              borderColor:
                i === 0
                  ? "rgba(108,243,255,0.20)"
                  : i === 1
                    ? "rgba(132,107,255,0.16)"
                    : "rgba(78,125,255,0.12)",
              transform: `rotateX(${68 + i * 9}deg) rotateZ(${i * 42}deg) scale(${1 + i * 0.18})`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
