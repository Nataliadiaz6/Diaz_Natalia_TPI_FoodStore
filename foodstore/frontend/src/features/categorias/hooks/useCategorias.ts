import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { actualizarCategoria, crearCategoria, eliminarCategoria, getCategorias } from '../api/categorias';
import type { CategoriaInput } from '../types/categoria';

export const useCategorias = () => useQuery({ queryKey: ['categorias'], queryFn: getCategorias });

export function useCrearCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoriaInput) => crearCategoria(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  });
}

export function useActualizarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaInput }) => actualizarCategoria(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  });
}

export function useEliminarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarCategoria(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  });
}
