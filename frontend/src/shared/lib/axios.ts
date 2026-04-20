import axios from 'axios';
import { getStoredAccessToken } from '@/shared/lib/storage';

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
