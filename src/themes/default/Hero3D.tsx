
import React, { memo } from "react";
import { SimpleScene } from "@/three/SimpleScene";
import theme from "./theme.json" with { type: "json" };

const themeConfig = theme;

export const Hero3D = memo(function DefaultHero3D() {
  const borderColor = themeConfig.colors.border ?? "rgba(88, 166, 255, 0.2)";
  const modelLabel = themeConfig.three?.model?.example === "cube" ? "مكعب" : "نموذج";
  return React.createElement(
    "section",
    {
      style: {
        width: "100%",
        minHeight: "320px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1.5rem",
        background: "linear-gradient(135deg, rgba(13,17,23,0.85), rgba(13,17,23,0.6))",
        color: "var(--fg)",
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${borderColor}`,
        padding: "1.5rem",
        boxShadow: "var(--shadow-card)",
      },
    },
    React.createElement(
      "div",
      { style: { position: "relative", minHeight: "280px" } },
      React.createElement(SimpleScene, {
        config: themeConfig.three,
        accentColor: themeConfig.colors.primary,
        className: "hero-3d__canvas",
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
        { style: { fontSize: "1.75rem", fontWeight: 700 } },
        "منظر ثلاثي الأبعاد تفاعلي"
      ),
      React.createElement(
        "p",
        { style: { lineHeight: 1.6, fontSize: "1rem", opacity: 0.85 } },
        `${modelLabel} بصيغة GLB يتم تحميله من loaders.ts ويستفيد من إعدادات الكاميرا والإضاءة الخاصة بالثيم.`
      ),
      React.createElement(
        "ul",
        {
          style: {
            margin: 0,
            paddingInlineStart: "1.1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
            fontSize: "0.9rem",
            opacity: 0.85,
          },
        },
        [
          "كاميرا مهيأة مسبقاً بزاوية 45° ومسافة واقعية",
          "ضوء موجه بالإضافة إلى مصدر نقطي لتفاصيل المعادن",
          "ضباب خفيف وظلال ناعمة يتم ضبطها عبر theme.json",
        ].map((item, index) =>
          React.createElement(
            "li",
            { key: index },
            item
          )
        )
      )
    )
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
