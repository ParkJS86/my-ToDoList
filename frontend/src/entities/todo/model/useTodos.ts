import { useQuery } from '@tanstack/react-query';
import { fetchTodos } from '../api/todo.api';
import type { TodoFilter } from '../types';

export function useTodos(filter: TodoFilter = {}) {
  return useQuery({ queryKey: ['todos', filter], queryFn: () => fetchTodos(filter) });
}
