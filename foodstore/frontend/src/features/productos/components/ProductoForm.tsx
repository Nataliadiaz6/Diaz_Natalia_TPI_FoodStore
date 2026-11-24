import { useForm } from '@tanstack/react-form';
import type { Categoria } from '../../categorias/types/categoria';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import type { ProductoInput } from '../types/producto';

type Props = {
  inicial: ProductoInput;
  categorias: Categoria[];
  enviando: boolean;
  onSubmit: (data: ProductoInput) => void;
};

export function ProductoForm({ inicial, categorias, enviando, onSubmit }: Props) {
  const form = useForm({
    defaultValues: inicial,
    onSubmit: ({ value }) => onSubmit({ ...value, descripcion: value.descripcion || null, imagen_url: value.imagen_url || null }),
  });
  const mostrar = (touched: boolean, errors: unknown[]) => (touched ? errors.map(String).join(', ') : undefined);

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field name="nombre" validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Obligatorio') }}>
        {(f) => (
          <Input label="Nombre" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur}
            error={mostrar(f.state.meta.isTouched, f.state.meta.errors)} />
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(f) => <Input label="Descripción" value={f.state.value ?? ''} onChange={(e) => f.handleChange(e.target.value)} />}
      </form.Field>
      <form.Field name="precio_base" validators={{ onChange: ({ value }) => (value >= 0 ? undefined : 'Debe ser ≥ 0') }}>
        {(f) => (
          <Input label="Precio" type="number" min={0} step="0.01" value={f.state.value}
            onChange={(e) => f.handleChange(Number(e.target.value))} error={mostrar(f.state.meta.isTouched, f.state.meta.errors)} />
        )}
      </form.Field>
      <form.Field name="stock" validators={{ onChange: ({ value }) => (Number.isInteger(value) && value >= 0 ? undefined : 'Entero ≥ 0') }}>
        {(f) => (
          <Input label="Stock" type="number" min={0} value={f.state.value}
            onChange={(e) => f.handleChange(Number(e.target.value))} error={mostrar(f.state.meta.isTouched, f.state.meta.errors)} />
        )}
      </form.Field>
      <form.Field name="imagen_url">
        {(f) => <Input label="URL de imagen" value={f.state.value ?? ''} onChange={(e) => f.handleChange(e.target.value)} />}
      </form.Field>
      <form.Field name="categoria_id" validators={{ onChange: ({ value }) => (value > 0 ? undefined : 'Elegí una categoría') }}>
        {(f) => (
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Categoría</span>
            <select className="w-full rounded border border-gray-300 px-3 py-1.5" value={f.state.value || ''}
              onChange={(e) => f.handleChange(Number(e.target.value))} onBlur={f.handleBlur}>
              <option value="">Seleccionar…</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            {f.state.meta.isTouched && <span className="text-xs text-red-600">{f.state.meta.errors.map(String).join(', ')}</span>}
          </label>
        )}
      </form.Field>
      <form.Field name="disponible">
        {(f) => (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.state.value} onChange={(e) => f.handleChange(e.target.checked)} /> Disponible
          </label>
        )}
      </form.Field>
      <Button type="submit" disabled={enviando} className="w-full">Guardar</Button>
    </form>
  );
}
