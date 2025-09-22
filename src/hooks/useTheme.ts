import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemeContextValue = {
  themeId: string;
  setThemeId: (nextThemeId: string) => void;
};

export const THEME_STORAGE_KEY = "theme:id";

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function useThemeController(defaultThemeId: string = "default"): ThemeContextValue {
  const [themeId, setThemeIdState] = useState<string>(() => {
    if (typeof window === "undefined") {
      return defaultThemeId;
    }

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored ?? defaultThemeId;
  });

  const setThemeId = useCallback((nextThemeId: string) => {
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

  return useMemo(() => ({ themeId, setThemeId }), [themeId, setThemeId]);
}

export function useTheme(defaultThemeId?: string): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context) {
    return context;
  }

  return useThemeController(defaultThemeId);
}

export function useThemeState(defaultThemeId?: string): ThemeContextValue {
  return useThemeController(defaultThemeId);
}
