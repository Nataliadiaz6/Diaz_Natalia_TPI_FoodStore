import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { handleApiError } from '../../../shared/api/handleApiError';
import { EstadoError } from '../../../shared/components/EstadoError';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { registerApi } from '../api/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await registerApi(value);
        navigate('/login');
      } catch (e) {
        setError(handleApiError(e));
      }
    },
  });

  const mostrar = (touched: boolean, errors: unknown[]) => (touched ? errors.map(String).join(', ') : undefined);

  return (
    <Card className="mx-auto mt-8 max-w-sm">
      <h1 className="mb-4 text-xl font-bold">Crear cuenta</h1>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name="username" validators={{ onChange: ({ value }) => (value.trim().length >= 3 ? undefined : 'Mínimo 3 caracteres') }}>
          {(f) => (
            <Input label="Usuario" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur}
              error={mostrar(f.state.meta.isTouched, f.state.meta.errors)} />
          )}
        </form.Field>
        <form.Field name="full_name" validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Ingresá tu nombre') }}>
          {(f) => (
            <Input label="Nombre completo" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur}
              error={mostrar(f.state.meta.isTouched, f.state.meta.errors)} />
          )}
        </form.Field>
        <form.Field name="email" validators={{ onChange: ({ value }) => (/^\S+@\S+\.\S+$/.test(value) ? undefined : 'Email inválido') }}>
          {(f) => (
            <Input label="Email" type="email" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur}
              error={mostrar(f.state.meta.isTouched, f.state.meta.errors)} />
          )}
        </form.Field>
        <form.Field name="password" validators={{ onChange: ({ value }) => (value.length >= 8 ? undefined : 'Mínimo 8 caracteres') }}>
          {(f) => (
            <Input label="Contraseña" type="password" value={f.state.value} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur}
              error={mostrar(f.state.meta.isTouched, f.state.meta.errors)} />
          )}
        </form.Field>
        {error && <EstadoError mensaje={error} />}
        <Button type="submit" className="w-full">Registrarme</Button>
      </form>
      <p className="mt-3 text-sm">¿Ya tenés cuenta? <Link to="/login" className="text-blue-600">Ingresá</Link></p>
    </Card>
  );
}
