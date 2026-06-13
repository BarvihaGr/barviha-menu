'use client';

import { Minus, Plus } from 'lucide-react';
import { useCart } from '@/store/cart';

export function QtyControl({ itemId, qty }: { itemId: string; qty: number }) {
  const setQty = useCart((s) => s.setQty);
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => setQty(itemId, qty - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gold text-gold transition hover:bg-gold hover:text-[#2A1B11] cursor-pointer"
        aria-label="−"
      >
        <Minus size={14} strokeWidth={2.5} />
      </button>
      <span className="min-w-[24px] text-center text-base tabular-nums text-cream">{qty}</span>
      <button
        type="button"
        onClick={() => setQty(itemId, qty + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-gold text-gold transition hover:bg-gold hover:text-[#2A1B11] cursor-pointer"
        aria-label="+"
      >
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
