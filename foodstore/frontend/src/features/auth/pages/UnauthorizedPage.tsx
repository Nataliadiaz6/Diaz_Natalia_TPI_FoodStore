import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="mb-2 text-xl font-bold">Sin permiso</h1>
      <p className="mb-4">No tenés permisos para ver esta pantalla.</p>
      <Link to="/" className="text-blue-600">Volver al inicio</Link>
    </div>
  );
}
