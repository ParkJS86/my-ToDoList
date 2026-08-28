import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCategory } from '../api/category.api';
import type { UpdateCategoryRequest } from '../types';
import { logger } from '../../../shared/lib/logger';

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, payload }: { categoryId: number; payload: UpdateCategoryRequest }) =>
      updateCategory(categoryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => logger.error('[category] update failed', (error as Error).message),
  });
}
