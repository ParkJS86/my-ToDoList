import { useMutation } from '@tanstack/react-query';
import { login } from '../api/auth.api';
import { useAuthStore } from '../../../entities/session/model/authStore';
import { logger } from '../../../shared/lib/logger';

export function useLogin() {
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      useAuthStore.getState().login(data.accessToken, data.user);
    },
    onError: (error) => logger.error('[auth] login failed', (error as Error).message),
  });
}
