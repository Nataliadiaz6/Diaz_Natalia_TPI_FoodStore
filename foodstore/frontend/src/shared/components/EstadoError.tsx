export function EstadoError({ mensaje }: { mensaje: string }) {
  return <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{mensaje}</p>;
}
