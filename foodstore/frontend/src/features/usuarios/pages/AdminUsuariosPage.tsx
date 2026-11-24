import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { handleApiError } from '../../../shared/api/handleApiError';
import { DataTable } from '../../../shared/components/DataTable';
import { EstadoError } from '../../../shared/components/EstadoError';
import { Button } from '../../../shared/ui/Button';
import type { Usuario } from '../../auth/types/usuario';
import { useAuthStore } from '../../../store/authStore';
import { useCambiarActivo, useUsuarios } from '../hooks/useUsuarios';

export default function AdminUsuariosPage() {
  const { data, isLoading, isError, error } = useUsuarios();
  const cambiar = useCambiarActivo();
  const miId = useAuthStore((s) => s.usuario?.id);

  const columnas = useMemo<ColumnDef<Usuario>[]>(
    () => [
      { accessorKey: 'username', header: 'Usuario' },
      { accessorKey: 'full_name', header: 'Nombre' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'role', header: 'Rol' },
      { id: 'estado', header: 'Estado', cell: ({ row }) => (row.original.disabled ? 'Desactivado' : 'Activo') },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const u = row.original;
          if (u.disabled) return <Button onClick={() => cambiar.mutate({ id: u.id, activar: true })}>Activar</Button>;
          if (u.id === miId) return null; // el admin no puede desactivarse a sí mismo
          return <Button variant="danger" onClick={() => cambiar.mutate({ id: u.id, activar: false })}>Desactivar</Button>;
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [miId],
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Usuarios</h1>
      {cambiar.isError && <EstadoError mensaje={handleApiError(cambiar.error)} />}
      {isError && <EstadoError mensaje={handleApiError(error)} />}
      {isLoading ? <p>Cargando…</p> : <DataTable data={data ?? []} columns={columnas} />}
    </div>
  );
}
