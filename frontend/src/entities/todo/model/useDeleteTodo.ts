import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTodo } from '../api/todo.api';
import { logger } from '../../../shared/lib/logger';

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (todoId: number) => deleteTodo(todoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error) => logger.error('[todo] delete failed', (error as Error).message),
  });
}
