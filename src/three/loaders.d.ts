import type { LoadingManager, Texture } from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type GLBResource = GLTF;
export type TextureResource = Texture;

export interface LoaderOptions {
  signal?: AbortSignal;
  manager?: LoadingManager;
}

export declare const GLB_EXAMPLES: Readonly<{
  cube: string;
  sphere: string;
  model: string;
}>;

export type ExampleModelKey = keyof typeof GLB_EXAMPLES;

export declare function resolveExampleModel(key: ExampleModelKey): string;
export declare function loadExampleModel(
  key: ExampleModelKey,
  options?: LoaderOptions
): Promise<GLBResource>;
export declare function loadGLBModel(
  path: string,
  options?: LoaderOptions
): Promise<GLBResource>;
export declare function loadTexture(
  path: string,
  options?: LoaderOptions
): Promise<TextureResource>;
export declare function clearLoaderCaches(): void;
