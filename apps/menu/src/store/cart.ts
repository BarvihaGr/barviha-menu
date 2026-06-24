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
  updatedAt: number;
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

const CART_TTL_MS = 8 * 60 * 60 * 1000; // 8 часов

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      sessionId: genSessionId(),
      updatedAt: Date.now(),
      add: (itemId, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.itemId === itemId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.itemId === itemId ? { ...i, qty: i.qty + qty } : i,
              ),
              updatedAt: Date.now(),
            };
          }
          return { items: [...state.items, { itemId, qty }], updatedAt: Date.now() };
        }),
      remove: (itemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.itemId !== itemId),
          updatedAt: Date.now(),
        })),
      setQty: (itemId, qty) =>
        set((state) => {
          if (qty <= 0) return { items: state.items.filter((i) => i.itemId !== itemId), updatedAt: Date.now() };
          return {
            items: state.items.map((i) => (i.itemId === itemId ? { ...i, qty } : i)),
            updatedAt: Date.now(),
          };
        }),
      setNotes: (itemId, notes) =>
        set((state) => ({
          items: state.items.map((i) => (i.itemId === itemId ? { ...i, notes } : i)),
          updatedAt: Date.now(),
        })),
      clear: () => set({ items: [], updatedAt: Date.now() }),
      totalCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    {
      name: 'barviha-cart-v2',
      partialize: (state) => ({ items: state.items, sessionId: state.sessionId, updatedAt: state.updatedAt }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Нет timestamp (старый формат) или истёк TTL → корзина сброшена
        if (!state.updatedAt || Date.now() - state.updatedAt > CART_TTL_MS) {
          state.items = [];
          state.updatedAt = Date.now();
        }
      },
    },
  ),
);
