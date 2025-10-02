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

export const THEMES = {
  [defaultConfig.id]: defaultConfig,
  [luxuryConfig.id]: luxuryConfig,
  [damascusConfig.id]: damascusConfig,
};

export function getTheme(themeId: string) {
  return THEMES[themeId] ?? defaultConfig;
}