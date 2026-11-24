import { api } from '../../../shared/api/axiosInstance';
import type { Categoria, CategoriaInput } from '../types/categoria';

export const getCategorias = async (): Promise<Categoria[]> => (await api.get<Categoria[]>('/categorias')).data;
export const crearCategoria = async (data: CategoriaInput): Promise<Categoria> => (await api.post<Categoria>('/categorias', data)).data;
export const actualizarCategoria = async (id: number, data: CategoriaInput): Promise<Categoria> =>
  (await api.put<Categoria>(`/categorias/${id}`, data)).data;
export const eliminarCategoria = async (id: number): Promise<void> => {
  await api.delete(`/categorias/${id}`);
};
