import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { useAuthStore } from '../../../store/authStore';

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await login(value.username, value.password);
        navigate('/');
      } catch (e) {
        setError(handleApiError(e));
      }
    },
  });

  return (
    <Card className="mx-auto mt-8 max-w-sm">
      <h1 className="mb-4 text-xl font-bold">Iniciar sesión</h1>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name="username" validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá tu usuario') }}>
          {(field) => (
            <Input
              label="Usuario"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.isTouched ? field.state.meta.errors.map(String).join(', ') : undefined}
            />
          )}
        </form.Field>
        <form.Field name="password" validators={{ onChange: ({ value }) => (value ? undefined : 'Ingresá tu contraseña') }}>
          {(field) => (
            <Input
              label="Contraseña"
              type="password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.isTouched ? field.state.meta.errors.map(String).join(', ') : undefined}
            />
          )}
        </form.Field>
        {error && <EstadoError mensaje={error} />}
        <Button type="submit" className="w-full">Ingresar</Button>
      </form>
      <p className="mt-3 text-sm">¿No tenés cuenta? <Link to="/register" className="text-blue-600">Registrate</Link></p>
    </Card>
  );
}
