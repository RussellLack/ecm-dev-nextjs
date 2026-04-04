import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ECM.DEV — Content Infrastructure for the AI Enterprise";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          backgroundColor: "#316148",
          padding: "70px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent triangles */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 0,
            height: 0,
            borderBottom: "190px solid #AAF870",
            borderRight: "480px solid transparent",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 0,
            height: 0,
            borderTop: "220px solid #AAF870",
            borderLeft: "420px solid transparent",
          }}
        />

        {/* Title */}
        <div
          style={{
            color: "#AAF870",
            fontSize: 96,
            fontWeight: 900,
            letterSpacing: "-2px",
            lineHeight: 1,
          }}
        >
          ECM.DEV
        </div>

        {/* Tagline */}
        <div
          style={{
            color: "#ffffff",
            fontSize: 38,
            fontWeight: 600,
            marginTop: 30,
            lineHeight: 1.3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Content Infrastructure</span>
          <span>for the AI Enterprise</span>
        </div>

        {/* Description */}
        <div
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 22,
            marginTop: 40,
            lineHeight: 1.6,
            maxWidth: 700,
          }}
        >
          Operating systems, governance frameworks, and structured workflows
          that turn content into a reliable, AI-ready asset.
        </div>

        {/* URL */}
        <div
          style={{
            color: "#AAF870",
            fontSize: 24,
            fontWeight: 700,
            marginTop: 50,
          }}
        >
          ecm.dev
        </div>
      </div>
    ),
    { ...size }
  );
}
