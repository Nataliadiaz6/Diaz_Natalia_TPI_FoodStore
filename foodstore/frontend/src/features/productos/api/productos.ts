import { api } from '../../../shared/api/axiosInstance';
import type { FiltrosProductos, Producto, ProductoInput, ProductosPaginados } from '../types/producto';

export const getProductos = async (filtros: FiltrosProductos): Promise<ProductosPaginados> =>
  (await api.get<ProductosPaginados>('/productos', { params: filtros })).data;
export const crearProducto = async (data: ProductoInput): Promise<Producto> => (await api.post<Producto>('/productos', data)).data;
export const actualizarProducto = async (id: number, data: ProductoInput): Promise<Producto> =>
  (await api.put<Producto>(`/productos/${id}`, data)).data;
export const actualizarStock = async (id: number, stock: number, disponible: boolean): Promise<Producto> =>
  (await api.patch<Producto>(`/productos/${id}/stock`, { stock, disponible })).data;
export const eliminarProducto = async (id: number): Promise<void> => {
  await api.delete(`/productos/${id}`);
};
