import { ImageResponse } from "next/og";

// SEO-DECISION: Apple Touch Icon generated from code to match the brand hammer.
// This satisfies the Seobility "missing apple-touch-icon" warning.

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#8B5E3C",
          borderRadius: "36px",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 180 180"
          width="120"
          height="120"
        >
          <path d="M50 35h80v30H50z" fill="white" rx="4"/>
          <path d="M78 65h24v75h-24z" fill="white" opacity="0.9" rx="4"/>
        </svg>
      </div>
    ),
    { ...size }
  );
}
