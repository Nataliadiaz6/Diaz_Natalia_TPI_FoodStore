import { dinero } from '../../../shared/format';
import type { Pedido } from '../types/pedido';

export function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="mt-3 border-t border-gray-100 pt-3 text-sm">
      <p>Dirección: {pedido.direccion_entrega} · Pago: {pedido.forma_pago}</p>
      {pedido.notas && <p>Notas: {pedido.notas}</p>}
      <ul className="mt-2 space-y-1">
        {pedido.items.map((i) => (
          <li key={i.producto_id} className="flex justify-between">
            <span>{i.cantidad} × {i.nombre_producto} ({dinero(i.precio_unitario)})</span>
            <span>{dinero(i.subtotal)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
