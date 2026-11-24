import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginApi, logoutApi, meApi } from '../features/auth/api/auth';
import type { Usuario } from '../features/auth/types/usuario';
import { setUnauthorizedHandler } from '../shared/api/axiosInstance';

type UsuarioSesion = Pick<Usuario, 'id' | 'username' | 'full_name' | 'email' | 'role'>;

interface AuthState {
  usuario: UsuarioSesion | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const aSesion = (u: Usuario): UsuarioSesion => ({ id: u.id, username: u.username, full_name: u.full_name, email: u.email, role: u.role });

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,
      login: async (username, password) => {
        await loginApi(username, password);
        set({ usuario: aSesion(await meApi()) });
      },
      logout: async () => {
        try {
          await logoutApi();
        } finally {
          set({ usuario: null });
        }
      },
      checkSession: async () => {
        set({ cargando: true });
        try {
          set({ usuario: aSesion(await meApi()) });
        } catch {
          set({ usuario: null });
        } finally {
          set({ cargando: false });
        }
      },
    }),
    { name: 'auth-store', partialize: (state) => ({ usuario: state.usuario }) },
  ),
);

setUnauthorizedHandler(() => useAuthStore.setState({ usuario: null }));
