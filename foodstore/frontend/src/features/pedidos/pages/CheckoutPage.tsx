import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { dinero } from '../../../shared/format';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { useCartStore } from '../../../store/cartStore';
import { useCrearPedido } from '../hooks/usePedidos';
import type { FormaPago } from '../types/pedido';

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const vaciar = useCartStore((s) => s.vaciar);
  const total = useCartStore((s) => s.total());
  const crear = useCrearPedido();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: ({ value }) => {
      setError(null);
      crear.mutate(
        {
          items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() || null,
        },
        {
          onSuccess: () => {
            vaciar();
            navigate('/mis-pedidos');
          },
          onError: (e) => setError(handleApiError(e)),
        },
      );
    },
  });

  if (items.length === 0) return <EstadoVacio mensaje="No hay productos en el carrito." />;

  return (
    <Card className="mx-auto max-w-md">
      <h1 className="mb-1 text-xl font-bold">Confirmar pedido</h1>
      <p className="mb-4 text-sm text-gray-600">{items.length} producto(s) · Total {dinero(total)}</p>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="direccion_entrega"
          validators={{ onChange: ({ value }) => (value.trim().length >= 5 && value.trim().length <= 200 ? undefined : 'Entre 5 y 200 caracteres') }}
        >
          {(f) => (
            <Input label="Dirección de entrega" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur}
              error={f.state.meta.isTouched ? f.state.meta.errors.map(String).join(', ') : undefined} />
          )}
        </form.Field>
        <form.Field name="forma_pago">
          {(f) => (
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Forma de pago</span>
              <select className="w-full rounded border border-gray-300 px-3 py-1.5" value={f.state.value}
                onChange={(e) => f.handleChange(e.target.value as FormaPago)}>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </label>
          )}
        </form.Field>
        <form.Field name="notas">
          {(f) => <Input label="Notas (opcional)" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} />}
        </form.Field>
        {error && <EstadoError mensaje={error} />}
        <Button type="submit" disabled={crear.isPending} className="w-full">Confirmar</Button>
      </form>
    </Card>
  );
}
