import { api } from '../../../shared/api/axiosInstance';
import type { EstadoPedido, Pedido, PedidoCreate, PedidosPaginados, ResumenPedidos } from '../types/pedido';

export interface FiltrosPedidos {
  skip: number;
  limit: number;
  estado?: EstadoPedido;
}

export const getPedidos = async (filtros: FiltrosPedidos): Promise<PedidosPaginados> =>
  (await api.get<PedidosPaginados>('/pedidos', { params: filtros })).data;
export const crearPedido = async (data: PedidoCreate): Promise<Pedido> => (await api.post<Pedido>('/pedidos', data)).data;
export const cambiarEstado = async (id: number, estado: EstadoPedido): Promise<Pedido> =>
  (await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado })).data;
export const cancelarPedido = async (id: number): Promise<Pedido> => (await api.patch<Pedido>(`/pedidos/${id}/cancelar`)).data;
export const getResumen = async (): Promise<ResumenPedidos> => (await api.get<ResumenPedidos>('/pedidos/resumen')).data;
