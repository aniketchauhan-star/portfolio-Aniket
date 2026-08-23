import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

export const alt = `${profile.name} — ${profile.headline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social card, generated at build time from the same profile data as the
 * page. No binary asset to keep in sync, and nothing invented.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(900px 600px at 78% 22%, rgba(108,243,255,0.16), transparent 60%)," +
            "radial-gradient(700px 500px at 18% 84%, rgba(132,107,255,0.14), transparent 62%)," +
            "#030407",
          color: "#F4F6FF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#6CF3FF",
            }}
          />
          <div
            style={{
              fontSize: 20,
              letterSpacing: 8,
              color: "#8D93A3",
            }}
          >
            PORTFOLIO
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 128,
              lineHeight: 0.9,
              letterSpacing: -6,
              fontWeight: 600,
            }}
          >
            {profile.firstName.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: 128,
              lineHeight: 0.9,
              letterSpacing: -6,
              fontWeight: 600,
              color: "#6CF3FF",
            }}
          >
            {profile.lastName.toUpperCase()}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            letterSpacing: 6,
            color: "#8D93A3",
          }}
        >
          <div>{profile.headline.toUpperCase()}</div>
          <div>{profile.location.toUpperCase()}</div>
        </div>
      </div>
    ),
    size,
  );
}
