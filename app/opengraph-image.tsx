import { ImageResponse } from "next/og";

export const alt = "SSC2 League — Programming and Data Science";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 76px",
          color: "#e2e8f0",
          background:
            "radial-gradient(ellipse at 82% 15%, #164e63 0%, transparent 38%), linear-gradient(135deg, #071321 0%, #0f172a 58%, #111827 100%)",
          fontFamily: "Arial, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -110,
            bottom: -270,
            width: 690,
            height: 690,
            border: "1px solid rgba(34, 211, 238, 0.24)",
            transform: "rotate(45deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 18,
            bottom: -310,
            width: 690,
            height: 690,
            border: "1px solid rgba(251, 191, 36, 0.18)",
            transform: "rotate(45deg)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path d="M32 5 59 57H5L32 5Z" stroke="#22d3ee" strokeWidth="4" strokeLinejoin="round" />
            <path d="M32 19 47 48H17L32 19Z" stroke="#fbbf24" strokeOpacity=".65" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ fontSize: 43, fontWeight: 800, letterSpacing: 8, color: "#f1f5f9" }}>SSC2</span>
            <span style={{ marginTop: 8, fontSize: 15, fontWeight: 700, letterSpacing: 7, color: "#22d3ee" }}>LEAGUE</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 840 }}>
          <div style={{ color: "#22d3ee", fontSize: 18, fontWeight: 700, letterSpacing: 5 }}>LEARN · BUILD · COMPETE</div>
          <div style={{ fontSize: 62, lineHeight: 1.08, fontWeight: 750, letterSpacing: -2 }}>
            Programming &amp; Data Science
          </div>
          <div style={{ color: "#94a3b8", fontSize: 25, lineHeight: 1.4 }}>
            Course challenges, student progress, and league standings.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#64748b", fontSize: 15, letterSpacing: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: 8, background: "#22d3ee" }} />
          SSC2 LEARNING ARENA
        </div>
      </div>
    ),
    size,
  );
}
