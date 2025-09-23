import React, { memo } from "react";
import { SimpleScene } from "@/three/SimpleScene";
import theme from "./theme.json" with { type: "json" };

const themeConfig = theme;

export const Hero3D = memo(function OceanBreezeHero3D() {
  const borderColor = themeConfig.colors.border ?? "rgba(41, 182, 246, 0.3)";
  const hasBloom = Boolean(themeConfig.three?.effects?.bloom?.enabled);
  
  return (
    <section
      style={{
        width: "100%",
        minHeight: "320px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1.5rem",
        background: "linear-gradient(135deg, rgba(10,25,41,0.95), rgba(30,58,138,0.75))",
        color: "var(--fg)",
        borderRadius: "var(--radius-lg)",
        border: `1px solid ${borderColor}`,
        padding: "1.75rem",
        boxShadow: "0 12px 32px rgba(41, 182, 246, 0.2)",
      }}
    >
      <div style={{ position: "relative", minHeight: "280px" }} data-hero-canvas>
        <SimpleScene
          config={themeConfig.three}
          accentColor={themeConfig.colors.primary}
          className="hero-3d__canvas ocean-breeze"
        />
      </div>
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "center", 
        gap: "0.75rem", 
        textAlign: "start" 
      }}>
        <p style={{ 
          fontSize: "1.8rem", 
          fontWeight: 700,
          color: themeConfig.colors.primary,
          textShadow: "0 2px 4px rgba(41, 182, 246, 0.3)"
        }}>
          نسيم المحيط التفاعلي
        </p>
        <p style={{ 
          lineHeight: 1.6, 
          fontSize: "1.05rem", 
          opacity: 0.9,
          color: themeConfig.colors.fg
        }}>
          {hasBloom
            ? "كرة مضيئة تحاكي أعماق المحيط مع تأثيرات التوهج الطبيعي وإضاءة زرقاء هادئة تخلق جواً من الصفاء والهدوء."
            : "مشهد محيطي هادئ بألوان زرقاء متدرجة يوحي بعمق البحر وصفاء المياه."
          }
        </p>
        <ul style={{ 
          margin: 0, 
          paddingInlineStart: "1.2rem", 
          display: "flex", 
          flexDirection: "column", 
          gap: "0.5rem", 
          fontSize: "0.95rem" 
        }}>
          {[
            "إضاءة محيطية تحاكي ضوء الماء المتراقص",
            "تأثير توهج طبيعي يعكس عمق البحر", 
            "ألوان زرقاء هادئة ومريحة للعين",
            "دوران ناعم يحاكي حركة التيارات المائية"
          ].map((item, index) => (
            <li key={index} style={{ 
              opacity: 0.85,
              color: themeConfig.colors.secondary
            }}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
});

export default Hero3D;