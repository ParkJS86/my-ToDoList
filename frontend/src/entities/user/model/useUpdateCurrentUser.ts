import { useMutation } from '@tanstack/react-query';
import { updateCurrentUser } from '../api/user.api';
import { logger } from '../../../shared/lib/logger';

export function useUpdateCurrentUser() {
  return useMutation({
    mutationFn: updateCurrentUser,
    onError: (error) => logger.error('[user] update failed', (error as Error).message),
  });
}
