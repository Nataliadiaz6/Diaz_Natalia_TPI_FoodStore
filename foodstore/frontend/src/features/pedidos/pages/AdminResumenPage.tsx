import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { dinero } from '../../../shared/format';
import { Card } from '../../../shared/ui/Card';
import { useResumenPedidos } from '../hooks/usePedidos';

export default function AdminResumenPage() {
  const { data, isLoading, isError, error } = useResumenPedidos();
  if (isLoading) return <p>Cargando…</p>;
  if (isError || !data) return <EstadoError mensaje={handleApiError(error)} />;

  const tarjetas: [string, string][] = [
    ['Pendientes', String(data.pendientes)],
    ['En preparación', String(data.en_preparacion)],
    ['Entregados', String(data.entregados)],
    ['Cancelados', String(data.cancelados)],
    ['Pedidos de hoy', String(data.pedidos_hoy)],
    ['Ingresos (entregados)', dinero(data.ingresos_entregados)],
  ];

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Resumen</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {tarjetas.map(([titulo, valor]) => (
          <Card key={titulo}>
            <p className="text-sm text-gray-500">{titulo}</p>
            <p className="text-2xl font-bold">{valor}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
