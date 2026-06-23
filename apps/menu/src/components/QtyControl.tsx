'use client';

import { Minus, Plus } from 'lucide-react';
import { useCart } from '@/store/cart';
import { cn } from '@/lib/utils';

export function QtyControl({ itemId, qty, compact }: { itemId: string; qty: number; compact?: boolean }) {
  const setQty = useCart((s) => s.setQty);
  const btn = cn(
    'flex items-center justify-center rounded-full border border-gold text-gold transition hover:bg-gold hover:text-[#2A1B11] cursor-pointer',
    compact ? 'h-7 w-7' : 'h-8 w-8',
  );
  return (
    <div className={cn('flex items-center', compact ? 'gap-2' : 'gap-3')}>
      <button type="button" onClick={() => setQty(itemId, qty - 1)} className={btn} aria-label="−">
        <Minus size={compact ? 12 : 14} strokeWidth={2.5} />
      </button>
      <span className={cn('min-w-[20px] text-center tabular-nums text-cream', compact ? 'text-sm' : 'text-base')}>
        {qty}
      </span>
      <button type="button" onClick={() => setQty(itemId, qty + 1)} className={btn} aria-label="+">
        <Plus size={compact ? 12 : 14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
