import defaultTheme from "./default/theme.json" with { type: "json" };
import luxuryTheme from "./luxury/theme.json" with { type: "json" };
import damascusTheme from "./damascus/theme.json" with { type: "json" };
import feminineTheme from "./feminine/theme.json" with { type: "json" };
import modernTheme from "./modern/theme.json" with { type: "json" };
import elegantTheme from "./elegant/theme.json" with { type: "json" };
import goldTheme from "./gold/theme.json" with { type: "json" };
import allianceSpecialTheme from "./alliance_special/theme.json" with { type: "json" };
import legendaryTheme from "./legendary/theme.json" with { type: "json" };

const defaultConfig = defaultTheme;
const luxuryConfig = luxuryTheme;
const damascusConfig = damascusTheme;
const feminineConfig = feminineTheme;
const modernConfig = modernTheme;
const elegantConfig = elegantTheme;
const goldConfig = goldTheme;
const allianceSpecialConfig = allianceSpecialTheme;
const legendaryConfig = legendaryTheme;

export const THEMES = {
  [defaultConfig.id]: defaultConfig,
  [luxuryConfig.id]: luxuryConfig,
  [damascusConfig.id]: damascusConfig,
  [feminineConfig.id]: feminineConfig,
  [modernConfig.id]: modernConfig,
  [elegantConfig.id]: elegantConfig,
  [goldConfig.id]: goldConfig,
  [allianceSpecialConfig.id]: allianceSpecialConfig,
  [legendaryConfig.id]: legendaryConfig,
};

export function getTheme(themeId) {
  return THEMES[themeId] ?? defaultConfig;
}
