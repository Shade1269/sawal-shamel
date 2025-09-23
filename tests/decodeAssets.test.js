import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { copyFile, mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');
const tmpBase = resolve(repoRoot, 'tests', '.tmp');

async function setupTemporaryWorkspace(manifest) {
  await mkdir(tmpBase, { recursive: true });
  const tmpRoot = await mkdtemp(join(tmpBase, 'decode-'));
  const scriptSource = await readFile(resolve(repoRoot, 'scripts/decodeAssets.mjs'), 'utf8');

  for (const entry of manifest.files) {
    const sourcePath = resolve(repoRoot, entry.b64);
    const destinationPath = resolve(tmpRoot, entry.b64);
    await mkdir(dirname(destinationPath), { recursive: true });
    await copyFile(sourcePath, destinationPath);
  }

  await mkdir(resolve(tmpRoot, 'scripts'), { recursive: true });
  await writeFile(resolve(tmpRoot, 'scripts/decodeAssets.mjs'), scriptSource);

  const tempManifest = {
    ...manifest,
    outputsDir: 'models',
  };
  await writeFile(
    resolve(tmpRoot, 'assets/models.manifest.json'),
    JSON.stringify(tempManifest, null, 2)
  );

  return { tmpRoot, tempManifest };
}

test('decodeAssets writes all manifest files to the output directory', async () => {
  const manifestPath = resolve(repoRoot, 'assets/models.manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const { tmpRoot, tempManifest } = await setupTemporaryWorkspace(manifest);

  try {
    await execFileAsync('node', ['scripts/decodeAssets.mjs'], { cwd: tmpRoot });

    for (const entry of tempManifest.files) {
      const outputPath = resolve(tmpRoot, tempManifest.outputsDir, entry.out);
      const stats = await stat(outputPath);
      assert.ok(stats.size > 0, `Expected ${entry.out} to be written`);
    }
  } finally {
    await rm(tmpRoot, { recursive: true, force: true });
  }
});
