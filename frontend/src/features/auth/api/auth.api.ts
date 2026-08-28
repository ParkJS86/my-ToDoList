import { httpPost } from '../../../shared/api/httpClient';
import type { User } from '../../../entities/session/model/authStore';

export interface SignupPayload {
  email: string;
  password: string;
  name: string;
}
export interface LoginPayload {
  email: string;
  password: string;
}
export interface LoginResult {
  accessToken: string;
  user: User;
}

export function signup(payload: SignupPayload): Promise<User> {
  return httpPost<User>('/auth/signup', payload);
}

export function login(payload: LoginPayload): Promise<LoginResult> {
  return httpPost<LoginResult>('/auth/login', payload);
}

export function refreshAccessToken(): Promise<{ accessToken: string; user: User }> {
  return httpPost<{ accessToken: string; user: User }>('/auth/refresh');
}

export function logout(): Promise<{ message: string }> {
  return httpPost<{ message: string }>('/auth/logout');
}
