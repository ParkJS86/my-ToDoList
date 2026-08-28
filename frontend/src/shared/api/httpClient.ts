import { API_BASE_URL } from '../config/env';
import { logger } from '../lib/logger';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let getAccessToken: () => string | null = () => null;
export function setAccessTokenGetter(fn: () => string | null): void {
  getAccessToken = fn;
}

let onUnauthorized: () => void = () => {};
export function setUnauthorizedHandler(fn: () => void): void {
  onUnauthorized = fn;
}

let refreshHandler: (() => Promise<string>) | null = null;
export function setRefreshHandler(fn: () => Promise<string>): void {
  refreshHandler = fn;
}

let refreshPromise: Promise<string> | null = null;
function refreshOnce(): Promise<string> {
  if (!refreshHandler) return Promise.reject(new Error('no refresh handler'));
  if (!refreshPromise) {
    refreshPromise = refreshHandler().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function request<T>(method: string, path: string, body?: unknown, isRetry = false): Promise<T> {
  const token = getAccessToken();
  logger.info(`[http] ${method} ${path}`);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    if (!isRetry && path !== '/auth/refresh') {
      try {
        await refreshOnce();
        return request<T>(method, path, body, true);
      } catch {
        // refresh 실패 → 아래 기존 401 처리(onUnauthorized + throw)로 진행
      }
    }
    logger.error(`[http] ${method} ${path} -> 401`);
    onUnauthorized();
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = data?.error?.message ?? res.statusText;
    logger.error(`[http] ${method} ${path} -> ${res.status} ${message}`);
    throw new HttpError(res.status, message);
  }

  logger.info(`[http] ${method} ${path} -> ${res.status}`);
  return res.status === 204 ? (undefined as T) : res.json();
}

export const httpGet = <T>(path: string) => request<T>('GET', path);
export const httpPost = <T>(path: string, body?: unknown) => request<T>('POST', path, body);
export const httpPatch = <T>(path: string, body?: unknown) => request<T>('PATCH', path, body);
export const httpDelete = <T>(path: string) => request<T>('DELETE', path);
