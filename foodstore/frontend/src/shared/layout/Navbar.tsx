import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../ui/Button';
import { useThemeStore } from '../../store/themeStore';

const adminLinks: [string, string][] = [
  ['/admin/resumen', 'Resumen'],
  ['/admin/categorias', 'Categorías'],
  ['/admin/productos', 'Productos'],
  ['/admin/pedidos', 'Pedidos'],
  ['/admin/usuarios', 'Usuarios'],
];

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cantidad = useCartStore((s) => s.items.reduce((acc, i) => acc + i.cantidad, 0));
  const navigate = useNavigate();
  const tema = useThemeStore((s) => s.tema); 
  const alternar = useThemeStore((s) => s.alternar);

  const salir = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow dark:bg-gray-800">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3 text-sm">
        <Link to="/" className="text-lg font-bold text-blue-600 dark:text-blue-400">Food Store</Link>
        <Link to="/">Catálogo</Link>
        <Link to="/carrito">Carrito ({cantidad})</Link>
        {usuario && <Link to="/mis-pedidos">Mis pedidos</Link>}
        {usuario?.role === 'admin' && adminLinks.map(([to, label]) => <Link key={to} to={to} className="text-blue-700">{label}</Link>)}
        <div className="ml-auto flex items-center gap-3">
          <Button variant="secondary" onClick={alternar} aria-label="Cambiar tema">
            {tema === 'claro' ? '🌙' : '☀️'}
          </Button>
          {usuario ? (
            <>
              <span>{usuario.full_name} ({usuario.role})</span>
              <Button variant="secondary" onClick={() => void salir()}>Cerrar sesión</Button>
            </>
          ) : (
            <>
              <Link to="/login">Ingresar</Link>
              <Link to="/register">Registrarse</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
