'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Minus, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '@/store/cart';
import { useToast } from '@/store/toast';
import { cn } from '@/lib/utils';

interface Props {
  itemId: string;
  itemName: string;
  variant?: 'icon' | 'full';
  className?: string;
}

const SPRING = { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] } as const;

export function AddToCartButton({ itemId, itemName, variant = 'icon', className }: Props) {
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  const qty = useCart((s) => s.items.find((i) => i.itemId === itemId)?.qty ?? 0);
  const push = useToast((s) => s.push);
  const t = useTranslations();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const shown = mounted ? qty : 0;

  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };
  const inc = (e: React.MouseEvent) => { stop(e); add(itemId, 1); };
  const dec = (e: React.MouseEvent) => { stop(e); setQty(itemId, shown - 1); };
  const firstAdd = (e: React.MouseEvent) => {
    stop(e);
    add(itemId, 1);
    push(t('toast.addedToCart'), 'success');
  };

  // ── full: широкая кнопка на детальной / кальяне ──
  if (variant === 'full') {
    return (
      <AnimatePresence mode="wait" initial={false}>
        {shown > 0 ? (
          <motion.div
            key="full-stepper"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={SPRING}
            className={cn('flex flex-1 items-center justify-between bg-gold text-[#2A1B11] px-6 py-3.5', className)}
            onClick={stop}
          >
            <button type="button" onClick={dec} aria-label="−"
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/10 cursor-pointer">
              <Minus size={18} strokeWidth={2.5} />
            </button>
            <span className="text-base font-semibold tabular-nums">{shown}</span>
            <button type="button" onClick={inc} aria-label="+"
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/10 cursor-pointer">
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="full-add"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={SPRING}
            type="button"
            onClick={firstAdd}
            className={cn('flex-1 bg-gold text-[#2A1B11] border-0 px-6 py-4 text-xs uppercase tracking-[0.25em] font-semibold transition hover:-translate-y-0.5 hover:bg-gold-light cursor-pointer', className)}
          >
            {t('item.addToCart')}
          </motion.button>
        )}
      </AnimatePresence>
    );
  }

  // ── icon: компактный степпер-капсула на карточках ──
  return (
    <AnimatePresence mode="wait" initial={false}>
      {shown > 0 ? (
        <motion.div
          key="stepper"
          initial={{ opacity: 0, scale: 0.72 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.72 }}
          transition={SPRING}
          className={cn(
            'inline-flex items-center gap-0.5 rounded-full border border-gold bg-gold/10 px-1 py-1',
            className,
          )}
          onClick={stop}
        >
          <button type="button" onClick={dec} aria-label="−"
            className="flex h-7 w-7 items-center justify-center rounded-full text-gold transition hover:bg-gold hover:text-[#2A1B11] cursor-pointer">
            <Minus size={14} strokeWidth={2.5} />
          </button>
          <span className="min-w-[20px] text-center text-sm font-medium tabular-nums text-cream">
            {shown}
          </span>
          <button type="button" onClick={inc} aria-label="+"
            className="flex h-7 w-7 items-center justify-center rounded-full text-gold transition hover:bg-gold hover:text-[#2A1B11] cursor-pointer">
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </motion.div>
      ) : (
        <motion.button
          key="add"
          initial={{ opacity: 0, scale: 0.72 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.72 }}
          transition={SPRING}
          type="button"
          onClick={firstAdd}
          aria-label={t('common.add') + ' ' + itemName}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full border border-gold text-gold transition hover:bg-gold hover:text-[#2A1B11] hover:scale-110 cursor-pointer',
            className,
          )}
        >
          <Plus size={18} strokeWidth={2} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
