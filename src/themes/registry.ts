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
  name: "Damascus",
  colors: {
    bg: "#2d2d2d",
    fg: "#f4f4f0", 
    primary: "#d4af37",
    secondary: "#404040",
    background: "#2d2d2d",
    foreground: "#f4f4f0"
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
    fontFamily: "Cairo",
    baseSize: 16,
    lineHeight: 1.5
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