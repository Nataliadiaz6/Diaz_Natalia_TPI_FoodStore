import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cambiarActivo, getUsuarios } from '../api/usuarios';

export const useUsuarios = () => useQuery({ queryKey: ['usuarios'], queryFn: getUsuarios });

export function useCambiarActivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) => cambiarActivo(id, activar),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  });
}
