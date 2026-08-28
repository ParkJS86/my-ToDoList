import { setRefreshHandler, setUnauthorizedHandler } from '../../../shared/api/httpClient';
import { refreshAccessToken } from '../api/auth.api';
import { useAuthStore } from '../../../entities/session/model/authStore';

export function bootstrapAuthInterceptor(): void {
  setRefreshHandler(async () => {
    const { accessToken } = await refreshAccessToken();
    useAuthStore.getState().setAccessToken(accessToken);
    return accessToken;
  });
  setUnauthorizedHandler(() => {
    useAuthStore.getState().logout();
  });
}

// 새로고침 시 인메모리 상태가 초기화되므로, 앱 기동 직후 httpOnly Refresh Token 쿠키로
// 세션을 복원한다. 쿠키가 없거나 만료됐으면 로그아웃 상태로 남는다(재로그인 필요, 정상 흐름).
export async function bootstrapSession(): Promise<void> {
  try {
    const { accessToken, user } = await refreshAccessToken();
    useAuthStore.getState().login(accessToken, user);
  } catch {
    useAuthStore.getState().finishBootstrap();
  }
}
