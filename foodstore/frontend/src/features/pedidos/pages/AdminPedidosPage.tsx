import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { handleApiError } from '../../../shared/api/handleApiError';
import { DataTable } from '../../../shared/components/DataTable';
import { EstadoError } from '../../../shared/components/EstadoError';
import { dinero } from '../../../shared/format';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { Button } from '../../../shared/ui/Button';
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos';
import type { EstadoPedido, Pedido } from '../types/pedido';

const ESTADOS: EstadoPedido[] = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO'];
const SIGUIENTE: Partial<Record<EstadoPedido, EstadoPedido>> = { PENDIENTE: 'EN_PREPARACION', EN_PREPARACION: 'ENTREGADO' };

export default function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | ''>('');
  const { data, isLoading, isError, error } = usePedidos({ skip: 0, limit: 100, estado: estado || undefined });
  const cambiar = useCambiarEstadoPedido();

  const columnas = useMemo<ColumnDef<Pedido>[]>(
    () => [
      { accessorKey: 'id', header: '#' },
      { accessorKey: 'usuario_id', header: 'Usuario' },
      { id: 'estado', header: 'Estado', cell: ({ row }) => <BadgeEstado estado={row.original.estado} /> },
      { accessorKey: 'forma_pago', header: 'Pago' },
      { accessorKey: 'direccion_entrega', header: 'Dirección' },
      { id: 'total', header: 'Total', cell: ({ row }) => dinero(row.original.total) },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const p = row.original;
          const sig = SIGUIENTE[p.estado];
          if (p.estado === 'ENTREGADO' || p.estado === 'CANCELADO') return null;
          return (
            <div className="flex gap-2">
              {sig && <Button onClick={() => cambiar.mutate({ id: p.id, estado: sig })}>Pasar a {sig.replace('_', ' ')}</Button>}
              <Button variant="danger" onClick={() => cambiar.mutate({ id: p.id, estado: 'CANCELADO' })}>Cancelar</Button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Pedidos</h1>
        <select className="rounded border border-gray-300 px-3 py-1.5" value={estado} onChange={(e) => setEstado(e.target.value as EstadoPedido | '')}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>
      {cambiar.isError && <EstadoError mensaje={handleApiError(cambiar.error)} />}
      {isError && <EstadoError mensaje={handleApiError(error)} />}
      {isLoading ? <p>Cargando…</p> : <DataTable data={data?.items ?? []} columns={columnas} />}
    </div>
  );
}
