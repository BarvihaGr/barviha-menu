'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { ResolvedMenuItem } from '@barviha/db';
import { pickItemDescription, pickItemName, pickSubLabel } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/routing';
import { activeSectionsFor } from '@/lib/menu-sections';
import { cn } from '@/lib/utils';
import { applyFilters, type FilterKey, type FilterRealm } from '../FilterBar';
import { CoffeeItemCard } from './CoffeeItemCard';

/** Фильтры по реалму (как в FilterBar, локально — без поповера). */
const FILTERS_BY_REALM: Record<FilterRealm, FilterKey[]> = {
  bar: ['noAlcohol', 'withAlcohol', 'withIce', 'sparkling', 'sweet'],
  kitchen: ['spicy', 'vegan', 'withMeat', 'noMeat', 'salty', 'sweet'],
  hookah: [],
};

interface SectionDef {
  id: string;
  label: string;
  itemIds: Set<string>;
}

interface Props {
  items: ResolvedMenuItem[];
  locationSlug: string;
  categorySlug?: string;
  realm?: FilterRealm;
}

/**
 * Список меню в стиле Coffeemania: чистые инлайн-чипы подсекций и фильтров
 * (мгновенное переключение, без поповера) + воздушная сетка единообразных
 * карточек. Только для редизайн-локации (Бауманская).
 */
export function CoffeeMenuList({ items, locationSlug, categorySlug, realm = 'kitchen' }: Props) {
  const locale = useLocale() as Locale;
  const tSections = useTranslations('sections');
  const tFilters = useTranslations('filters');
  const [active, setActive] = useState<Set<FilterKey>>(new Set());
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections: SectionDef[] = useMemo(() => {
    const fromSub = buildFromSub(items, locale);
    if (fromSub.length > 0) return fromSub;
    if (!categorySlug) return [];
    return activeSectionsFor(categorySlug, items).map((s) => ({
      id: s.id,
      label: tSections(s.i18nKey),
      itemIds: new Set(s.itemIds),
    }));
  }, [items, categorySlug, tSections, locale]);

  const filtered = useMemo(() => {
    let pool = items;
    if (activeSection) {
      const sec = sections.find((s) => s.id === activeSection);
      if (sec) pool = items.filter((i) => sec.itemIds.has(i.id));
    }
    return applyFilters(pool, active);
  }, [items, active, activeSection, sections]);

  const availableFilters = FILTERS_BY_REALM[realm];

  const toggleFilter = (key: FilterKey) => {
    const next = new Set(active);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setActive(next);
  };

  return (
    <div>
      {/* Подсекции — чистые чипы */}
      {sections.length > 1 && (
        <div className="-mx-4 mb-3 overflow-x-auto no-scrollbar sm:mx-0">
          <div className="flex gap-2 px-4 sm:px-0">
            <Chip label={tSections('all')} on={activeSection === null} onClick={() => setActiveSection(null)} />
            {sections.map((s) => (
              <Chip
                key={s.id}
                label={s.label}
                on={activeSection === s.id}
                onClick={() => setActiveSection(s.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Фильтры — инлайн-чипы, мгновенное переключение */}
      {availableFilters.length > 0 && (
        <div className="-mx-4 mb-6 overflow-x-auto no-scrollbar sm:mx-0">
          <div className="flex gap-2 px-4 sm:px-0">
            {availableFilters.map((f) => (
              <Chip key={f} label={tFilters(f)} on={active.has(f)} onClick={() => toggleFilter(f)} subtle />
            ))}
            {active.size > 0 && (
              <button
                type="button"
                onClick={() => setActive(new Set())}
                className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-muted hover:text-gold transition cursor-pointer"
              >
                {tFilters('reset')}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:gap-x-6 sm:gap-y-9 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => (
          <CoffeeItemCard
            key={item.id}
            item={item}
            name={pickItemName(item, locale)}
            description={pickItemDescription(item, locale)}
            locationSlug={locationSlug}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-sm uppercase tracking-[0.2em] text-muted">—</div>
      )}
    </div>
  );
}

function Chip({
  label,
  on,
  onClick,
  subtle = false,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
  subtle?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 font-[family-name:var(--font-sans)] text-[11px] uppercase tracking-[0.16em] transition cursor-pointer',
        on
          ? 'bg-gold text-[#2A1B11]'
          : subtle
            ? 'bg-[color:var(--card)] text-muted hover:text-gold'
            : 'bg-[color:var(--card)] text-gold/80 hover:text-gold',
      )}
    >
      {label}
    </button>
  );
}

/** Группировка по item.sub (как в CategoryItemsList). */
function buildFromSub(items: ResolvedMenuItem[], locale: Locale): SectionDef[] {
  const order: string[] = [];
  const map = new Map<string, SectionDef>();
  for (const it of items) {
    if (!it.sub) continue;
    let s = map.get(it.sub);
    if (!s) {
      const label = pickSubLabel(it.sub, it.subLabel ?? it.sub, locale);
      s = { id: it.sub, label, itemIds: new Set() };
      map.set(it.sub, s);
      order.push(it.sub);
    }
    s.itemIds.add(it.id);
  }
  return order.map((k) => map.get(k)!);
}
