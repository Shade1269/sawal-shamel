import feminineTheme from "./feminine/theme.json" with { type: "json" };
import nightTheme from "./night/theme.json" with { type: "json" };
import legendaryTheme from "./legendary/theme.json" with { type: "json" };

// Default theme configuration for fallback
const defaultConfig = {
  id: "default",
  name: "Default Dark",
  colors: {
    bg: "#0d1117",
    fg: "#f0f6fc",
    primary: "#238636",
    primaryFg: "#ffffff",
    secondary: "#6e7681",
    secondaryFg: "#ffffff",
    muted: "#21262d",
    mutedFg: "#8b949e",
    success: "#238636",
    warning: "#d29922",
    danger: "#da3633",
    info: "#2f81f7",
    border: "#30363d"
  }
};

export const THEMES = {
  [defaultConfig.id]: defaultConfig,
  [feminineTheme.id]: feminineTheme,
  [nightTheme.id]: nightTheme,
  [legendaryTheme.id]: legendaryTheme,
};

export function getTheme(themeId) {
  return THEMES[themeId] ?? defaultConfig;
}
