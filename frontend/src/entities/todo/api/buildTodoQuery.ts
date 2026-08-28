import type { TodoFilter } from '../types';

// httpClient(import.meta.env 의존)를 import하지 않는 순수 함수로 분리 — node:test에서 직접 검증 가능
export function buildTodoQuery(filter: TodoFilter): string {
  const params = new URLSearchParams();
  if (filter.categoryId !== undefined) params.set('categoryId', String(filter.categoryId));
  if (filter.status !== undefined) params.set('status', filter.status);
  return params.toString();
}
