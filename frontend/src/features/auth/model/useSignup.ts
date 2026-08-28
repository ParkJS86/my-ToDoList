import { useMutation } from '@tanstack/react-query';
import { signup } from '../api/auth.api';
import { logger } from '../../../shared/lib/logger';

export function useSignup() {
  return useMutation({
    mutationFn: signup,
    onError: (error) => logger.error('[auth] signup failed', (error as Error).message),
  });
}
