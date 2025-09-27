export interface ThemeColors {
  bg: string;
  fg: string;
  primary: string;
  primaryFg: string;
  secondary: string;
  secondaryFg: string;
  muted: string;
  mutedFg: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  border: string;
}

export interface ThemeRadii {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeTypography {
  fontFamily: string;
  baseSize: number;
  lineHeight: number;
  weight: {
    normal: number;
    medium: number;
    bold: number;
  };
}

export interface ThemeLight {
  type: string;
  intensity: number;
  position?: number[];
  color?: string;
}

export interface ThemeCamera {
  position: [number, number, number];
  fov: number;
}

export interface ThemeModel {
  example?: string;
  path?: string;
  scale?: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  autoRotate?: boolean;
  rotationSpeed?: number;
}

export interface ThemeEffects {
  bloom?: {
    enabled: boolean;
    intensity?: number;
  };
  fog?: {
    color: string;
    near: number;
    far: number;
  };
  shadow?: {
    enabled: boolean;
    bias?: number;
    mapSize?: [number, number];
    radius?: number;
  };
}

export interface ThemeThree {
  background: string;
  camera: ThemeCamera;
  lights: ThemeLight[];
  model: ThemeModel;
  effects: ThemeEffects;
}

export interface ThemeComponents {
  button?: {
    radius?: keyof ThemeRadii;
    height?: number;
    paddingX?: string;
    shadow?: string;
    variants?: string[];
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
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: ThemeColors;
  radii: ThemeRadii;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  three: ThemeThree;
  components: ThemeComponents;
}