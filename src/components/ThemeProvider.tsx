import { ReactNode, useEffect } from "react";
import { ThemeContext, useThemeState } from "../hooks/useTheme";

type ThemeProviderProps = {
  children: ReactNode;
  defaultThemeId?: string;
};

export function ThemeProvider({ children, defaultThemeId = "ferrari" }: ThemeProviderProps) {
  const themeState = useThemeState(defaultThemeId);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.setAttribute("data-theme", themeState.themeId);

    const syncThemeMetaColor = () => {
      const meta = document.querySelector('meta[name="theme-color"][data-theme-sync]');
      if (!meta) {
        return;
      }

      const computed = getComputedStyle(document.documentElement);
      const desiredToken = meta.getAttribute("data-theme-sync");
      const fallback = computed.getPropertyValue("--bg")?.trim() || "#0d1117";
      const tokenName = desiredToken === "primary" ? "--primary" : `--${desiredToken}`;
      const tokenValue = computed.getPropertyValue(tokenName)?.trim();
      if (tokenValue && tokenValue.length > 0) {
        meta.setAttribute("content", tokenValue);
      } else {
        meta.setAttribute("content", fallback);
      }
    };

    syncThemeMetaColor();
    const raf = requestAnimationFrame(syncThemeMetaColor);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.removeAttribute("data-theme");
    };
  }, [themeState.themeId]);

  return <ThemeContext.Provider value={themeState}>{children}</ThemeContext.Provider>;
}

export default ThemeProvider;