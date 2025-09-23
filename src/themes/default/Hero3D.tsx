import { memo } from "react";

export const Hero3D = memo(function DefaultHero3D() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        background: "var(--bg)",
        color: "var(--fg)",
        borderRadius: "1rem",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <span>Default 3D hero placeholder</span>
    </div>
  );
});

export default Hero3D;
