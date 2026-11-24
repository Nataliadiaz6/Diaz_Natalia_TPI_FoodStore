import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { handleApiError } from '../../../shared/api/handleApiError';
import { DataTable } from '../../../shared/components/DataTable';
import { EstadoError } from '../../../shared/components/EstadoError';
import { dinero } from '../../../shared/format';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import { ProductoForm } from '../components/ProductoForm';
import { useActualizarProducto, useActualizarStock, useCrearProducto, useEliminarProducto, useProductos } from '../hooks/useProductos';
import type { Producto, ProductoInput } from '../types/producto';

const VACIO: ProductoInput = { nombre: '', descripcion: null, precio_base: 0, imagen_url: null, stock: 0, disponible: true, categoria_id: 0 };

export default function AdminProductosPage() {
  const { data, isLoading, isError, error } = useProductos({ skip: 0, limit: 100 });
  const { data: categorias = [] } = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const stockMut = useActualizarStock();
  const eliminar = useEliminarProducto();

  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [stockDe, setStockDe] = useState<Producto | null>(null);
  const [stock, setStock] = useState(0);
  const [disponible, setDisponible] = useState(true);

  const abrirStock = (p: Producto) => {
    setStockDe(p);
    setStock(p.stock);
    setDisponible(p.disponible);
  };

  const columnas = useMemo<ColumnDef<Producto>[]>(
    () => [
      { accessorKey: 'nombre', header: 'Nombre' },
      { id: 'categoria', header: 'Categoría', cell: ({ row }) => row.original.categoria?.nombre ?? '-' },
      { id: 'precio', header: 'Precio', cell: ({ row }) => dinero(row.original.precio_base) },
      { accessorKey: 'stock', header: 'Stock' },
      { id: 'disp', header: 'Disponible', cell: ({ row }) => (row.original.disponible ? 'Sí' : 'No') },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { setEditando(row.original); setFormAbierto(true); }}>Editar</Button>
            <Button variant="secondary" onClick={() => abrirStock(row.original)}>Stock</Button>
            <Button variant="danger" onClick={() => { if (window.confirm('¿Dar de baja el producto?')) eliminar.mutate(row.original.id); }}>Baja</Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const cerrarForm = () => {
    setFormAbierto(false);
    setEditando(null);
  };

  const guardar = (valores: ProductoInput) => {
    if (editando) actualizar.mutate({ id: editando.id, data: valores }, { onSuccess: cerrarForm });
    else crear.mutate(valores, { onSuccess: cerrarForm });
  };

  const errorMut = crear.error ?? actualizar.error ?? stockMut.error ?? eliminar.error;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Productos</h1>
        <Button onClick={() => { setEditando(null); setFormAbierto(true); }}>Nuevo producto</Button>
      </div>
      {errorMut && <EstadoError mensaje={handleApiError(errorMut)} />}
      {isError && <EstadoError mensaje={handleApiError(error)} />}
      {isLoading ? <p>Cargando…</p> : <DataTable data={data?.items ?? []} columns={columnas} />}

      <Modal abierto={formAbierto} titulo={editando ? 'Editar producto' : 'Nuevo producto'} onClose={cerrarForm}>
        <ProductoForm
          key={editando?.id ?? 'nuevo'}
          inicial={editando ? {
            nombre: editando.nombre, descripcion: editando.descripcion, precio_base: editando.precio_base,
            imagen_url: editando.imagen_url, stock: editando.stock, disponible: editando.disponible, categoria_id: editando.categoria_id,
          } : VACIO}
          categorias={categorias}
          enviando={crear.isPending || actualizar.isPending}
          onSubmit={guardar}
        />
      </Modal>

      <Modal abierto={stockDe !== null} titulo={`Stock: ${stockDe?.nombre ?? ''}`} onClose={() => setStockDe(null)}>
        <div className="space-y-3">
          <Input label="Stock" type="number" min={0} value={stock} onChange={(e) => setStock(Number(e.target.value))} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={disponible} onChange={(e) => setDisponible(e.target.checked)} /> Disponible
          </label>
          <Button
            className="w-full"
            disabled={stockMut.isPending || stock < 0}
            onClick={() => stockDe && stockMut.mutate({ id: stockDe.id, stock, disponible }, { onSuccess: () => setStockDe(null) })}
          >
            Guardar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
