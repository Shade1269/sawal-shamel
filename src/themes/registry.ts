import defaultTheme from "./default/theme.json" with { type: "json" };
import luxuryTheme from "./luxury/theme.json" with { type: "json" };
import damascusTheme from "./damascus/theme.json" with { type: "json" };

const defaultConfig = defaultTheme;
const luxuryConfig = luxuryTheme;
const damascusConfig = damascusTheme;

export const THEMES = {
  [defaultConfig.id]: defaultConfig,
  [luxuryConfig.id]: luxuryConfig,
  [damascusConfig.id]: damascusConfig,
};

export function getTheme(themeId) {
  return THEMES[themeId] ?? defaultConfig;
}
