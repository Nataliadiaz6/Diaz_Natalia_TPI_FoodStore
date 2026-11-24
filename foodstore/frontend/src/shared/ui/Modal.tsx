import type { ReactNode } from 'react';

type Props = { abierto: boolean; titulo: string; onClose: () => void; children: ReactNode };

export function Modal({ abierto, titulo, onClose, children }: Props) {
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-5 shadow-xl dark:bg-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-gray-500">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
