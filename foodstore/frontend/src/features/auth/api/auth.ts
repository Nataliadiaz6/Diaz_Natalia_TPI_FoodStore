import { api } from '../../../shared/api/axiosInstance';
import type { Usuario } from '../types/usuario';

export const loginApi = async (username: string, password: string): Promise<void> => {
  await api.post('/auth/token', new URLSearchParams({ username, password }));
};

export const registerApi = async (data: { username: string; full_name: string; email: string; password: string }): Promise<Usuario> =>
  (await api.post<Usuario>('/auth/register', data)).data;

export const logoutApi = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const meApi = async (): Promise<Usuario> => (await api.get<Usuario>('/auth/me')).data;
