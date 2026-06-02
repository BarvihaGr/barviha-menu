'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { ResolvedMenuItem } from '@barviha/db';
import { pickItemDescription, pickItemName } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/routing';
import { activeSectionsFor, SECTIONS_BY_CATEGORY } from '@/lib/menu-sections';
import { ItemCard } from './ItemCard';
import { FilterBar, applyFilters, type FilterKey, type FilterRealm } from './FilterBar';
import { SectionTabs } from './SectionTabs';

interface Props {
  items: ResolvedMenuItem[];
  locationSlug: string;
  /** Slug категории — нужен для подсекций (если sub-полей у items нет). */
  categorySlug?: string;
  showFilters?: boolean;
  realm?: FilterRealm;
}

interface SectionDef {
  id: string;
  label: string;
  itemIds: Set<string>;
}

export function CategoryItemsList({
  items,
  locationSlug,
  categorySlug,
  showFilters = true,
  realm = 'kitchen',
}: Props) {
  const locale = useLocale() as Locale;
  const tSections = useTranslations('sections');
  const [active, setActive] = useState<Set<FilterKey>>(new Set());
  const [activeSection, setActiveSection] = useState<string | null>(null);

  /**
   * Сборка списка подсекций:
   *  1) Если хоть у одного item есть field `sub` — группируем по нему
   *     (источник истины — БД, label берётся из subLabel).
   *  2) Иначе fallback — статичный `SECTIONS_BY_CATEGORY` по item.id
   *     (наш ручной маппинг из lib/menu-sections.ts).
   */
  const sections: SectionDef[] = useMemo(() => {
    const fromSub = buildFromSub(items);
    if (fromSub.length > 0) return fromSub;
    if (!categorySlug) return [];
    return activeSectionsFor(categorySlug, items).map((s) => ({
      id: s.id,
      label: tSections(s.i18nKey),
      itemIds: new Set(s.itemIds),
    }));
  }, [items, categorySlug, tSections]);

  const filtered = useMemo(() => {
    let pool = items;
    if (activeSection) {
      const sec = sections.find((s) => s.id === activeSection);
      if (sec) pool = items.filter((i) => sec.itemIds.has(i.id));
    }
    return applyFilters(pool, active);
  }, [items, active, activeSection, sections]);

  // SectionTabs ждёт MenuSection — простой адаптер.
  const tabSections = sections.map((s) => ({
    id: s.id,
    i18nKey: s.id, // не используем i18n в табе, label передаём явно
    itemIds: [...s.itemIds],
    label: s.label,
  }));

  return (
    <div>
      {sections.length > 1 && (
        <div className="mb-4">
          <SectionTabs
            sections={tabSections}
            active={activeSection}
            onChange={setActiveSection}
          />
        </div>
      )}
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
        <div className="py-16 text-center text-sm uppercase tracking-[0.2em] text-muted">—</div>
      )}
    </div>
  );
}

/** Группировка по field item.sub. Возвращает [] если ни у кого нет sub. */
function buildFromSub(items: ResolvedMenuItem[]): SectionDef[] {
  const order: string[] = [];
  const map = new Map<string, SectionDef>();
  for (const it of items) {
    if (!it.sub) continue;
    let s = map.get(it.sub);
    if (!s) {
      s = { id: it.sub, label: it.subLabel ?? it.sub, itemIds: new Set() };
      map.set(it.sub, s);
      order.push(it.sub);
    }
    s.itemIds.add(it.id);
  }
  return order.map((k) => map.get(k)!);
}
