import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.join(__dirname, '..');
const repoRoot = path.join(frontendRoot, '..');
const pkgPath = path.join(frontendRoot, 'package.json');

function readPkg() {
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
}

test('frontend/package.json exists and is valid JSON', () => {
  assert.ok(fs.existsSync(pkgPath), 'package.json should exist');
  assert.doesNotThrow(() => readPkg(), 'package.json should be valid JSON');
});

const expectedDeps = ['zustand', '@tanstack/react-query', 'react-router-dom', 'react', 'react-dom'];

for (const dep of expectedDeps) {
  test(`package.json.dependencies contains: ${dep}`, () => {
    const pkg = readPkg();
    const deps = pkg.dependencies || {};
    assert.ok(dep in deps, `${dep} should be a dependency`);
  });
}

const expectedDirs = ['src/app', 'src/pages', 'src/widgets', 'src/features', 'src/entities', 'src/shared'];

for (const dir of expectedDirs) {
  test(`directory exists: frontend/${dir}`, () => {
    const fullPath = path.join(frontendRoot, dir);
    assert.ok(fs.existsSync(fullPath), `${dir} should exist`);
    assert.ok(fs.statSync(fullPath).isDirectory(), `${dir} should be a directory`);
  });
}

test('frontend/.env.example exists and contains VITE_API_BASE_URL=', () => {
  const envExamplePath = path.join(frontendRoot, '.env.example');
  assert.ok(fs.existsSync(envExamplePath), '.env.example should exist');
  const content = fs.readFileSync(envExamplePath, 'utf8');
  assert.ok(/^VITE_API_BASE_URL=/m.test(content), '.env.example should contain VITE_API_BASE_URL=');
});

test('git check-ignore frontend/.env exits with code 0 (ignored)', () => {
  const result = spawnSync('git', ['check-ignore', 'frontend/.env'], { cwd: repoRoot });
  assert.strictEqual(result.status, 0, 'frontend/.env should be ignored by git');
});

test('git check-ignore frontend/.env.example exits with code 1 (not ignored)', () => {
  const result = spawnSync('git', ['check-ignore', 'frontend/.env.example'], { cwd: repoRoot });
  assert.strictEqual(result.status, 1, 'frontend/.env.example should not be ignored by git');
});

test('npx tsc --noEmit exits with code 0 (no TypeScript compile errors)', () => {
  const result = spawnSync('npx', ['tsc', '--noEmit'], { cwd: frontendRoot, shell: true, encoding: 'utf8' });
  assert.strictEqual(
    result.status,
    0,
    `tsc --noEmit should succeed, stdout: ${result.stdout}, stderr: ${result.stderr}`
  );
});

test('npm run build exits with code 0 (build succeeds)', () => {
  const result = spawnSync('npm', ['run', 'build'], { cwd: frontendRoot, shell: true, encoding: 'utf8' });
  assert.strictEqual(
    result.status,
    0,
    `npm run build should succeed, stdout: ${result.stdout}, stderr: ${result.stderr}`
  );
});
