import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUser,
  setAuthSession,
} from '@/shared/lib/storage';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
  }
}

type RetriableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function flushQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  pendingQueue = [];
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const response = await axios.post(
    `${apiClient.defaults.baseURL}/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  );
  const payload = response.data;
  const body = payload && typeof payload === 'object' && 'data' in payload
    ? (payload as { data: unknown }).data
    : payload;

  if (
    !body ||
    typeof body !== 'object' ||
    !('accessToken' in body) ||
    typeof (body as { accessToken: unknown }).accessToken !== 'string'
  ) {
    throw new Error('REFRESH_INVALID_RESPONSE');
  }

  const accessToken = (body as { accessToken: string }).accessToken;
  const newRefreshToken =
    'refreshToken' in body && typeof (body as { refreshToken: unknown }).refreshToken === 'string'
      ? (body as { refreshToken: string }).refreshToken
      : refreshToken;

  setAuthSession({
    accessToken,
    refreshToken: newRefreshToken,
    user: getStoredUser(),
  });

  return accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.skipAuthRefresh ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/logout')
    ) {
      return Promise.reject(error);
    }

    const refreshToken = getStoredRefreshToken();

    if (!refreshToken) {
      clearAuthSession();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            originalRequest._retry = true;
            resolve(apiClient(originalRequest as AxiosRequestConfig));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await refreshAccessToken(refreshToken);
      flushQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest as AxiosRequestConfig);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      clearAuthSession();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
