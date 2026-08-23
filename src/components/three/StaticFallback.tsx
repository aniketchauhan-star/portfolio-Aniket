/**
 * Shown when WebGL is unavailable. A pure-CSS reading of the identity core —
 * same composition, same palette, no canvas — so the site still feels
 * designed rather than broken.
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
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 38% 34%, rgba(207,233,255,0.16), rgba(108,243,255,0.05) 46%, transparent 70%)",
            boxShadow:
              "inset 0 0 60px rgba(108,243,255,0.14), 0 0 120px -30px rgba(108,243,255,0.35)",
            border: "1px solid rgba(244,246,255,0.08)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 h-[26%] w-[26%] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[18%]"
          style={{
            background:
              "linear-gradient(140deg, rgba(132,107,255,0.85), rgba(108,243,255,0.9))",
            boxShadow: "0 0 60px -6px rgba(108,243,255,0.55)",
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
