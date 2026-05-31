'use client';

import { useTranslations } from 'next-intl';
import type { ItemLabel, ResolvedMenuItem } from '@barviha/db';
import { cn } from '@/lib/utils';

type FilterKey = 'noAlcohol' | 'priceUnder1000' | 'spicy' | 'vegan';

export function applyFilters(items: ResolvedMenuItem[], active: Set<FilterKey>): ResolvedMenuItem[] {
  return items.filter((i) => {
    if (active.has('noAlcohol') && i.is_alcoholic) return false;
    if (active.has('priceUnder1000') && i.price > 1000) return false;
    if (active.has('spicy') && !(i.labels as ItemLabel[]).includes('spicy')) return false;
    if (active.has('vegan') && !(i.labels as ItemLabel[]).includes('vegan')) return false;
    return true;
  });
}

interface FilterBarProps {
  active: Set<FilterKey>;
  onChange: (next: Set<FilterKey>) => void;
}

export function FilterBar({ active, onChange }: FilterBarProps) {
  const t = useTranslations('filters');
  const filters: FilterKey[] = ['noAlcohol', 'priceUnder1000', 'spicy', 'vegan'];

  const toggle = (key: FilterKey) => {
    const next = new Set(active);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {filters.map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => toggle(f)}
          className={cn(
            'shrink-0 rounded-sm border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition cursor-pointer',
            active.has(f)
              ? 'border-gold bg-gold text-[#3F1904]'
              : 'border-[color:var(--border)] text-muted hover:text-gold hover:border-gold',
          )}
        >
          {t(f)}
        </button>
      ))}
      {active.size > 0 && (
        <button
          type="button"
          onClick={() => onChange(new Set())}
          className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-muted hover:text-gold cursor-pointer px-2"
        >
          {t('reset')}
        </button>
      )}
    </div>
  );
}

export type { FilterKey };
