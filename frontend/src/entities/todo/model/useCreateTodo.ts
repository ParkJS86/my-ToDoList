import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTodo } from '../api/todo.api';
import { logger } from '../../../shared/lib/logger';

export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error) => logger.error('[todo] create failed', (error as Error).message),
  });
}
