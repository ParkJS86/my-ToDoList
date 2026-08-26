const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const backendRoot = path.join(__dirname, '..');
const repoRoot = path.join(backendRoot, '..');
const pkgPath = path.join(backendRoot, 'package.json');

function readPkg() {
  return JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
}

test('backend/package.json exists and is valid JSON', () => {
  assert.ok(fs.existsSync(pkgPath), 'package.json should exist');
  assert.doesNotThrow(() => readPkg(), 'package.json should be valid JSON');
});

test('package.json.name is "my-todolist-backend"', () => {
  const pkg = readPkg();
  assert.strictEqual(pkg.name, 'my-todolist-backend');
});

test('package.json.main is "src/server.js"', () => {
  const pkg = readPkg();
  assert.strictEqual(pkg.main, 'src/server.js');
});

test('package.json.scripts.start is "node --env-file=.env src/server.js"', () => {
  const pkg = readPkg();
  assert.strictEqual(pkg.scripts && pkg.scripts.start, 'node --env-file=.env src/server.js');
});

test('package.json.scripts.test is "node --env-file=.env --test"', () => {
  const pkg = readPkg();
  assert.strictEqual(pkg.scripts && pkg.scripts.test, 'node --env-file=.env --test');
});

test('package.json.dependencies key set is exactly {express, pg, bcrypt, jsonwebtoken}', () => {
  const pkg = readPkg();
  const deps = pkg.dependencies || {};
  const keys = Object.keys(deps).sort();
  assert.deepStrictEqual(keys, ['bcrypt', 'express', 'jsonwebtoken', 'pg']);
});

test('package.json.dependencies does not include prisma or @prisma/client', () => {
  const pkg = readPkg();
  const deps = pkg.dependencies || {};
  assert.ok(!('prisma' in deps), 'prisma must not be a dependency');
  assert.ok(!('@prisma/client' in deps), '@prisma/client must not be a dependency');
});

test('package.json.devDependencies is absent or empty', () => {
  const pkg = readPkg();
  const devDeps = pkg.devDependencies;
  assert.ok(
    devDeps === undefined || Object.keys(devDeps).length === 0,
    'devDependencies should be absent or an empty object'
  );
});

const expectedDirs = [
  'src/routes',
  'src/services',
  'src/queries',
  'src/middlewares',
  'src/db',
  'src/migrations',
  'src/utils',
  'test',
];

for (const dir of expectedDirs) {
  test(`directory exists: backend/${dir}`, () => {
    const fullPath = path.join(backendRoot, dir);
    assert.ok(fs.existsSync(fullPath), `${dir} should exist`);
    assert.ok(fs.statSync(fullPath).isDirectory(), `${dir} should be a directory`);
  });
}

const expectedFiles = ['src/app.js', 'src/server.js'];

for (const file of expectedFiles) {
  test(`file exists: backend/${file}`, () => {
    const fullPath = path.join(backendRoot, file);
    assert.ok(fs.existsSync(fullPath), `${file} should exist`);
    assert.ok(fs.statSync(fullPath).isFile(), `${file} should be a file`);
  });
}

test('backend/.env.example exists', () => {
  const envExamplePath = path.join(backendRoot, '.env.example');
  assert.ok(fs.existsSync(envExamplePath), '.env.example should exist');
});

const expectedEnvKeys = [
  'POSTGRES_CONNECTION_STRING',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'ACCESS_TOKEN_EXPIRES_IN',
  'REFRESH_TOKEN_EXPIRES_IN',
  'PORT',
];

for (const key of expectedEnvKeys) {
  test(`.env.example contains key: ${key}`, () => {
    const envExamplePath = path.join(backendRoot, '.env.example');
    const content = fs.readFileSync(envExamplePath, 'utf8');
    const regex = new RegExp(`^${key}=`, 'm');
    assert.ok(regex.test(content), `.env.example should contain ${key}`);
  });
}

test('git check-ignore backend/.env exits with code 0 (ignored)', () => {
  const result = spawnSync('git', ['check-ignore', 'backend/.env'], { cwd: repoRoot });
  assert.strictEqual(result.status, 0, 'backend/.env should be ignored by git');
});

test('git check-ignore backend/.env.example exits with code 1 (not ignored)', () => {
  const result = spawnSync('git', ['check-ignore', 'backend/.env.example'], { cwd: repoRoot });
  assert.strictEqual(result.status, 1, 'backend/.env.example should not be ignored by git');
});
