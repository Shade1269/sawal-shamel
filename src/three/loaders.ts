export type GLBResource = {
  scene: unknown;
};

export type TextureResource = {
  texture: unknown;
};

export interface LoaderOptions {
  signal?: AbortSignal;
}

export async function loadGLBModel(path: string, _options: LoaderOptions = {}): Promise<GLBResource | null> {
  console.warn("loadGLBModel is a placeholder. Implement actual loading for", path);
  return Promise.resolve(null);
}

export async function loadTexture(path: string, _options: LoaderOptions = {}): Promise<TextureResource | null> {
  console.warn("loadTexture is a placeholder. Implement actual loading for", path);
  return Promise.resolve(null);
}
