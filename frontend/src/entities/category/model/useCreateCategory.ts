import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory } from '../api/category.api';
import { logger } from '../../../shared/lib/logger';

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => logger.error('[category] create failed', (error as Error).message),
  });
}
