import { ImageResponse } from "next/og";

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
          background: "#29221d",
          borderRadius: "36px",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width="120"
          height="120"
        >
          <path d="M6 36V7h30v29M6 7l30 29M36 7L6 36M12 36V19h18v17M12 25h18" fill="none" stroke="#d7823b" strokeWidth="4" />
          <path d="M6 7h30" fill="none" stroke="#7c993e" strokeWidth="3" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
