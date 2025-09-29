export type ThemeColors = {
  bg: string;
  fg: string;
  primary: string;
  primaryFg?: string;
  secondary?: string;
  secondaryFg?: string;
  muted?: string;
  mutedFg?: string;
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
  border?: string;
};

export type ThemeRadii = {
  sm: string;
  md: string;
  lg: string;
  xl?: string;
};

export type ThemeSpacing = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
};

export type ThemeTypography = {
  fontFamily: string;
  baseSize: number;
  lineHeight: number;
  weight?: {
    normal: number;
    medium: number;
    bold: number;
  };
};


export type ThemeComponentsConfig = {
  button?: {
    radius?: keyof ThemeRadii;
    height?: number;
    paddingX?: string;
    variants?: Array<'solid' | 'outline' | 'ghost'>;
  };
  card?: {
    radius?: keyof ThemeRadii;
    shadow?: string;
  };
  input?: {
    radius?: keyof ThemeRadii;
  };
  badge?: {
    radius?: keyof ThemeRadii;
  };
};

export type ThemeConfig = {
  id: string;
  name: string;
  colors: ThemeColors;
  radii: ThemeRadii;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  components?: ThemeComponentsConfig;
};
