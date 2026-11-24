import axios from 'axios';

let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: () => void): void => {
  onUnauthorized = fn;
};

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true });

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<{ detail?: unknown }>(error)) {
      const status = error.response?.status;
      const url = error.config?.url ?? '';
      const detail = error.response?.data?.detail;
      const esAuth = url.endsWith('/auth/token') || url.endsWith('/auth/me');
      if ((status === 401 && !esAuth) || (status === 400 && detail === 'Cuenta de usuario desactivada')) {
        onUnauthorized?.();
      }
    }
    return Promise.reject(error);
  },
);
