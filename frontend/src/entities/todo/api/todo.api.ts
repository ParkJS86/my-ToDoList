import { httpGet, httpPost, httpPatch, httpDelete } from '../../../shared/api/httpClient';
import type { CreateTodoRequest, Todo, TodoFilter, UpdateTodoRequest } from '../types';
import { buildTodoQuery } from './buildTodoQuery';

export { buildTodoQuery };

export function fetchTodos(filter: TodoFilter = {}): Promise<Todo[]> {
  const qs = buildTodoQuery(filter);
  return httpGet<Todo[]>(`/todos${qs ? `?${qs}` : ''}`);
}

export function createTodo(payload: CreateTodoRequest): Promise<Todo> {
  return httpPost<Todo>('/todos', payload);
}

export function updateTodo(todoId: number, payload: UpdateTodoRequest): Promise<Todo> {
  return httpPatch<Todo>(`/todos/${todoId}`, payload);
}

export function deleteTodo(todoId: number): Promise<{ message: string }> {
  return httpDelete<{ message: string }>(`/todos/${todoId}`);
}
