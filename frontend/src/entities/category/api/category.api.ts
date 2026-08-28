import { httpGet, httpPost, httpPatch, httpDelete } from '../../../shared/api/httpClient';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types';

export function fetchCategories(): Promise<Category[]> {
  return httpGet<Category[]>('/categories');
}

export function createCategory(payload: CreateCategoryRequest): Promise<Category> {
  return httpPost<Category>('/categories', payload);
}

export function updateCategory(categoryId: number, payload: UpdateCategoryRequest): Promise<Category> {
  return httpPatch<Category>(`/categories/${categoryId}`, payload);
}

export function deleteCategory(categoryId: number): Promise<{ message: string }> {
  return httpDelete<{ message: string }>(`/categories/${categoryId}`);
}
