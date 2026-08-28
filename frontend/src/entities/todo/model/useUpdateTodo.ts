import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTodo } from '../api/todo.api';
import type { UpdateTodoRequest } from '../types';
import { logger } from '../../../shared/lib/logger';

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ todoId, payload }: { todoId: number; payload: UpdateTodoRequest }) => updateTodo(todoId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error) => logger.error('[todo] update failed', (error as Error).message),
  });
}
