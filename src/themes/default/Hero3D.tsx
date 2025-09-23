import React, { memo, useMemo } from "react";
import { SimpleScene } from "@/three/SimpleScene";
import { useTheme } from "@/hooks/useTheme";
import theme from "./theme.json" with { type: "json" };

const fallbackTheme = theme;

export const Hero3D = memo(function DefaultHero3D() {
  const { themeConfig } = useTheme();
  const activeTheme = useMemo(
    () => (themeConfig?.id === fallbackTheme.id ? themeConfig : fallbackTheme),
    [themeConfig]
  );

  const borderColor = activeTheme.colors.surfaceBorder ?? activeTheme.colors.border ?? "rgba(88, 166, 255, 0.2)";
  const modelLabel = activeTheme.three?.model?.example === "cube" ? "مكعب" : "نموذج";
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
        color: "var(--surface-fg, var(--fg))",
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
        config: activeTheme.three,
        accentColor: activeTheme.colors.primary,
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
  );
});

export default Hero3D;
