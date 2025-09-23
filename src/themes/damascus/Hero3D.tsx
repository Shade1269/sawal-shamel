import React, { memo } from "react";
import { SimpleScene } from "@/three/SimpleScene";
import theme from "./theme.json" with { type: "json" };

const themeConfig = theme;

export const Hero3D = memo(function DamascusHero3D() {
  const borderColor = themeConfig.colors.border ?? "rgba(92, 196, 184, 0.35)";
  const modelLabel = themeConfig.three?.model?.example === "model" ? "منحوتة دمشقية" : "نموذج ثلاثي";
  return (
    <section
      style={{
        width: "100%",
        minHeight: "320px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1.5rem",
        background: "linear-gradient(140deg, rgba(15,26,28,0.92), rgba(25,38,42,0.72))",
        color: "var(--fg)",
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${borderColor}`,
        padding: "1.75rem",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div style={{ position: "relative", minHeight: "280px" }} data-hero-canvas>
        <SimpleScene
          config={themeConfig.three}
          accentColor={themeConfig.colors.primary}
          className="hero-3d__canvas damascus"
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "0.75rem", textAlign: "start" }}>
        <p style={{ fontSize: "1.8rem", fontWeight: 700 }}>مشهد دمشق الغامرة</p>
        <p style={{ lineHeight: 1.65, fontSize: "1.02rem", opacity: 0.85 }}>
          {`${modelLabel} حقيقي بصيغة GLB يدور بسلاسة مع إضاءة ضبابية وخلفية ضوئية مستوحاة من الأزقة التاريخية.`}
        </p>
        <ul style={{ margin: 0, paddingInlineStart: "1.1rem", display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.95rem" }}>
          {["إضاءة موجهة ومحورية قابلة للظلال الناعمة", "تأثير ضباب اختياري لإبراز العمق", "نماذج GLB حقيقية يمكن تبديلها بين الثيمات"].map((item, index) => (
            <li key={index} style={{ opacity: 0.82 }}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
});

export default Hero3D;
