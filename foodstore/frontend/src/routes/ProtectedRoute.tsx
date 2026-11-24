import { Navigate, Outlet } from 'react-router-dom';
import type { Rol } from '../features/auth/types/usuario';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute({ roles }: { roles?: Rol[] }) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  if (cargando) return <p className="p-8 text-center text-gray-500">Verificando sesión…</p>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(usuario.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
