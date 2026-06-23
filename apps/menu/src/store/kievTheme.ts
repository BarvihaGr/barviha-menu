'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type KievVariant = 'ivory' | 'arka';

interface KievThemeState {
  variant: KievVariant;
  setVariant: (v: KievVariant) => void;
}

export const useKievTheme = create<KievThemeState>()(
  persist(
    (set) => ({
      variant: 'ivory',
      setVariant: (variant) => set({ variant }),
    }),
    { name: 'kiev-theme-v1', partialize: (s) => ({ variant: s.variant }) },
  ),
);
