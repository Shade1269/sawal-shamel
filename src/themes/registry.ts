// Simplified theme structure
const defaultConfig = {
  id: "default",
  name: "Default",
  colors: {
    bg: "#ffffff",
    fg: "#0f172a",
    primary: "#2563eb",
    secondary: "#f1f5f9",
    background: "#ffffff",
    foreground: "#0f172a"
  },
  radii: { 
    sm: "0.25rem",
    md: "0.5rem", 
    lg: "0.75rem",
    xl: "1rem"
  },
  spacing: { 
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem", 
    lg: "2rem",
    xl: "3rem"
  },
  typography: { 
    fontFamily: "Inter",
    baseSize: 16,
    lineHeight: 1.5
  }
};

const luxuryConfig = {
  id: "luxury", 
  name: "Luxury",
  colors: {
    bg: "#0c0c0c",
    fg: "#fafafa",
    primary: "#d4af37",
    secondary: "#1a1a1a",
    background: "#0c0c0c",
    foreground: "#fafafa"
  },
  radii: { 
    sm: "0.5rem",
    md: "0.75rem", 
    lg: "1rem",
    xl: "1.5rem"
  },
  spacing: { 
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem", 
    lg: "2rem",
    xl: "3rem"
  },
  typography: { 
    fontFamily: "Playfair Display",
    baseSize: 16,
    lineHeight: 1.6
  }
};

const damascusConfig = {
  id: "damascus",
  name: "Damascus Heritage",
  colors: {
    bg: "#0c0c0c",
    fg: "#E8E0CF", 
    primary: "#B89A5A",
    secondary: "#111111",
    background: "#0c0c0c",
    foreground: "#E8E0CF",
    muted: "#B8AC90",
    gold: "#B89A5A",
    border: "#2a2214",
    panel: "#111111"
  },
  radii: { 
    sm: "0.5rem",
    md: "1rem", 
    lg: "1rem",
    xl: "1rem"
  },
  spacing: { 
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem", 
    lg: "2rem",
    xl: "3rem"
  },
  typography: { 
    fontFamily: "Cairo, Noto Sans Arabic, sans-serif",
    headingFont: "Cairo, Noto Sans Arabic, serif",
    baseSize: 16,
    lineHeight: 1.5
  },
  effects: {
    shadows: "luxury",
    gradients: true,
    ornaments: true,
    animations: "elegant"
  }
};

const ferrariConfig = {
  id: "ferrari",
  name: "Ferrari Luxury",
  colors: {
    bg: "#0a0e1a",
    fg: "#e8eaf0",
    primary: "#c41e3a",
    secondary: "#1a2332",
    background: "#0a0e1a",
    foreground: "#e8eaf0",
    muted: "#4a5568",
    accent: "#c41e3a",
    accentForeground: "#ffffff",
    card: "#141b2e",
    cardForeground: "#e8eaf0",
    popover: "#1a2332",
    popoverForeground: "#e8eaf0",
    border: "#2d3748",
    input: "#1a2332",
    ring: "#c41e3a",
    destructive: "#dc2626",
    destructiveForeground: "#ffffff",
    navy: "#0a0e1a",
    navyLight: "#1a2332",
    navyDark: "#050811",
    red: "#c41e3a",
    redLight: "#dc2f47",
    redDark: "#a01829",
    silver: "#c0c5ce",
    silverLight: "#d4d8e0",
    metallic: "#8892a6"
  },
  radii: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    xxl: "2rem"
  },
  spacing: {
    xs: "0.5rem",
    sm: "1rem",
    md: "1.5rem",
    lg: "2rem",
    xl: "3rem",
    xxl: "4rem"
  },
  typography: {
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    headingFont: "Montserrat, Inter, sans-serif",
    baseSize: 16,
    lineHeight: 1.6,
    headingWeight: 700,
    bodyWeight: 400
  },
  effects: {
    shadows: "premium",
    gradients: true,
    glow: true,
    blur: true,
    animations: "smooth",
    glassEffect: true
  },
  gradients: {
    primary: "linear-gradient(135deg, #c41e3a 0%, #a01829 100%)",
    secondary: "linear-gradient(135deg, #1a2332 0%, #0a0e1a 100%)",
    accent: "linear-gradient(135deg, #c41e3a 0%, #dc2f47 50%, #c41e3a 100%)",
    metallic: "linear-gradient(135deg, #8892a6 0%, #c0c5ce 50%, #8892a6 100%)",
    glass: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
    navyGlow: "radial-gradient(circle at 50% 0%, rgba(196,30,58,0.15) 0%, transparent 70%)"
  },
  shadows: {
    sm: "0 2px 8px rgba(0,0,0,0.4)",
    md: "0 4px 16px rgba(0,0,0,0.5)",
    lg: "0 8px 32px rgba(0,0,0,0.6)",
    xl: "0 12px 48px rgba(0,0,0,0.7)",
    glow: "0 0 20px rgba(196,30,58,0.4), 0 0 40px rgba(196,30,58,0.2)",
    glowStrong: "0 0 30px rgba(196,30,58,0.6), 0 0 60px rgba(196,30,58,0.3)",
    inner: "inset 0 2px 8px rgba(0,0,0,0.3)",
    glass: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)"
  }
};

export const THEMES = {
  [defaultConfig.id]: defaultConfig,
  [luxuryConfig.id]: luxuryConfig,
  [damascusConfig.id]: damascusConfig,
  [ferrariConfig.id]: ferrariConfig,
};

export function getTheme(themeId: string) {
  return THEMES[themeId] ?? defaultConfig;
}
