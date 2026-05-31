'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal, Check, X } from 'lucide-react';
import type { ResolvedMenuItem, ItemLabel } from '@barviha/db';
import { cn } from '@/lib/utils';

/** Все возможные фильтры по всем мирам — единый ключ-набор. */
export type FilterKey =
  // Бар
  | 'noAlcohol'
  | 'withAlcohol'
  | 'withIce'
  | 'sparkling'
  | 'priceUnder1000'
  // Кухня
  | 'spicy'
  | 'vegan'
  | 'withMeat'
  | 'noMeat'
  | 'salty';

/** Раздел определяет какие фильтры доступны. */
export type FilterRealm = 'bar' | 'kitchen' | 'hookah';

const FILTERS_BY_REALM: Record<FilterRealm, FilterKey[]> = {
  bar: ['noAlcohol', 'withAlcohol', 'withIce', 'sparkling', 'priceUnder1000'],
  kitchen: ['spicy', 'vegan', 'withMeat', 'noMeat', 'salty', 'priceUnder1000'],
  hookah: [], // у кальянов фильтр не нужен
};

const MEAT_RE = /говяд|телятин|свинин|бекон|курин|утк|утин|ростбиф|брезаол|тартар|стейк|рибай|бургер|котлет|ветчин|карбонад|колбас|сосис|лосось|тунец|рыб|креветк|кальмар|мидии|осьминог|форель/i;
const SALT_RE = /соль|солён|соленый|каперс|олив|маслин|маринован|бекон|сыр|пармезан|брынз|анчоус|икр/i;

/** Применить выбранные фильтры к списку блюд. */
export function applyFilters(items: ResolvedMenuItem[], active: Set<FilterKey>): ResolvedMenuItem[] {
  if (active.size === 0) return items;
  return items.filter((i) => {
    const composition = (i.composition || '').toLowerCase();
    const description = (i.description || '').toLowerCase();
    const haystack = composition + ' ' + description + ' ' + i.name.toLowerCase();
    const labels = i.labels as ItemLabel[];

    if (active.has('noAlcohol') && i.is_alcoholic) return false;
    if (active.has('withAlcohol') && !i.is_alcoholic) return false;
    if (active.has('priceUnder1000') && i.price > 1000) return false;
    if (active.has('spicy') && !labels.includes('spicy')) return false;
    if (active.has('vegan') && !labels.includes('vegan')) return false;
    if (active.has('withIce') && !/лёд|лед|ice/i.test(haystack)) return false;
    if (active.has('sparkling') && !/игрист|содов|тоник|просекко|шампан|sparkling/i.test(haystack)) return false;
    if (active.has('withMeat') && !MEAT_RE.test(haystack)) return false;
    if (active.has('noMeat') && MEAT_RE.test(haystack)) return false;
    if (active.has('salty') && !SALT_RE.test(haystack)) return false;
    return true;
  });
}

interface Props {
  active: Set<FilterKey>;
  onChange: (next: Set<FilterKey>) => void;
  realm?: FilterRealm;
}

/**
 * Кнопка-иконка «фильтр» с popover-меню. Доступные фильтры зависят
 * от раздела (бар/кухня/кальяны). При активных фильтрах кнопка
 * подсвечивается + показывает количество.
 */
export function FilterBar({ active, onChange, realm = 'kitchen' }: Props) {
  const t = useTranslations('filters');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const available = FILTERS_BY_REALM[realm];

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (available.length === 0) return null;

  const toggle = (key: FilterKey) => {
    const next = new Set(active);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };

  const activeCount = available.filter((k) => active.has(k)).length;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition cursor-pointer',
          activeCount > 0
            ? 'border-gold bg-gold text-[#2A1B11]'
            : 'border-gold/40 bg-gold/10 text-gold hover:bg-gold/20 hover:border-gold',
        )}
        aria-label={t('title')}
        aria-expanded={open}
      >
        <SlidersHorizontal size={14} />
        <span>{t('title')}</span>
        {activeCount > 0 && (
          <span className="ml-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#2A1B11] text-gold text-[10px] px-1.5">
            {activeCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 top-full mt-2 z-50 w-64 max-w-[calc(100vw-2rem)] rounded-sm border border-gold bg-[color:var(--card-elev)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[color:var(--border)] px-3 py-2.5">
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold">{t('title')}</span>
              {activeCount > 0 && (
                <button
                  onClick={() => onChange(new Set())}
                  className="text-[10px] uppercase tracking-[0.2em] text-muted hover:text-gold cursor-pointer"
                >
                  {t('reset')}
                </button>
              )}
            </div>
            <div className="py-1.5">
              {available.map((f) => {
                const on = active.has(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggle(f)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2.5 text-xs transition cursor-pointer text-left',
                      on ? 'text-gold' : 'text-foreground hover:bg-gold/5',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition',
                        on ? 'border-gold bg-gold' : 'border-gold/40',
                      )}
                    >
                      {on && <Check size={11} className="text-[#2A1B11]" strokeWidth={3} />}
                    </span>
                    <span className="flex-1">{t(f)}</span>
                  </button>
                );
              })}
            </div>
            {activeCount > 0 && (
              <button
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-1.5 border-t border-[color:var(--border)] py-2.5 text-[10px] uppercase tracking-[0.25em] text-gold hover:bg-gold/10 cursor-pointer transition"
              >
                <X size={12} /> {t('close')}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
