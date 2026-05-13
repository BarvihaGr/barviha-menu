'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartEntry {
  itemId: string;
  qty: number;
  notes?: string;
}

interface CartState {
  items: CartEntry[];
  sessionId: string;
  add: (itemId: string, qty?: number) => void;
  remove: (itemId: string) => void;
  setQty: (itemId: string, qty: number) => void;
  setNotes: (itemId: string, notes: string) => void;
  clear: () => void;
  totalCount: () => number;
}

const genSessionId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      sessionId: genSessionId(),
      add: (itemId, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.itemId === itemId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.itemId === itemId ? { ...i, qty: i.qty + qty } : i,
              ),
            };
          }
          return { items: [...state.items, { itemId, qty }] };
        }),
      remove: (itemId) =>
        set((state) => ({ items: state.items.filter((i) => i.itemId !== itemId) })),
      setQty: (itemId, qty) =>
        set((state) => {
          if (qty <= 0) return { items: state.items.filter((i) => i.itemId !== itemId) };
          return {
            items: state.items.map((i) => (i.itemId === itemId ? { ...i, qty } : i)),
          };
        }),
      setNotes: (itemId, notes) =>
        set((state) => ({
          items: state.items.map((i) => (i.itemId === itemId ? { ...i, notes } : i)),
        })),
      clear: () => set({ items: [] }),
      totalCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    {
      name: 'barviha-cart-v1',
      partialize: (state) => ({ items: state.items, sessionId: state.sessionId }),
    },
  ),
);
