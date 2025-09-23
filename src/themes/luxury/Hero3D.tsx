import React, { memo } from "react";
import { SimpleScene } from "@/three/SimpleScene";
import theme from "./theme.json" with { type: "json" };

const themeConfig = theme;

export const Hero3D = memo(function LuxuryHero3D() {
  const borderColor = themeConfig.colors.border ?? "rgba(212, 175, 55, 0.25)";
  const hasBloom = Boolean(themeConfig.three?.effects?.bloom);
  return React.createElement(
    "section",
    {
      style: {
        width: "100%",
        minHeight: "320px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1.5rem",
        background: "linear-gradient(135deg, rgba(26,15,15,0.85), rgba(50,33,26,0.65))",
        color: "var(--fg)",
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${borderColor}`,
        padding: "1.75rem",
        boxShadow: "var(--shadow-card)",
      },
    },
    React.createElement(
      "div",
      { style: { position: "relative", minHeight: "280px" } },
      React.createElement(SimpleScene, {
        config: themeConfig.three,
        accentColor: themeConfig.colors.primary,
        className: "hero-3d__canvas luxury",
      })
    ),
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "0.75rem",
          textAlign: "start",
        },
      },
      React.createElement(
        "p",
        { style: { fontSize: "1.85rem", fontWeight: 700 } },
        "تجربة فاخرة ثلاثية الأبعاد"
      ),
      React.createElement(
        "p",
        { style: { lineHeight: 1.7, fontSize: "1.05rem", opacity: 0.85 } },
        hasBloom
          ? "نموذج Sphere متوهج بإضاءة ذهبية وتأثير Bloom لإبراز اللمعان الفاخر."
          : "نموذج Sphere ديناميكي مع إضاءة ذهبية دافئة."
      ),
      React.createElement(
        "ul",
        {
          style: {
            margin: 0,
            paddingInlineStart: "1.2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.45rem",
            fontSize: "0.95rem",
            opacity: 0.88,
          },
        },
        [
          "مصادر ضوء ثلاثية تعطي تدرجات ذهبية واقعية",
          "ظلال عالية الدقة مع mapSize أكبر للمشهد",
          "ضباب بلون النبيذ الداكن لتأكيد العمق",
        ].map((item, index) =>
          React.createElement(
            "li",
            { key: index },
            item
          )
        )
      )
    )
  );
});

export default Hero3D;
