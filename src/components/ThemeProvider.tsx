import { ReactNode, useEffect } from "react";
import { ThemeContext, useThemeState } from "../hooks/useTheme";

type ThemeProviderProps = {
  children: ReactNode;
  defaultThemeId?: string;
};

export function ThemeProvider({ children, defaultThemeId = "default" }: ThemeProviderProps) {
  const themeState = useThemeState(defaultThemeId);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.setAttribute("data-theme", themeState.themeId);

    return () => {
      document.documentElement.removeAttribute("data-theme");
    };
  }, [themeState.themeId]);

  return <ThemeContext.Provider value={themeState}>{children}</ThemeContext.Provider>;
}

export default ThemeProvider;