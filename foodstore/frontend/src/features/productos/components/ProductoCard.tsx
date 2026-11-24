import { dinero } from '../../../shared/format';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { useCartStore } from '../../../store/cartStore';
import type { Producto } from '../types/producto';

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar);
  const sinStock = !producto.disponible || producto.stock === 0;
  return (
    <Card className="flex flex-col gap-2">
      {producto.imagen_url && <img src={producto.imagen_url} alt={producto.nombre} className="h-32 w-full rounded object-cover" />}
      <h3 className="font-semibold">{producto.nombre}</h3>
      <p className="flex-1 text-sm text-gray-600">{producto.descripcion}</p>
      <p className="text-xs text-gray-500">{producto.categoria?.nombre} · Stock: {producto.stock}</p>
      <div className="flex items-center justify-between">
        <span className="font-bold">{dinero(producto.precio_base)}</span>
        <Button
          disabled={sinStock}
          onClick={() => agregar({ producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base })}
        >
          {sinStock ? 'Sin stock' : 'Agregar al carrito'}
        </Button>
      </div>
    </Card>
  );
}
