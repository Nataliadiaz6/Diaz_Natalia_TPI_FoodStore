import { useForm } from '@tanstack/react-form';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { handleApiError } from '../../../shared/api/handleApiError';
import { DataTable } from '../../../shared/components/DataTable';
import { EstadoError } from '../../../shared/components/EstadoError';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';
import { useActualizarCategoria, useCategorias, useCrearCategoria, useEliminarCategoria } from '../hooks/useCategorias';
import type { Categoria, CategoriaInput } from '../types/categoria';

function CategoriaForm({ inicial, enviando, onSubmit }: { inicial: CategoriaInput; enviando: boolean; onSubmit: (d: CategoriaInput) => void }) {
  const form = useForm({
    defaultValues: inicial,
    onSubmit: ({ value }) => onSubmit({ nombre: value.nombre.trim(), descripcion: value.descripcion || null }),
  });
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="nombre"
        validators={{ onChange: ({ value }) => (value.trim().length >= 2 && value.trim().length <= 100 ? undefined : 'Entre 2 y 100 caracteres') }}
      >
        {(f) => (
          <Input label="Nombre" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur}
            error={f.state.meta.isTouched ? f.state.meta.errors.map(String).join(', ') : undefined} />
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(f) => <Input label="Descripción" value={f.state.value ?? ''} onChange={(e) => f.handleChange(e.target.value)} />}
      </form.Field>
      <Button type="submit" disabled={enviando} className="w-full">Guardar</Button>
    </form>
  );
}

export default function AdminCategoriasPage() {
  const { data, isLoading, isError, error } = useCategorias();
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const eliminar = useEliminarCategoria();
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);

  const cerrar = () => {
    setAbierto(false);
    setEditando(null);
  };

  const columnas = useMemo<ColumnDef<Categoria>[]>(
    () => [
      { accessorKey: 'nombre', header: 'Nombre' },
      { id: 'descripcion', header: 'Descripción', cell: ({ row }) => row.original.descripcion ?? '-' },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { setEditando(row.original); setAbierto(true); }}>Editar</Button>
            <Button variant="danger" onClick={() => { if (window.confirm('¿Dar de baja la categoría?')) eliminar.mutate(row.original.id); }}>Baja</Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const guardar = (d: CategoriaInput) => {
    if (editando) actualizar.mutate({ id: editando.id, data: d }, { onSuccess: cerrar });
    else crear.mutate(d, { onSuccess: cerrar });
  };

  const errorMut = crear.error ?? actualizar.error ?? eliminar.error;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Categorías</h1>
        <Button onClick={() => { setEditando(null); setAbierto(true); }}>Nueva categoría</Button>
      </div>
      {errorMut && <EstadoError mensaje={handleApiError(errorMut)} />}
      {isError && <EstadoError mensaje={handleApiError(error)} />}
      {isLoading ? <p>Cargando…</p> : <DataTable data={data ?? []} columns={columnas} />}
      <Modal abierto={abierto} titulo={editando ? 'Editar categoría' : 'Nueva categoría'} onClose={cerrar}>
        <CategoriaForm
          key={editando?.id ?? 'nueva'}
          inicial={{ nombre: editando?.nombre ?? '', descripcion: editando?.descripcion ?? null }}
          enviando={crear.isPending || actualizar.isPending}
          onSubmit={guardar}
        />
      </Modal>
    </div>
  );
}
