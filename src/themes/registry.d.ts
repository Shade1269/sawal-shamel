import type { ThemeConfig } from './types';

export declare const THEMES: Record<string, ThemeConfig>;
export declare function getTheme(themeId: string): ThemeConfig;
