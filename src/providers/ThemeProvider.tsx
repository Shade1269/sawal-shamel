import React, { createContext, useContext, useEffect, useState } from 'react';
import { getTheme } from '@/themes/registry';
import type { ThemeConfig } from '@/themes/types';

/**
 * Unified Theme Provider
 * Single source of truth for theme management across the platform
 */

export interface ThemeContextValue {
  themeId: string;
  setThemeId: (id: string) => void;
  theme: any;
  availableThemes: Array<{ id: string; name: string }>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = 'app-theme';
const DEFAULT_THEME = 'ferrari';

const AVAILABLE_THEMES = [
  { id: 'default', name: 'التصميم الافتراضي' },
  { id: 'luxury', name: 'الفخامة الذهبية' },
  { id: 'damascus', name: 'تراث دمشق' },
  { id: 'ferrari', name: 'فيراري الرياضي' },
];

function applyTheme(theme: any) {
  if (typeof document === 'undefined' || !theme) return;
  
  const root = document.documentElement;
  root.setAttribute('data-theme', theme.id);
  
  // Apply CSS variables from theme
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value as string);
    });
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_THEME;
    
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  const theme = getTheme(themeId);

  const setThemeId = (id: string) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const value: ThemeContextValue = {
    themeId,
    setThemeId,
    theme,
    availableThemes: AVAILABLE_THEMES,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
