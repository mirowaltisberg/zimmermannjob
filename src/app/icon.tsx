import { ImageResponse } from "next/og";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "10px",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="33"
          height="33"
        >
          <path d="M10 6h12v5H10z" fill="white"/>
          <path d="M14 11h4v15h-4z" fill="white" opacity="0.9"/>
        </svg>
      </div>
    ),
    { ...size }
  );
}
