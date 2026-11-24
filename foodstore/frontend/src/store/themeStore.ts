import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Tema = 'claro' | 'oscuro';

interface ThemeState {
  tema: Tema;
  alternar: () => void;
}

const aplicar = (tema: Tema): void => {
  document.documentElement.classList.toggle('dark', tema === 'oscuro');
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      tema: 'claro',
      alternar: () => {
        const nuevo: Tema = get().tema === 'claro' ? 'oscuro' : 'claro';
        aplicar(nuevo);
        set({ tema: nuevo });
      },
    }),
    {
      name: 'theme-store',
      onRehydrateStorage: () => (state) => {
        if (state) aplicar(state.tema);
      },
    },
  ),
);