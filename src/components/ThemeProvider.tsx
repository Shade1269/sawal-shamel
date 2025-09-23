import React, { useEffect } from "react";
import { ThemeContext, useThemeState } from "../hooks/useTheme";

export function ThemeProvider({ children, defaultThemeId = "default" }) {
  const themeState = useThemeState(defaultThemeId);

  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.documentElement.removeAttribute("data-theme");
      }
    };
  }, []);

  return React.createElement(ThemeContext.Provider, { value: themeState }, children);
}

export default ThemeProvider;
