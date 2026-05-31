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

  return (
    <div>
      {showFilters && (
        <div className="mb-5">
          <FilterBar active={active} onChange={setActive} realm={realm} />
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
        {filtered.map((item, i) => (
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
      {filtered.length === 0 && (
        <div className="py-16 text-center text-sm uppercase tracking-[0.2em] text-muted">
          —
        </div>
      )}
    </div>
  );
}
