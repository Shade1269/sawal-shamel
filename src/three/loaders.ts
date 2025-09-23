// @ts-nocheck
import { LoadingManager, TextureLoader } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const gltfLoaderCache = new Map();
const textureLoaderCache = new Map();
const nodeModelAvailabilityCache = new Map();

const isNodeEnvironment = typeof window === "undefined" && typeof process !== "undefined";

function normalizeModelPath(path) {
  if (typeof path !== "string") {
    return "";
  }
  return path.replace(/^\//, "");
}

async function ensureModelFileAvailable(path) {
  if (!isNodeEnvironment) {
    return true;
  }

  const normalized = normalizeModelPath(path);
  if (
    !normalized ||
    normalized.startsWith("http://") ||
    normalized.startsWith("https://")
  ) {
    return true;
  }

  if (nodeModelAvailabilityCache.has(normalized)) {
    return nodeModelAvailabilityCache.get(normalized) ?? false;
  }

  try {
    const fs = await import(/* @vite-ignore */ "node:fs/promises");
    const pathModule = await import(/* @vite-ignore */ "node:path");
    const absolutePath = pathModule.resolve(process.cwd(), "public", normalized);
    await fs.access(absolutePath);
    nodeModelAvailabilityCache.set(normalized, true);
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`[three] Missing GLB asset: ${path}`, error);
    nodeModelAvailabilityCache.set(normalized, false);
    return false;
  }
}

function createMissingModelError(path) {
  const error = new Error(`GLB asset not found at ${path}`);
  // @ts-ignore assign custom code for downstream error handling
  error.code = "MODEL_NOT_FOUND";
  return error;
}

export const GLB_EXAMPLES = Object.freeze({
  cube: "/models/cube.glb",
  sphere: "/models/sphere.glb",
  model: "/models/model.glb",
});

export function resolveExampleModel(key) {
  return GLB_EXAMPLES[key];
}

export function loadExampleModel(key, options = {}) {
  return loadGLBModel(resolveExampleModel(key), options);
}

function createAbortError() {
  return new DOMException("Loading aborted", "AbortError");
}

export async function loadGLBModel(path, options = {}) {
  if (!path) {
    throw new Error("GLB path is required");
  }

  if (gltfLoaderCache.has(path)) {
    return gltfLoaderCache.get(path);
  }

  const hasAsset = await ensureModelFileAvailable(path);
  if (!hasAsset) {
    throw createMissingModelError(path);
  }

  const promise = new Promise((resolve, reject) => {
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

export async function loadTexture(path, options = {}) {
  if (!path) {
    throw new Error("Texture path is required");
  }

  if (textureLoaderCache.has(path)) {
    return textureLoaderCache.get(path);
  }

  const promise = new Promise((resolve, reject) => {
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
}
