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

export type ThemeThreeModel = {
  path?: string;
  example?: 'cube' | 'sphere' | 'model';
  scale?: [number, number, number] | number;
  position?: [number, number, number];
  rotation?: [number, number, number] | number;
  autoRotate?: boolean;
  rotationSpeed?: number;
};

export type ThemeThreeEffects = {
  bloom?: boolean | { enabled?: boolean; intensity?: number };
  fog?: { color: string; near?: number; far?: number };
  shadow?: { enabled?: boolean; bias?: number; mapSize?: [number, number]; radius?: number };
};

export type ThemeThree = {
  background?: string;
  camera: {
    position: [number, number, number];
    fov?: number;
  };
  lights: Array<{
    type: 'ambient' | 'directional' | 'point' | 'spot';
    intensity: number;
    position?: [number, number, number];
    color?: string;
  }>;
  model?: ThemeThreeModel;
  effects?: ThemeThreeEffects;
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
  three: ThemeThree;
  components?: ThemeComponentsConfig;
};
