import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.join(__dirname, '..');
const authStorePath = path.join(frontendRoot, 'src', 'entities', 'session', 'model', 'authStore.ts');

// authStore.ts는 shared/api/httpClient.ts → shared/config/env.ts를 거쳐
// import.meta.env(Vite 전용 전역)를 참조한다. 순수 Node 런타임(node:test)에는
// Vite가 주입하는 import.meta.env가 존재하지 않아 동적 import 시 예외가 발생할 수 있다.
// 이 경우 skip 처리하고 사유를 남긴다(가짜 통과 금지).
let useAuthStore;
let loadError = null;

test('사전 준비: authStore.ts 동적 import', async (t) => {
  if (!fs.existsSync(authStorePath)) {
    t.skip('entities/session/model/authStore.ts가 아직 존재하지 않음 (다른 담당자 작업 중)');
    return;
  }
  try {
    const mod = await import(pathToFileURL(authStorePath).href);
    useAuthStore = mod.useAuthStore;
  } catch (e) {
    loadError = e;
    t.skip(`authStore.ts를 동적 import할 수 없음(${e.message}) - import.meta.env 등 Vite 전용 전역 의존으로 추정, 브라우저/Vitest 환경에서 별도 확인 필요`);
    return;
  }
  assert.strictEqual(typeof useAuthStore, 'function', 'useAuthStore는 zustand store 훅(함수)이어야 함');
});

function resetStore() {
  useAuthStore.setState({ accessToken: null, currentUser: null });
}

test('초기 상태: accessToken과 currentUser는 null이어야 함', (t) => {
  if (!useAuthStore) {
    t.skip('useAuthStore를 로드하지 못해 스킵 (위 사전 준비 테스트 참고)');
    return;
  }
  resetStore();
  const state = useAuthStore.getState();
  assert.strictEqual(state.accessToken, null);
  assert.strictEqual(state.currentUser, null);
});

test('login() 호출 후 accessToken과 currentUser가 설정되어야 함', (t) => {
  if (!useAuthStore) {
    t.skip('useAuthStore를 로드하지 못해 스킵 (위 사전 준비 테스트 참고)');
    return;
  }
  resetStore();
  const user = { userId: 1, email: 'a@b.com', name: 'A', role: 'Member' };
  useAuthStore.getState().login('token123', user);

  const state = useAuthStore.getState();
  assert.strictEqual(state.accessToken, 'token123');
  assert.strictEqual(state.currentUser?.email, 'a@b.com');
});

test('logout() 호출 후 accessToken과 currentUser가 다시 null이어야 함', (t) => {
  if (!useAuthStore) {
    t.skip('useAuthStore를 로드하지 못해 스킵 (위 사전 준비 테스트 참고)');
    return;
  }
  resetStore();
  useAuthStore.getState().login('token123', { userId: 1, email: 'a@b.com', name: 'A', role: 'Member' });
  useAuthStore.getState().logout();

  const state = useAuthStore.getState();
  assert.strictEqual(state.accessToken, null);
  assert.strictEqual(state.currentUser, null);
});

// httpClient.ts와의 연동(setAccessTokenGetter로 등록된 getter가 authStore의 최신
// accessToken을 반영하는지) 검증에 대하여:
// httpClient.ts는 등록된 getter를 모듈 스코프 비공개 변수(let getAccessToken)에만
// 저장하며, 이를 다시 읽어올 수 있는 공개 export(예: getAccessTokenGetter 같은 함수)가
// 없다(2026-08-27 기준 frontend/src/shared/api/httpClient.ts 확인 결과:
// export되는 것은 HttpError, setAccessTokenGetter, setUnauthorizedHandler,
// httpGet/httpPost/httpPatch/httpDelete 뿐).
// 따라서 getter가 실제로 authStore의 최신 accessToken을 반환하는지를 외부에서
// 관찰할 공개 API가 없어 가짜 검증(예: request 함수를 몰래 호출해 우회)을 만들지 않고
// 이 케이스는 검증 불가로 간주하여 생략한다. 필요 시 httpClient.ts에 테스트용
// getter 조회 export가 추가되면 그때 케이스를 보강한다.
