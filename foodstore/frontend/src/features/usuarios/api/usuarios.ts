import { api } from '../../../shared/api/axiosInstance';
import type { Usuario } from '../../auth/types/usuario';

export const getUsuarios = async (): Promise<Usuario[]> => (await api.get<Usuario[]>('/admin/usuarios')).data;
export const cambiarActivo = async (id: number, activar: boolean): Promise<Usuario> =>
  (await api.post<Usuario>(`/admin/usuarios/${id}/${activar ? 'activar' : 'desactivar'}`)).data;
