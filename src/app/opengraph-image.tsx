import { ImageResponse } from "next/og";

export const alt = "zimmermannjob.ch — Zimmermannjobs Schweiz";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "72px 86px",
          background: "#f1eee6",
          borderTop: "18px solid #276f6b",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="90" height="90">
            <path d="M10 8v18a9 9 0 0 0 9 9h26a9 9 0 0 1 9 9v12" fill="none" stroke="#276f6b" strokeWidth="7" />
            <circle cx="10" cy="8" r="6" fill="#a96843" />
            <circle cx="54" cy="56" r="6" fill="#a96843" />
          </svg>
          <div style={{ color: "#276f6b", fontSize: 24, fontWeight: 800, letterSpacing: 3 }}>
            ZIMMERMANN · SCHWEIZ
          </div>
        </div>

        {/* Brand name */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 0,
          }}
        >
          <span style={{ fontSize: 84, fontWeight: 900, color: "#173f3d", letterSpacing: -4 }}>
            Zimmermann
          </span>
          <span style={{ fontSize: 84, fontWeight: 900, color: "#276f6b", letterSpacing: -4 }}>
            jobs
          </span>
          <span style={{ fontSize: 58, fontWeight: 700, color: "#a96843", letterSpacing: -2 }}>
            .ch
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#466865",
            marginTop: 20,
            letterSpacing: 0.5,
          }}
        >
          Zimmermannstellen. Präzise gefunden.
        </div>
      </div>
    ),
    { ...size }
  );
}
