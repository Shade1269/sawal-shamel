export type SceneSurface = "canvas" | "fallback";

export interface SceneSurfaceOptions {
  enabled?: boolean;
  webglAvailable: boolean;
}

export function describeSimpleSceneSurface(options: SceneSurfaceOptions): SceneSurface;
export function detectWebGLSupport(): boolean;
