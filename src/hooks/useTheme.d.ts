import type * as React from 'react';
import type { ThemeConfig } from '@/themes/types';

export interface ThemeContextValue {
  themeId: string;
  setThemeId: (nextThemeId: string) => void;
  themeConfig: ThemeConfig;
}

export declare const THEME_STORAGE_KEY: string;
export declare const ThemeContext: React.Context<ThemeContextValue | undefined>;
export declare function applyThemeToDocument(themeConfig: ThemeConfig | null | undefined): void;
export declare function useTheme(defaultThemeId?: string): ThemeContextValue;
export declare function useThemeState(defaultThemeId?: string): ThemeContextValue;
