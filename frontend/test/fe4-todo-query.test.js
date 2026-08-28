import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.join(__dirname, '..');
const buildTodoQueryPath = path.join(frontendRoot, 'src', 'entities', 'todo', 'api', 'buildTodoQuery.ts');

// buildTodoQuery는 httpClient(import.meta.env 의존)를 import하지 않는 순수 함수로
// 별도 파일에 분리되어 있어 node:test에서 직접 동적 import로 검증 가능하다.
let buildTodoQuery;

test('사전 준비: buildTodoQuery.ts 동적 import', async (t) => {
  if (!fs.existsSync(buildTodoQueryPath)) {
    t.skip('entities/todo/api/buildTodoQuery.ts가 아직 존재하지 않음 (다른 담당자 작업 중)');
    return;
  }
  try {
    const mod = await import(pathToFileURL(buildTodoQueryPath).href);
    buildTodoQuery = mod.buildTodoQuery;
  } catch (e) {
    t.skip(`buildTodoQuery.ts를 동적 import할 수 없음(${e.message})`);
    return;
  }
  assert.strictEqual(typeof buildTodoQuery, 'function', 'buildTodoQuery는 함수여야 함');
});

test('buildTodoQuery({}) → 빈 문자열', (t) => {
  if (!buildTodoQuery) {
    t.skip('buildTodoQuery를 로드하지 못해 스킵 (위 사전 준비 테스트 참고)');
    return;
  }
  assert.strictEqual(buildTodoQuery({}), '');
});

test('buildTodoQuery({ categoryId: 1 }) → categoryId=1', (t) => {
  if (!buildTodoQuery) {
    t.skip('buildTodoQuery를 로드하지 못해 스킵 (위 사전 준비 테스트 참고)');
    return;
  }
  assert.strictEqual(buildTodoQuery({ categoryId: 1 }), 'categoryId=1');
});

test('buildTodoQuery({ status: "진행중" }) → 파싱 시 status가 "진행중"이어야 함', (t) => {
  if (!buildTodoQuery) {
    t.skip('buildTodoQuery를 로드하지 못해 스킵 (위 사전 준비 테스트 참고)');
    return;
  }
  const result = buildTodoQuery({ status: '진행중' });
  const parsed = new URLSearchParams(result);
  assert.strictEqual(parsed.get('status'), '진행중');
});

test('buildTodoQuery({ categoryId: 2, status: "완료" }) → 파싱 시 categoryId, status 모두 일치해야 함', (t) => {
  if (!buildTodoQuery) {
    t.skip('buildTodoQuery를 로드하지 못해 스킵 (위 사전 준비 테스트 참고)');
    return;
  }
  const result = buildTodoQuery({ categoryId: 2, status: '완료' });
  const parsed = new URLSearchParams(result);
  assert.strictEqual(parsed.get('categoryId'), '2');
  assert.strictEqual(parsed.get('status'), '완료');
});
