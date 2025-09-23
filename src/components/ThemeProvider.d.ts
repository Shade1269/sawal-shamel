import type * as React from 'react';

export interface ThemeProviderProps {
  children?: React.ReactNode;
  defaultThemeId?: string;
}

export declare function ThemeProvider(props: ThemeProviderProps): React.ReactElement;
export default ThemeProvider;
