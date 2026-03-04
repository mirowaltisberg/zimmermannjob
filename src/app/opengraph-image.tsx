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
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Hammer */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 120 120"
          width="120"
          height="120"
          style={{ marginBottom: 32 }}
        >
          <rect x="20" y="15" width="80" height="30" rx="4" fill="#8B5E3C"/>
          <rect x="48" y="45" width="24" height="60" rx="4" fill="#A0522D"/>
        </svg>

        {/* Brand name */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 0,
          }}
        >
          <span style={{ fontSize: 72, fontWeight: 900, color: "#f8fafc", letterSpacing: -1 }}>
            Zimmermann
          </span>
          <span style={{ fontSize: 72, fontWeight: 900, color: "#8B5E3C", letterSpacing: -1 }}>
            job
          </span>
          <span style={{ fontSize: 52, fontWeight: 400, color: "#94a3b8", letterSpacing: -1 }}>
            .ch
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#94a3b8",
            marginTop: 20,
            letterSpacing: 0.5,
          }}
        >
          Die Jobbörse für Zimmermann-Fachkräfte in der Schweiz
        </div>
      </div>
    ),
    { ...size }
  );
}
