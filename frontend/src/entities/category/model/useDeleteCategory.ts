import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCategory } from '../api/category.api';
import { logger } from '../../../shared/lib/logger';

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: number) => deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error) => logger.error('[category] delete failed', (error as Error).message),
  });
}
