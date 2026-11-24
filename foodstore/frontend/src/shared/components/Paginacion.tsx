import { Button } from '../ui/Button';

type Props = { pagina: number; paginas: number; onCambiar: (pagina: number) => void };

export function Paginacion({ pagina, paginas, onCambiar }: Props) {
  if (paginas <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-sm">
      <Button variant="secondary" disabled={pagina === 0} onClick={() => onCambiar(pagina - 1)}>Anterior</Button>
      <span>Página {pagina + 1} de {paginas}</span>
      <Button variant="secondary" disabled={pagina + 1 >= paginas} onClick={() => onCambiar(pagina + 1)}>Siguiente</Button>
    </div>
  );
}
