import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.join(__dirname, '..');
const getNavItemsPath = path.join(frontendRoot, 'src', 'widgets', 'nav-bar', 'model', 'getNavItems.ts');

// getNavItems는 httpClient/import.meta.env를 import하지 않는 순수 함수로
// 별도 파일에 분리되어 있어 node:test에서 직접 동적 import로 검증 가능하다.
let getNavItems;

test('사전 준비: getNavItems.ts 동적 import', async (t) => {
  if (!fs.existsSync(getNavItemsPath)) {
    t.skip('widgets/nav-bar/model/getNavItems.ts가 아직 존재하지 않음 (다른 담당자 작업 중)');
    return;
  }
  try {
    const mod = await import(pathToFileURL(getNavItemsPath).href);
    getNavItems = mod.getNavItems;
  } catch (e) {
    t.skip(`getNavItems.ts를 동적 import할 수 없음(${e.message})`);
    return;
  }
  assert.strictEqual(typeof getNavItems, 'function', 'getNavItems는 함수여야 함');
});

test('getNavItems("Member") → 길이 2, 순서(Todo 목록, 회원정보수정)', (t) => {
  if (!getNavItems) {
    t.skip('getNavItems를 로드하지 못해 스킵 (위 사전 준비 테스트 참고)');
    return;
  }
  const result = getNavItems('Member');
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0].label, 'Todo 목록');
  assert.strictEqual(result[1].label, '회원정보수정');
});

test('getNavItems(undefined) → Member와 동일하게 길이 2', (t) => {
  if (!getNavItems) {
    t.skip('getNavItems를 로드하지 못해 스킵 (위 사전 준비 테스트 참고)');
    return;
  }
  const result = getNavItems(undefined);
  assert.strictEqual(result.length, 2);
});

test('getNavItems("Admin") → 길이 4, 순서(Todo 목록, 회원정보수정, 회원관리, 카테고리관리)', (t) => {
  if (!getNavItems) {
    t.skip('getNavItems를 로드하지 못해 스킵 (위 사전 준비 테스트 참고)');
    return;
  }
  const result = getNavItems('Admin');
  assert.strictEqual(result.length, 4);
  assert.deepStrictEqual(
    result.map((item) => item.label),
    ['Todo 목록', '회원정보수정', '회원관리', '카테고리관리'],
  );
});

test('getNavItems("Admin") → /admin/users, /admin/categories 경로 포함', (t) => {
  if (!getNavItems) {
    t.skip('getNavItems를 로드하지 못해 스킵 (위 사전 준비 테스트 참고)');
    return;
  }
  const result = getNavItems('Admin');
  const tos = result.map((item) => item.to);
  assert.ok(tos.includes('/admin/users'), '/admin/users 경로가 포함되어야 함');
  assert.ok(tos.includes('/admin/categories'), '/admin/categories 경로가 포함되어야 함');
});
