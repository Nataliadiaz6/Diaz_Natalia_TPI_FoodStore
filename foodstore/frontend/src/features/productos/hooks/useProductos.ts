import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { actualizarProducto, actualizarStock, crearProducto, eliminarProducto, getProductos } from '../api/productos';
import type { FiltrosProductos, ProductoInput } from '../types/producto';

export const useProductos = (filtros: FiltrosProductos) =>
  useQuery({ queryKey: ['productos', filtros], queryFn: () => getProductos(filtros) });

const useInvalidar = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['productos'] });
};

export function useCrearProducto() {
  const invalidar = useInvalidar();
  return useMutation({ mutationFn: (data: ProductoInput) => crearProducto(data), onSuccess: invalidar });
}

export function useActualizarProducto() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoInput }) => actualizarProducto(id, data),
    onSuccess: invalidar,
  });
}

export function useActualizarStock() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, stock, disponible }: { id: number; stock: number; disponible: boolean }) => actualizarStock(id, stock, disponible),
    onSuccess: invalidar,
  });
}

export function useEliminarProducto() {
  const invalidar = useInvalidar();
  return useMutation({ mutationFn: (id: number) => eliminarProducto(id), onSuccess: invalidar });
}
