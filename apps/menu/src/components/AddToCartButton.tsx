'use client';

import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useToast } from '@/store/toast';
import { cn } from '@/lib/utils';

interface Props {
  itemId: string;
  itemName: string;
  variant?: 'icon' | 'full';
  className?: string;
}

export function AddToCartButton({ itemId, itemName, variant = 'icon', className }: Props) {
  const add = useCart((s) => s.add);
  const push = useToast((s) => s.push);
  const t = useTranslations();

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(itemId, 1);
    push(t('toast.addedToCart'), 'success');
  };

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex-1 bg-gold text-[#2A1B11] border-0 px-6 py-4 text-xs uppercase tracking-[0.25em] font-semibold transition hover:-translate-y-0.5 hover:bg-gold-light cursor-pointer',
          className,
        )}
      >
        {t('item.addToCart')}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t('common.add') + ' ' + itemName}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full border border-gold text-gold transition hover:bg-gold hover:text-[#2A1B11] hover:scale-110 cursor-pointer',
        className,
      )}
    >
      <Plus size={18} strokeWidth={2} />
    </button>
  );
}
