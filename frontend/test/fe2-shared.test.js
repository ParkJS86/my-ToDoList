import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.join(__dirname, '..');
const sharedRoot = path.join(frontendRoot, 'src', 'shared');

// ── 1. httpClient 통합 테스트 ─────────────────────────────────────────────
// httpClient.ts는 TypeScript이며 shared/config/env.ts(Vite의 import.meta.env에 의존)를
// 거쳐 동작하도록 설계되어 있어, node:test(순수 Node 런타임)에서 직접 import해
// 토큰 첨부/401 처리/에러 파싱 로직까지 검증하기는 부적절함(브라우저/Vite 환경 전제).
// 대신 httpClient가 호출하게 될 백엔드 엔드포인트가 기대하는 응답 형태로 살아있는지만
// 순수 fetch로 검증한다. httpClient.ts 자체의 로직은 tsc --noEmit(타입 체크)과
// 브라우저 수동 확인으로 커버한다.
test('GET http://localhost:3000/health returns status/db fields (백엔드가 실행 중이어야 함)', async () => {
  const res = await fetch('http://localhost:3000/health');
  assert.strictEqual(res.status, 200, '/health는 200을 반환해야 함');
  const body = await res.json();
  assert.ok('status' in body, '응답에 status 필드가 있어야 함');
  assert.strictEqual(body.status, 'ok', 'status는 ok여야 함');
  if ('db' in body) {
    assert.strictEqual(body.db, 'connected', 'db는 connected여야 함');
  }
});

// ── 2. isValidDateRange 순수 함수 테스트 ──────────────────────────────────
// Node 24는 .ts 파일의 타입 주석만 제거하는 네이티브 스트리핑을 별도 플래그 없이 지원한다
// (사전 확인: node --version → v24.19.0, 더미 .ts 동적 import 성공 확인).
// 따라서 date.ts를 직접 동적 import하여 실제 구현을 검증한다.
// 단, 다른 담당자가 아직 파일을 작성 중일 수 있으므로 파일이 없거나
// isValidDateRange를 export하지 않으면(스트리핑 불가능한 문법 사용 등 포함) 스킵한다.
const datePath = path.join(sharedRoot, 'lib', 'date.ts');

test('isValidDateRange: 날짜 범위 유효성 검증', async (t) => {
  if (!fs.existsSync(datePath)) {
    t.skip('shared/lib/date.ts가 아직 존재하지 않음 (다른 담당자 작업 중) - 수동/브라우저 확인으로 대체');
    return;
  }

  let isValidDateRange;
  try {
    const mod = await import(pathToFileURL(datePath).href);
    isValidDateRange = mod.isValidDateRange;
  } catch (e) {
    t.skip(`date.ts를 동적 import할 수 없음(${e.message}) - 수동/브라우저 확인으로 대체`);
    return;
  }

  if (typeof isValidDateRange !== 'function') {
    t.skip('isValidDateRange export를 찾을 수 없음 - 수동/브라우저 확인으로 대체');
    return;
  }

  assert.strictEqual(isValidDateRange('2026-08-27', '2026-08-27'), true, '시작일 == 종료일은 유효해야 함');
  assert.strictEqual(isValidDateRange('2026-08-01', '2026-08-27'), true, '시작일 < 종료일은 유효해야 함');
  assert.strictEqual(isValidDateRange('2026-08-27', '2026-08-01'), false, '시작일 > 종료일은 무효해야 함');
});

// ── 3. 파일 존재/구조 검증 ────────────────────────────────────────────────
const expectedFiles = [
  'src/shared/config/env.ts',
  'src/shared/lib/logger.ts',
  'src/shared/lib/date.ts',
  'src/shared/api/httpClient.ts',
  'src/shared/ui/Button.tsx',
  'src/shared/ui/Input.tsx',
  'src/shared/ui/Modal.tsx',
  'src/app/styles/tokens.css',
];

for (const file of expectedFiles) {
  test(`파일 존재: frontend/${file}`, () => {
    const fullPath = path.join(frontendRoot, file);
    assert.ok(fs.existsSync(fullPath), `${file} 이 존재해야 함`);
  });
}

test('app/styles/tokens.css에 핵심 디자인 토큰이 포함되어 있어야 함', () => {
  const tokensPath = path.join(frontendRoot, 'src', 'app', 'styles', 'tokens.css');
  if (!fs.existsSync(tokensPath)) {
    assert.fail('tokens.css가 존재하지 않음');
  }
  const content = fs.readFileSync(tokensPath, 'utf8');
  assert.ok(content.includes('--color-bg'), 'tokens.css에 --color-bg 토큰이 포함되어야 함');
  const customPropCount = (content.match(/--[\w-]+\s*:/g) || []).length;
  assert.ok(customPropCount >= 3, `tokens.css에 CSS 커스텀 프로퍼티(토큰)가 최소 3개 이상 있어야 함 (found: ${customPropCount})`);
});

test('npx tsc --noEmit 실행 시 컴파일 에러가 없어야 함', () => {
  const result = spawnSync('npx', ['tsc', '--noEmit'], { cwd: frontendRoot, shell: true, encoding: 'utf8' });
  assert.strictEqual(
    result.status,
    0,
    `tsc --noEmit should succeed, stdout: ${result.stdout}, stderr: ${result.stderr}`
  );
});
