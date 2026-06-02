'use client';

import { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import type { ResolvedMenuItem } from '@barviha/db';
import { pickItemDescription, pickItemName } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/routing';
import { ItemCard } from './ItemCard';
import { FilterBar, applyFilters, type FilterKey, type FilterRealm } from './FilterBar';

interface Props {
  items: ResolvedMenuItem[];
  locationSlug: string;
  showFilters?: boolean;
  realm?: FilterRealm;
}

export function CategoryItemsList({ items, locationSlug, showFilters = true, realm = 'kitchen' }: Props) {
  const locale = useLocale() as Locale;
  const [active, setActive] = useState<Set<FilterKey>>(new Set());
  const filtered = useMemo(() => applyFilters(items, active), [items, active]);

  // Группируем по подкатегории (раздел), сохраняя порядок появления.
  const sections = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, { label: string; items: ResolvedMenuItem[] }>();
    for (const it of filtered) {
      const key = it.sub ?? '_';
      let s = map.get(key);
      if (!s) {
        s = { label: it.subLabel ?? '', items: [] };
        map.set(key, s);
        order.push(key);
      }
      s.items.push(it);
    }
    return order.map((k) => map.get(k)!);
  }, [filtered]);

  return (
    <div>
      {showFilters && (
        <div className="mb-5">
          <FilterBar active={active} onChange={setActive} realm={realm} />
        </div>
      )}

      {sections.map((section, si) => (
        <section key={section.label || si} className="mb-9">
          {section.label && (
            <h3 className="mb-4 flex items-center gap-3 text-sm uppercase tracking-[0.22em] text-gold font-light">
              <span>{section.label}</span>
              <span className="h-px flex-1 bg-[color:var(--border)]" />
              <span className="text-[10px] text-muted-dim">{section.items.length}</span>
            </h3>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {section.items.map((item, i) => (
              <ItemCard
                key={item.id}
                item={item}
                name={pickItemName(item, locale)}
                description={pickItemDescription(item, locale)}
                locationSlug={locationSlug}
                index={i}
              />
            ))}
          </div>
        </section>
      ))}

      {filtered.length === 0 && (
        <div className="py-16 text-center text-sm uppercase tracking-[0.2em] text-muted">—</div>
      )}
    </div>
  );
}
