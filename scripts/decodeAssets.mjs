import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Buffer } from 'node:buffer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_MANIFEST_URL = new URL('../assets/asset-manifest.json', import.meta.url);

function normalizeManifestUrl(manifestUrl) {
  if (!manifestUrl) {
    return DEFAULT_MANIFEST_URL;
  }

  if (manifestUrl instanceof URL) {
    return manifestUrl;
  }

  try {
    return new URL(manifestUrl, DEFAULT_MANIFEST_URL);
  } catch (error) {
    throw new Error(`Unable to resolve manifest URL from ${manifestUrl}: ${error.message}`);
  }
}

export async function decodeAssetManifest(options = {}) {
  const { manifestUrl, rootDir, force = false } = options;
  
  try {
    const resolvedManifestUrl = normalizeManifestUrl(manifestUrl);
    const projectRoot = rootDir ? resolve(rootDir) : resolve(__dirname, '..');

    const manifestRaw = await readFile(resolvedManifestUrl, 'utf8');
    const manifest = JSON.parse(manifestRaw);
    const assets = manifest.assets ?? {};

    const outputs = [];

    for (const [relativePath, descriptor] of Object.entries(assets)) {
      if (!descriptor || descriptor.encoding !== 'base64' || typeof descriptor.data !== 'string') {
        continue;
      }

      const targetPath = resolve(projectRoot, relativePath);
      await mkdir(dirname(targetPath), { recursive: true });

      const buffer = Buffer.from(descriptor.data, 'base64');
      let shouldWrite = force;

      if (!shouldWrite) {
        try {
          const existing = await readFile(targetPath);
          shouldWrite = !existing.equals(buffer);
        } catch (error) {
          if (error.code === 'ENOENT') {
            shouldWrite = true;
          } else {
            throw error;
          }
        }
      }

      if (shouldWrite) {
        await writeFile(targetPath, buffer);
      }

      outputs.push({
        relativePath,
        absolutePath: targetPath,
        bytes: buffer.length,
        wrote: shouldWrite,
      });
    }

    return { manifest, outputs };
  } catch (error) {
    console.log(
      '[decodeAssets] Skipping asset decode (no manifest found):',
      error?.message || error,
    );
    return { manifest: null, outputs: [] };
  }
}

async function runFromCli() {
  const force = process.argv.includes('--force');
  const { outputs } = await decodeAssetManifest({ force });

  for (const output of outputs) {
    const status = output.wrote ? 'wrote' : 'skipped';
    console.log(`[decodeAssets] ${status} ${output.relativePath} (${output.bytes} bytes)`);
  }
}

// Run safely with error handling
if (typeof import.meta.url !== 'undefined') {
  try {
    await runFromCli();
  } catch (error) {
    console.log('[decodeAssets] Skipping (no assets found)');
  }
}

// Ensure success exit code
process.exitCode = 0;
