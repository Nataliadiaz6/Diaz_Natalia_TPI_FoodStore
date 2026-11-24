import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cambiarEstado, cancelarPedido, crearPedido, getPedidos, getResumen } from '../api/pedidos';
import type { FiltrosPedidos } from '../api/pedidos';
import type { EstadoPedido, PedidoCreate } from '../types/pedido';

export const usePedidos = (filtros: FiltrosPedidos) => useQuery({ queryKey: ['pedidos', filtros], queryFn: () => getPedidos(filtros) });
export const useResumenPedidos = () => useQuery({ queryKey: ['pedidos-resumen'], queryFn: getResumen });

const useInvalidar = () => {
  const qc = useQueryClient();
  return async () => {
    await qc.invalidateQueries({ queryKey: ['pedidos'] });
    await qc.invalidateQueries({ queryKey: ['pedidos-resumen'] });
    await qc.invalidateQueries({ queryKey: ['productos'] }); // el stock cambia al crear o cancelar
  };
};

export function useCrearPedido() {
  const invalidar = useInvalidar();
  return useMutation({ mutationFn: (data: PedidoCreate) => crearPedido(data), onSuccess: invalidar });
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstado(id, estado),
    onSuccess: invalidar,
  });
}

export function useCancelarPedido() {
  const invalidar = useInvalidar();
  return useMutation({ mutationFn: (id: number) => cancelarPedido(id), onSuccess: invalidar });
}
