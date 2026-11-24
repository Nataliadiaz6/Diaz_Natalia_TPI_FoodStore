import { useState } from 'react';
import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Paginacion } from '../../../shared/components/Paginacion';
import { dinero } from '../../../shared/format';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { PedidoDetalle } from '../components/PedidoDetalle';
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos';

const LIMIT = 10;

export default function MisPedidosPage() {
  const [pagina, setPagina] = useState(0);
  const [abierto, setAbierto] = useState<number | null>(null);
  const { data, isLoading, isError, error } = usePedidos({ skip: pagina * LIMIT, limit: LIMIT });
  const cancelar = useCancelarPedido();

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Mis pedidos</h1>
      {isLoading && <p>Cargando…</p>}
      {isError && <EstadoError mensaje={handleApiError(error)} />}
      {cancelar.isError && <EstadoError mensaje={handleApiError(cancelar.error)} />}
      {data && data.items.length === 0 && <EstadoVacio mensaje="Todavía no hiciste pedidos." />}
      {data?.items.map((p) => (
        <Card key={p.id}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold">Pedido #{p.id}</span>
            <BadgeEstado estado={p.estado} />
            <span className="text-sm text-gray-500">{new Date(p.created_at + 'Z').toLocaleString('es-AR')}</span>
            <span className="ml-auto font-bold">{dinero(p.total)}</span>
            <Button variant="secondary" onClick={() => setAbierto(abierto === p.id ? null : p.id)}>
              {abierto === p.id ? 'Ocultar' : 'Ver detalle'}
            </Button>
            {p.estado === 'PENDIENTE' && (
              <Button variant="danger" disabled={cancelar.isPending} onClick={() => cancelar.mutate(p.id)}>Cancelar</Button>
            )}
          </div>
          {abierto === p.id && <PedidoDetalle pedido={p} />}
        </Card>
      ))}
      {data && <Paginacion pagina={pagina} paginas={Math.ceil(data.total / LIMIT)} onCambiar={setPagina} />}
    </div>
  );
}
