"use client";

import dynamic from "next/dynamic";
import "./acupoints-3d.css";

// Lazy-load the entire 3D application so Three.js, the 8 MB GLB model and
// all viewer code are never part of the server bundle or the initial JS
// payload.  The user gets a lightweight loading screen first, and the 3D
// chunk is fetched on demand only when they navigate to this page.
const AcupointApp = dynamic(
  () => import("@/components/acupoints-3d/AcupointApp").then((m) => m.AcupointApp),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          background:
            "linear-gradient(160deg, #d8e4e0 0%, #eaf1ee 45%, #d2ddd8 100%)",
          color: "#1c2a2e",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "3px solid rgba(61,139,122,0.2)",
            borderTopColor: "#3d8b7a",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <p style={{ letterSpacing: "0.08em", fontSize: 14, color: "#6a7a80" }}>
          正在加载经络穴位图…
        </p>
      </div>
    ),
  },
);

export default function Acupoints3DPage() {
  return <AcupointApp />;
}
