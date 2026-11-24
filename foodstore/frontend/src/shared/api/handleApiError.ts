import axios from 'axios';

export function handleApiError(error: unknown): string {
  if (axios.isAxiosError<{ detail?: unknown }>(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor';
    const detail = error.response.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((d: { msg?: string }) => d.msg ?? '').filter(Boolean).join('. ') || 'Datos inválidos';
    }
  }
  return 'Ocurrió un error inesperado';
}
