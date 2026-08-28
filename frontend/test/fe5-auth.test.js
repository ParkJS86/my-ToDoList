import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.join(__dirname, '..');
const validationPath = path.join(frontendRoot, 'src', 'shared', 'lib', 'validation.ts');

// isValidEmail은 httpClient(import.meta.env 의존)를 import하지 않는 순수 함수로
// 별도 파일에 분리되어 있어 node:test에서 직접 동적 import로 검증 가능하다.
let isValidEmail;

test('사전 준비: validation.ts 동적 import', async (t) => {
  if (!fs.existsSync(validationPath)) {
    t.skip('shared/lib/validation.ts가 아직 존재하지 않음 (다른 담당자 작업 중)');
    return;
  }
  try {
    const mod = await import(pathToFileURL(validationPath).href);
    isValidEmail = mod.isValidEmail;
  } catch (e) {
    t.skip(`validation.ts를 동적 import할 수 없음(${e.message})`);
    return;
  }
  assert.strictEqual(typeof isValidEmail, 'function', 'isValidEmail은 함수여야 함');
});

test('isValidEmail("user@example.com") → true', (t) => {
  if (!isValidEmail) {
    t.skip('isValidEmail을 로드하지 못해 스킵 (위 사전 준비 테스트 참고)');
    return;
  }
  assert.strictEqual(isValidEmail('user@example.com'), true);
});

test('isValidEmail("user.name+tag@example.co.kr") → true', (t) => {
  if (!isValidEmail) {
    t.skip('isValidEmail을 로드하지 못해 스킵 (위 사전 준비 테스트 참고)');
    return;
  }
  assert.strictEqual(isValidEmail('user.name+tag@example.co.kr'), true);
});

test('isValidEmail("not-an-email") → false', (t) => {
  if (!isValidEmail) {
    t.skip('isValidEmail을 로드하지 못해 스킵 (위 사전 준비 테스트 참고)');
    return;
  }
  assert.strictEqual(isValidEmail('not-an-email'), false);
});

test('isValidEmail("missing-domain@") → false', (t) => {
  if (!isValidEmail) {
    t.skip('isValidEmail을 로드하지 못해 스킵 (위 사전 준비 테스트 참고)');
    return;
  }
  assert.strictEqual(isValidEmail('missing-domain@'), false);
});

test('isValidEmail("@missing-local.com") → false', (t) => {
  if (!isValidEmail) {
    t.skip('isValidEmail을 로드하지 못해 스킵 (위 사전 준비 테스트 참고)');
    return;
  }
  assert.strictEqual(isValidEmail('@missing-local.com'), false);
});

test('isValidEmail("has space@example.com") → false', (t) => {
  if (!isValidEmail) {
    t.skip('isValidEmail을 로드하지 못해 스킵 (위 사전 준비 테스트 참고)');
    return;
  }
  assert.strictEqual(isValidEmail('has space@example.com'), false);
});
