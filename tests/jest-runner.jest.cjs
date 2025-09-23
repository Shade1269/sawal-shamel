const { spawnSync } = require('node:child_process');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const loaderPath = path.resolve(rootDir, 'tests/ts-loader.mjs');

const runNodeTests = () => {
  const result = spawnSync(process.execPath, ['--loader', loaderPath, '--test'], {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.error) {
    throw result.error;
  }

  expect(result.status).toBe(0);
};

test('node test runner suite passes', runNodeTests);
