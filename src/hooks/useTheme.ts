import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getTheme } from "@/themes/registry";
// ThemeConfig reserved for future use
import { getContrastRatio } from "@/utils/color";

export type ThemeContextValue = {
  themeId: string;
  themeConfig: any;
  setThemeId: (nextThemeId: string) => void;
};

export const THEME_STORAGE_KEY = "theme:id";

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function applyThemeToDocument(themeConfig: any) {
  if (typeof document === "undefined" || !themeConfig) return;

  const root = document.documentElement;
  root.setAttribute("data-theme", themeConfig.id);

  const contrast = getContrastRatio(themeConfig.colors.fg, themeConfig.colors.bg);
  if (Number.isFinite(contrast) && contrast < 4.5) {
    console.warn(
      `[theme] Low contrast ratio detected for theme "${themeConfig.id}": ${contrast.toFixed(2)} : 1. ` +
        "Consider adjusting 'colors.fg' or 'colors.bg' for better readability."
    );
  }
}

function useThemeController(defaultThemeId: string = "ferrari"): ThemeContextValue {
  const [themeId, setThemeIdState] = useState<string>(() => {
    if (typeof window === "undefined") {
      return defaultThemeId;
    }
    try {
      const stored = window.localStorage?.getItem(THEME_STORAGE_KEY);
      return stored ?? defaultThemeId;
    } catch {
      // Safari Private mode may block localStorage
      return defaultThemeId;
    }
  });

  const themeConfig = useMemo(() => getTheme(themeId) as any, [themeId]);

  const setThemeId = useCallback((nextThemeId: string) => {
    setThemeIdState(nextThemeId);
    if (typeof window !== "undefined") {
      try {
        window.localStorage?.setItem(THEME_STORAGE_KEY, nextThemeId);
      } catch {
        // ignore storage errors
      }
    }
  }, []);

  useEffect(() => {
    applyThemeToDocument(themeConfig);
  }, [themeConfig]);

  return useMemo(
    () => ({
      themeId,
      setThemeId,
      themeConfig,
    }),
    [themeId, setThemeId, themeConfig]
  );
}

export function useTheme(_defaultThemeId?: string): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      "useTheme must be used within a ThemeProvider. If you need isolated theme state, use useThemeState instead.",
    );
  }
  return context;
}

export function useThemeState(defaultThemeId?: string): ThemeContextValue {
  return useThemeController(defaultThemeId);
}
