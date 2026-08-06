'use client';

import { useTranslations } from 'next-intl';
import type { ResolvedMenuItem, ItemLabel } from '@barviha/db';
import { cn } from '@/lib/utils';

/** Все возможные фильтры по всем мирам — единый ключ-набор. */
export type FilterKey =
  | 'noAlcohol'
  | 'withAlcohol'
  | 'withIce'
  | 'sparkling'
  | 'spicy'
  | 'vegan'
  | 'withMeat'
  | 'noMeat'
  | 'withFish'
  | 'noFish'
  | 'salad'
  | 'salty'
  | 'sweet'
  | 'halal'
  | 'healthy';

/** Раздел определяет какие фильтры доступны. */
export type FilterRealm = 'bar' | 'kitchen' | 'hookah' | 'desserts';

export const FILTERS_BY_REALM: Record<FilterRealm, FilterKey[]> = {
  bar: ['noAlcohol', 'withAlcohol', 'withIce', 'sparkling'],
  // Все фильтры ниже, кроме 'salty' (осталась текстовым эвристиком, не
  // просили переводить), теперь читают ручную разметку блюда из бэк-офиса
  // (item.labels/item.tags) — см. applyFilters ниже. Раньше это был
  // текстовый детект по названию/составу, который регулярно ошибался
  // (курица/рыба попадали в «с мясом», стейк — в «веган» и т.п.).
  kitchen: ['spicy', 'noMeat', 'withMeat', 'withFish', 'noFish', 'salad', 'sweet', 'vegan', 'halal', 'healthy'],
  hookah: [],
  desserts: ['sweet'],
};

const SALT_RE = /солён|соленый|пикант|умами|копчён/i;

/** Применить выбранные фильтры к списку блюд. */
export function applyFilters(
  items: ResolvedMenuItem[],
  active: Set<FilterKey>,
): ResolvedMenuItem[] {
  if (active.size === 0) return items;
  return items.filter((i) => {
    const composition = (i.composition || '').toLowerCase();
    const description = (i.description || '').toLowerCase();
    const haystack = composition + ' ' + description + ' ' + i.name.toLowerCase();
    // Для вкусовых фильтров — только название + описание (без состава)
    const tasteHaystack = description + ' ' + i.name.toLowerCase();
    const labels = i.labels as ItemLabel[];
    const tags = i.tags ?? [];

    if (active.has('noAlcohol') && i.is_alcoholic) return false;
    if (active.has('withAlcohol') && !i.is_alcoholic) return false;
    if (active.has('spicy') && !labels.includes('spicy')) return false;
    if (active.has('vegan') && !labels.includes('vegan')) return false;
    if (active.has('withIce') && !/лёд|лед|ice/i.test(haystack)) return false;
    // tasteHaystack (без состава): содов/тоник — ингредиенты коктейлей, не признак игристого
    if (active.has('sparkling') && !/игрист|просекко|шампан|sparkling|cava|кава/i.test(tasteHaystack))
      return false;
    if (active.has('withMeat') && !tags.includes('meat')) return false;
    if (active.has('noMeat') && tags.includes('meat')) return false;
    if (active.has('withFish') && !tags.includes('fish')) return false;
    if (active.has('noFish') && tags.includes('fish')) return false;
    if (active.has('salad') && !tags.includes('salad')) return false;
    if (active.has('salty') && !SALT_RE.test(tasteHaystack)) return false;
    if (active.has('sweet') && !tags.includes('sweet')) return false;
    if (active.has('halal') && !tags.includes('halal')) return false;
    if (active.has('healthy') && !tags.includes('healthy')) return false;
    return true;
  });
}

interface Props {
  active: Set<FilterKey>;
  onChange: (next: Set<FilterKey>) => void;
  realm?: FilterRealm;
}

export function FilterBar({ active, onChange, realm = 'kitchen' }: Props) {
  const t = useTranslations('filters');
  const available = FILTERS_BY_REALM[realm];
  if (available.length === 0) return null;

  const toggle = (key: FilterKey) => {
    const next = new Set(active);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
      {available.map((f) => {
        const on = active.has(f);
        return (
          <button
            key={f}
            type="button"
            onClick={() => toggle(f)}
            aria-pressed={on}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] transition-all duration-200 cursor-pointer',
              on
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-card text-muted hover:border-border-strong hover:text-foreground',
            )}
          >
            {t(f)}
          </button>
        );
      })}
      {active.size > 0 && (
        <button
          type="button"
          onClick={() => onChange(new Set())}
          className="shrink-0 whitespace-nowrap text-[10px] uppercase tracking-[0.18em] text-muted hover:text-foreground transition cursor-pointer"
        >
          {t('reset')}
        </button>
      )}
    </div>
  );
}
