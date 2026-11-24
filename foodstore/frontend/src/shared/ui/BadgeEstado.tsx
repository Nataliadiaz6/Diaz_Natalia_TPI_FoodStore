import type { EstadoPedido } from '../../features/pedidos/types/pedido';

const colores: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  EN_PREPARACION: 'bg-blue-100 text-blue-800',
  ENTREGADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-red-100 text-red-800',
};

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${colores[estado]}`}>{estado.replace('_', ' ')}</span>;
}
