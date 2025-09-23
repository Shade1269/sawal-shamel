import { LoadingManager, Texture, TextureLoader } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type GLBResource = GLTF;
export type TextureResource = Texture;

export interface LoaderOptions {
  signal?: AbortSignal;
  manager?: LoadingManager;
}

const gltfLoaderCache = new Map<string, Promise<GLBResource>>();
const textureLoaderCache = new Map<string, Promise<TextureResource>>();
const nodeModelAvailabilityCache = new Map<string, boolean>();

type ServerAvailabilityModule = {
  ensureModelFileAvailable: (path: string) => Promise<boolean>;
  clearModelAvailabilityCache: () => void;
};

let serverAvailabilityModule: ServerAvailabilityModule | null = null;
let serverAvailabilityModulePromise: Promise<ServerAvailabilityModule | null> | null = null;

function normalizeModelPath(path: string) {
  if (typeof path !== "string") {
    return "";
  }
  return path.replace(/^\//, "");
}

async function loadServerAvailability(): Promise<ServerAvailabilityModule | null> {
  if (!import.meta.env?.SSR) {
    return null;
  }

  if (serverAvailabilityModule) {
    return serverAvailabilityModule;
  }

  if (!serverAvailabilityModulePromise) {
    const modulePath = ["./server", "modelAvailability.ts"].join("/");
    serverAvailabilityModulePromise = import(/* @vite-ignore */ modulePath).then((module) => {
      serverAvailabilityModule = {
        ensureModelFileAvailable: module.ensureModelFileAvailable,
        clearModelAvailabilityCache: module.clearModelAvailabilityCache,
      };
      return serverAvailabilityModule;
    }).catch((error) => {
      console.warn("[three] Failed to load server model availability module", error);
      serverAvailabilityModule = null;
      return null;
    });
  }

  return serverAvailabilityModulePromise;
}

async function ensureModelFileAvailable(path: string): Promise<boolean> {
  const normalized = normalizeModelPath(path);
  if (
    !normalized ||
    normalized.startsWith("http://") ||
    normalized.startsWith("https://")
  ) {
    return true;
  }

  if (!import.meta.env?.SSR) {
    return true;
  }

  if (nodeModelAvailabilityCache.has(normalized)) {
    return nodeModelAvailabilityCache.get(normalized) ?? false;
  }

  const availabilityModule = await loadServerAvailability();
  if (!availabilityModule) {
    return true;
  }

  try {
    const available = await availabilityModule.ensureModelFileAvailable(normalized);
    nodeModelAvailabilityCache.set(normalized, available);
    return available;
  } catch (error) {
    console.warn(`[three] Missing GLB asset: ${normalized}`, error);
    nodeModelAvailabilityCache.set(normalized, false);
    return false;
  }
}

function createMissingModelError(path: string): Error {
  const error = new Error(`GLB asset not found at ${path}`);
  (error as Error & { code?: string }).code = "MODEL_NOT_FOUND";
  return error;
}

export const GLB_EXAMPLES = Object.freeze({
  cube: "/models/cube.glb",
  sphere: "/models/sphere.glb",
  model: "/models/model.glb",
});

export type ExampleModelKey = keyof typeof GLB_EXAMPLES;

export function resolveExampleModel(key: ExampleModelKey): string {
  return GLB_EXAMPLES[key];
}

export function loadExampleModel(key: ExampleModelKey, options: LoaderOptions = {}) {
  return loadGLBModel(resolveExampleModel(key), options);
}

function createAbortError(): Error {
  return new DOMException("Loading aborted", "AbortError");
}

export async function loadGLBModel(path: string, options: LoaderOptions = {}): Promise<GLBResource> {
  if (!path) {
    throw new Error("GLB path is required");
  }

  if (gltfLoaderCache.has(path)) {
    return gltfLoaderCache.get(path)!;
  }

  const hasAsset = await ensureModelFileAvailable(path);
  if (!hasAsset) {
    throw createMissingModelError(path);
  }

  const promise = new Promise<GLBResource>((resolve, reject) => {
    const manager = options.manager ?? new LoadingManager();
    const loader = new GLTFLoader(manager);

    const cleanup = () => {
      if (options.signal) {
        options.signal.removeEventListener("abort", onAbort);
      }
    };

    const onAbort = () => {
      cleanup();
      reject(createAbortError());
    };

    if (options.signal?.aborted) {
      cleanup();
      reject(createAbortError());
      return;
    }

    options.signal?.addEventListener("abort", onAbort, { once: true });

    loader.load(
      path,
      (gltf) => {
        cleanup();
        resolve(gltf);
      },
      undefined,
      (error) => {
        cleanup();
        reject(error);
      }
    );
  });

  gltfLoaderCache.set(path, promise);
  return promise;
}

export async function loadTexture(path: string, options: LoaderOptions = {}): Promise<TextureResource> {
  if (!path) {
    throw new Error("Texture path is required");
  }

  if (textureLoaderCache.has(path)) {
    return textureLoaderCache.get(path)!;
  }

  const promise = new Promise<TextureResource>((resolve, reject) => {
    const manager = options.manager ?? new LoadingManager();
    const loader = new TextureLoader(manager);

    const cleanup = () => {
      if (options.signal) {
        options.signal.removeEventListener("abort", onAbort);
      }
    };

    const onAbort = () => {
      cleanup();
      reject(createAbortError());
    };

    if (options.signal?.aborted) {
      cleanup();
      reject(createAbortError());
      return;
    }

    options.signal?.addEventListener("abort", onAbort, { once: true });

    loader.load(
      path,
      (texture) => {
        cleanup();
        resolve(texture);
      },
      undefined,
      (error) => {
        cleanup();
        reject(error);
      }
    );
  });

  textureLoaderCache.set(path, promise);
  return promise;
}

export function clearLoaderCaches() {
  gltfLoaderCache.clear();
  textureLoaderCache.clear();
  nodeModelAvailabilityCache.clear();
  if (serverAvailabilityModule) {
    serverAvailabilityModule.clearModelAvailabilityCache();
  }
}
