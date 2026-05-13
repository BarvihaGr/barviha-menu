'use client';

import { create } from 'zustand';

export type ToastVariant = 'default' | 'success' | 'info';

export interface ToastEntry {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: ToastEntry[];
  push: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (message, variant = 'default') => {
    const id = nextId++;
    set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 2400);
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
