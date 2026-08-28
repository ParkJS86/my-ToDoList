import { create } from 'zustand';
import { setAccessTokenGetter } from '../../../shared/api/httpClient';
import { logger } from '../../../shared/lib/logger';

export interface User {
  userId: number;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  currentUser: User | null;
  isBootstrapping: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  updateCurrentUserInfo: (patch: { name: string }) => void;
  finishBootstrap: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  currentUser: null,
  isBootstrapping: true,
  login: (accessToken, user) => {
    logger.info('[auth] login', user.email);
    set({ accessToken, currentUser: user, isBootstrapping: false });
  },
  logout: () => {
    logger.info('[auth] logout');
    set({ accessToken: null, currentUser: null, isBootstrapping: false });
  },
  setAccessToken: (token) => set({ accessToken: token }),
  updateCurrentUserInfo: (patch) =>
    set((state) => (state.currentUser ? { currentUser: { ...state.currentUser, ...patch } } : state)),
  finishBootstrap: () => set({ isBootstrapping: false }),
}));

// httpClient가 요청마다 최신 accessToken을 가져갈 수 있도록 연결(FE-2에서 예고된 지점)
setAccessTokenGetter(() => useAuthStore.getState().accessToken);

// FE-5: setUnauthorizedHandler/setRefreshHandler 연결은 features/auth에서 수행(하위→상위 참조 금지)
