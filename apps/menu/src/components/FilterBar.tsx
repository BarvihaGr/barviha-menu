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
  | 'salty'
  | 'sweet';

/** Раздел определяет какие фильтры доступны. */
export type FilterRealm = 'bar' | 'kitchen' | 'hookah';

/**
 * Только ключевые диетические свойства — не больше 3 чипов,
 * чтобы не перегружать строку. Остальные (salty/sweet/withMeat)
 * убраны как редко используемые.
 */
const FILTERS_BY_REALM: Record<FilterRealm, FilterKey[]> = {
  bar: ['noAlcohol', 'withAlcohol', 'withIce'],
  kitchen: ['spicy', 'vegan', 'noMeat'],
  hookah: [],
};

const MEAT_RE =
  /говяд|телятин|свинин|бекон|курин|утк|утин|ростбиф|брезаол|тартар|стейк|рибай|бургер|котлет|ветчин|карбонад|колбас|сосис|лосось|тунец|рыб|креветк|кальмар|мидии|осьминог|форель/i;
const SALT_RE =
  /соль|солён|соленый|каперс|олив|маслин|маринован|бекон|сыр|пармезан|брынз|анчоус|икр/i;
const SWEET_RE =
  /сладк|мёд|мед|сироп|сахар|шокол|карамел|варен|джем|ваниль|ягод|клубник|малин|вишн|персик|ананас|банан|кокос|маршмел|пастил|мороже|тирамис|чизкей|медовик|сорбе|десерт|тарт|кокос|кленов/i;

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
    const labels = i.labels as ItemLabel[];

    if (active.has('noAlcohol') && i.is_alcoholic) return false;
    if (active.has('withAlcohol') && !i.is_alcoholic) return false;
    if (active.has('spicy') && !labels.includes('spicy')) return false;
    if (active.has('vegan') && !labels.includes('vegan')) return false;
    if (active.has('withIce') && !/лёд|лед|ice/i.test(haystack)) return false;
    if (active.has('sparkling') && !/игрист|содов|тоник|просекко|шампан|sparkling/i.test(haystack))
      return false;
    if (active.has('withMeat') && !MEAT_RE.test(haystack)) return false;
    if (active.has('noMeat') && MEAT_RE.test(haystack)) return false;
    if (active.has('salty') && !SALT_RE.test(haystack)) return false;
    if (active.has('sweet') && !SWEET_RE.test(haystack)) return false;
    return true;
  });
}

interface Props {
  active: Set<FilterKey>;
  onChange: (next: Set<FilterKey>) => void;
  realm?: FilterRealm;
}

/**
 * Компактная строка фильтров: видимые чипы-капсулы вместо поповера.
 * Максимум 3 фильтра на раздел — ряд не переполняется на 360px.
 * Горизонтальный свайп на мобиле через overflow-x: auto.
 */
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
                ? 'border-gold bg-gold/15 text-cream'
                : 'border-gold/20 bg-transparent text-muted hover:border-gold/45 hover:text-cream/80',
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
          className="shrink-0 whitespace-nowrap text-[10px] uppercase tracking-[0.18em] text-muted hover:text-gold transition cursor-pointer"
        >
          {t('reset')}
        </button>
      )}
    </div>
  );
}
