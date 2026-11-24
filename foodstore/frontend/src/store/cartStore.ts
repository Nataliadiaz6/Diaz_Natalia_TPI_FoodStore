import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
}

interface CartState {
  items: ItemCarrito[];
  agregar: (item: Omit<ItemCarrito, 'cantidad'>) => void;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      agregar: (item) =>
        set((s) => {
          const existe = s.items.find((i) => i.producto_id === item.producto_id);
          return existe
            ? { items: s.items.map((i) => (i.producto_id === item.producto_id ? { ...i, cantidad: i.cantidad + 1 } : i)) }
            : { items: [...s.items, { ...item, cantidad: 1 }] };
        }),
      quitar: (id) => set((s) => ({ items: s.items.filter((i) => i.producto_id !== id) })),
      cambiarCantidad: (id, cantidad) =>
        set((s) => ({ items: s.items.map((i) => (i.producto_id === id ? { ...i, cantidad: Math.max(1, cantidad) } : i)) })),
      vaciar: () => set({ items: [] }),
      total: () => get().items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0),
    }),
    { name: 'cart-store' },
  ),
);
