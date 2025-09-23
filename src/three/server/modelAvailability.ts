import { access } from "node:fs/promises";
import path from "node:path";

const availabilityCache = new Map<string, boolean>();

function resolvePublicAsset(target: string) {
  return path.resolve(process.cwd(), "public", target);
}

export async function ensureModelFileAvailable(relativePath: string): Promise<boolean> {
  if (!relativePath) {
    return true;
  }

  if (availabilityCache.has(relativePath)) {
    return availabilityCache.get(relativePath) ?? false;
  }

  const absolutePath = resolvePublicAsset(relativePath);

  try {
    await access(absolutePath);
    availabilityCache.set(relativePath, true);
    return true;
  } catch (error) {
    availabilityCache.set(relativePath, false);
    console.warn(`[three] Missing GLB asset on server: ${relativePath}`, error);
    return false;
  }
}

export function clearModelAvailabilityCache() {
  availabilityCache.clear();
}
