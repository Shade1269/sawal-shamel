// Temporary simple theme structure
const defaultConfig = {
  id: "default",
  name: "Default",
  colors: {
    background: "#ffffff",
    foreground: "#0f172a",
    primary: "#2563eb",
    secondary: "#f1f5f9",
    bg: "#ffffff"
  },
  radii: { default: "0.5rem" },
  spacing: { md: "1rem" },
  typography: { fontFamily: "Inter" }
};

const luxuryConfig = {
  id: "luxury", 
  name: "Luxury",
  colors: {
    background: "#0c0c0c",
    foreground: "#fafafa",
    primary: "#d4af37",
    secondary: "#1a1a1a",
    bg: "#0c0c0c"
  },
  radii: { default: "0.75rem" },
  spacing: { md: "1rem" },
  typography: { fontFamily: "Playfair Display" }
};

const damascusConfig = {
  id: "damascus",
  name: "Damascus",
  colors: {
    background: "#0a1016",
    foreground: "#f4f4f0", 
    primary: "#d4af37",
    secondary: "#1a2632",
    bg: "#0a1016"
  },
  radii: { default: "0.75rem" },
  spacing: { md: "1rem" },
  typography: { fontFamily: "Cairo" }
};

export const THEMES = {
  [defaultConfig.id]: defaultConfig,
  [luxuryConfig.id]: luxuryConfig,
  [damascusConfig.id]: damascusConfig,
};

export function getTheme(themeId: string) {
  return THEMES[themeId] ?? defaultConfig;
}