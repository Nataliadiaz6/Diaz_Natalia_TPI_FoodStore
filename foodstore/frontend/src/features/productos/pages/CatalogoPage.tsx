import { useDeferredValue, useState } from 'react';
import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { EstadoVacio } from '../../../shared/components/EstadoVacio';
import { Paginacion } from '../../../shared/components/Paginacion';
import { Skeleton } from '../../../shared/components/Skeleton';
import { useCategorias } from '../../categorias/hooks/useCategorias';
import { ProductoCard } from '../components/ProductoCard';
import { useProductos } from '../hooks/useProductos';

const LIMIT = 9;

export default function CatalogoPage() {
  const [search, setSearch] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [pagina, setPagina] = useState(0);
  const busqueda = useDeferredValue(search);

  const { data, isLoading, isError, error } = useProductos({
    skip: pagina * LIMIT,
    limit: LIMIT,
    search: busqueda || undefined,
    categoria_id: categoriaId,
  });
  const { data: categorias } = useCategorias();

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          className="min-w-52 flex-1 rounded border border-gray-300 px-3 py-1.5"
          placeholder="Buscar productos…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagina(0);
          }}
        />
        <select
          className="rounded border border-gray-300 px-3 py-1.5"
          value={categoriaId ?? ''}
          onChange={(e) => {
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined);
            setPagina(0);
          }}
        >
          <option value="">Todas las categorías</option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>
      {isLoading && <Skeleton />}
      {isError && <EstadoError mensaje={handleApiError(error)} />}
      {data && data.items.length === 0 && <EstadoVacio mensaje="No se encontraron productos." />}
      {data && data.items.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion pagina={pagina} paginas={Math.ceil(data.total / LIMIT)} onCambiar={setPagina} />
        </>
      )}
    </div>
  );
}
