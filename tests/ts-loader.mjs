import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const loaderDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(loaderDir, '..');

const aliasBase = path.resolve(projectRoot, 'src');

const candidateExtensions = ['.js', '.ts', '.tsx', '.jsx', '/index.js', '/index.ts', '/index.tsx'];

async function resolveAlias(specifier) {
  const relativePath = specifier.slice(2);
  const basePath = path.resolve(aliasBase, relativePath);

  for (const ext of candidateExtensions) {
    const candidate = basePath.endsWith(ext) ? basePath : `${basePath}${ext}`;
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) {
        return pathToFileURL(candidate).href;
      }
    } catch {
      // Ignore missing candidates
    }
  }

  return null;
}

export async function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith('@/')) {
    const resolved = await resolveAlias(specifier);
    if (resolved) {
      return { url: resolved, shortCircuit: true };
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (url.endsWith('.tsx')) {
    const source = await fs.readFile(fileURLToPath(url), 'utf8');
    return { format: 'module', source, shortCircuit: true };
  }

  return defaultLoad(url, context, defaultLoad);
}
