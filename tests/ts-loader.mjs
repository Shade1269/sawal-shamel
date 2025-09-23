import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const loaderDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(loaderDir, '..');
const aliasBase = path.resolve(projectRoot, 'src');

async function tryResolve(basePath) {
  const candidates = [
    basePath,
    `${basePath}.js`,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.jsx`,
    path.join(basePath, 'index.js'),
    path.join(basePath, 'index.ts'),
    path.join(basePath, 'index.tsx'),
  ];

  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) {
        return pathToFileURL(candidate).href;
      }
    } catch {
      // keep scanning
    }
  }

  return null;
}

const simpleSceneStubURL = pathToFileURL(path.resolve(projectRoot, 'tests/mocks/simple-scene-stub.js')).href;
const gltfLoaderStubURL = pathToFileURL(
  path.resolve(projectRoot, 'tests/mocks/gltf-loader-stub.js')
).href;

function resolveMock(specifier) {
  const isTestEnv = (process.env.NODE_ENV ?? 'test') === 'test';
  if (isTestEnv && specifier === '@/three/SimpleScene') {
    return simpleSceneStubURL;
  }
  if (isTestEnv && specifier === 'three/examples/jsm/loaders/GLTFLoader.js') {
    return gltfLoaderStubURL;
  }
  return null;
}

export async function resolve(specifier, context, defaultResolve) {
  const mockURL = resolveMock(specifier);
  if (mockURL) {
    return { url: mockURL, shortCircuit: true };
  }

  if (specifier.startsWith('@/')) {
    const relativePath = specifier.slice(2);
    const basePath = path.resolve(aliasBase, relativePath);
    const resolved = await tryResolve(basePath);
    if (resolved) {
      return { url: resolved, shortCircuit: true };
    }
  } else if (specifier.startsWith('./') || specifier.startsWith('../')) {
    if (context.parentURL) {
      const parentPath = fileURLToPath(context.parentURL);
      const basePath = path.resolve(path.dirname(parentPath), specifier);
      const resolved = await tryResolve(basePath);
      if (resolved) {
        return { url: resolved, shortCircuit: true };
      }
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (url.endsWith('.ts') || url.endsWith('.tsx')) {
    const filename = fileURLToPath(url);
    const source = await fs.readFile(filename, 'utf8');
    return { format: 'module', source, shortCircuit: true };
  }

  return defaultLoad(url, context, defaultLoad);
}
