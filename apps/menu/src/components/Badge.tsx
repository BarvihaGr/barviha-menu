import type { ItemLabel } from '@barviha/db';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const VARIANTS: Record<ItemLabel, string> = {
  hit: 'border-gold text-gold',
  new: 'border-emerald-400 text-emerald-300',
  chef_pick: 'border-amber-400 text-amber-300',
  premium: 'border-violet-400 text-violet-300',
  spicy: 'border-red-400 text-red-300',
  vegan: 'border-lime-400 text-lime-300',
};

export function Badge({ label, className }: { label: ItemLabel; className?: string }) {
  const t = useTranslations('labels');
  return (
    <span
      className={cn(
        'border bg-black/80 px-2 py-1 text-[9px] uppercase tracking-[0.2em]',
        VARIANTS[label],
        className,
      )}
    >
      {t(label)}
    </span>
  );
}
