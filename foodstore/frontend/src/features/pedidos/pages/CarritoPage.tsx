import { Link } from 'react-router-dom';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { dinero } from '../../../shared/format';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { useCartStore } from '../../../store/cartStore';

export default function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const quitar = useCartStore((s) => s.quitar);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const vaciar = useCartStore((s) => s.vaciar);
  const total = useCartStore((s) => s.total());

  if (items.length === 0) return <EstadoVacio mensaje="Tu carrito está vacío." />;

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Carrito</h1>
      {items.map((i) => (
        <Card key={i.producto_id} className="flex flex-wrap items-center gap-3">
          <span className="flex-1 font-medium">{i.nombre}</span>
          <span>{dinero(i.precio_unitario)}</span>
          <input
            type="number"
            min={1}
            className="w-20 rounded border border-gray-300 px-2 py-1"
            value={i.cantidad}
            onChange={(e) => cambiarCantidad(i.producto_id, Number(e.target.value))}
          />
          <span className="w-28 text-right font-semibold">{dinero(i.precio_unitario * i.cantidad)}</span>
          <Button variant="danger" onClick={() => quitar(i.producto_id)}>Quitar</Button>
        </Card>
      ))}
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">Total: {dinero(total)}</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={vaciar}>Vaciar</Button>
          <Link to="/checkout"><Button>Confirmar pedido</Button></Link>
        </div>
      </div>
    </div>
  );
}
