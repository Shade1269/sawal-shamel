import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getTheme } from "@/themes/registry";
import { getContrastRatio } from "@/utils/color";

export const THEME_STORAGE_KEY = "theme:id";

export const ThemeContext = createContext(undefined);

export function applyThemeToDocument(themeConfig) {
  if (typeof document === "undefined" || !themeConfig) {
    return;
  }

  const root = document.documentElement;
  root.setAttribute("data-theme", themeConfig.id);

  const contrast = getContrastRatio(themeConfig.colors.fg, themeConfig.colors.bg);
  if (Number.isFinite(contrast) && contrast < 4.5) {
    // eslint-disable-next-line no-console
    console.warn(
      `[theme] Low contrast ratio detected for theme "${themeConfig.id}": ${contrast.toFixed(2)} : 1. ` +
        "Consider adjusting 'colors.fg' or 'colors.bg' for better readability."
    );
  }
}

function useThemeController(defaultThemeId = "default") {
  const [themeId, setThemeIdState] = useState(() => {
    if (typeof window === "undefined") {
      return defaultThemeId;
    }
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored ?? defaultThemeId;
  });

  const themeConfig = useMemo(() => getTheme(themeId), [themeId]);

  const setThemeId = useCallback((nextThemeId) => {
    setThemeIdState(nextThemeId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextThemeId);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
    }
  }, [themeId]);

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

export function useTheme(defaultThemeId) {
  const context = useContext(ThemeContext);
  if (context) {
    return context;
  }
  return useThemeController(defaultThemeId);
}

export function useThemeState(defaultThemeId) {
  return useThemeController(defaultThemeId);
}
