import { httpGet, httpPatch } from '../../../shared/api/httpClient';
import type { User, UpdateUserRequest } from '../types';

export function fetchAllUsers(): Promise<User[]> {
  return httpGet<User[]>('/users');
}

export function updateCurrentUser(payload: UpdateUserRequest): Promise<User> {
  return httpPatch<User>('/users/me', payload);
}
