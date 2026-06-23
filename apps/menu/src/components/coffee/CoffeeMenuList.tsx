'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { ResolvedMenuItem } from '@barviha/db';
import { pickItemName, pickSubLabel } from '@/lib/i18n-helpers';
import { searchItems } from '@/lib/search';
import type { Locale } from '@/i18n/routing';
import { activeSectionsFor } from '@/lib/menu-sections';
import { cn } from '@/lib/utils';
import { applyFilters, type FilterKey, type FilterRealm } from '../FilterBar';
import { FilterDrawer } from '../FilterDrawer';
import { coffeeAccentStyle } from '@/lib/coffee-design';
import { CoffeeItemCard } from './CoffeeItemCard';

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

export function CoffeeMenuList({ items, locationSlug, categorySlug, realm = 'kitchen' }: Props) {
  const locale = useLocale() as Locale;
  const tSections = useTranslations('sections');
  const tSearch = useTranslations('search');
  const [active, setActive] = useState<Set<FilterKey>>(new Set());
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // Стиль темы — прокидывается в портал FilterDrawer, чтобы --cm-* переменные
  // были доступны внутри Dialog (который рендерится вне .coffee-theme дерева).
  const themeStyle = coffeeAccentStyle(locationSlug);

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
    pool = applyFilters(pool, active);
    const q = query.trim();
    if (q) pool = searchItems(pool, q, pool.length).map((r) => r.item);
    return pool;
  }, [items, active, activeSection, sections, query]);

  return (
    <div>
      {/* Поиск + кнопка фильтров в одной строке */}
      <div className="mb-5 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2.5 rounded-2xl bg-[var(--cm-surface)] px-4 py-3">
          <Search className="h-[18px] w-[18px] shrink-0 text-[var(--cm-muted-dim)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tSearch('placeholder')}
            aria-label={tSearch('placeholder')}
            className="w-full bg-transparent font-[family-name:var(--font-sans)] text-[15px] text-[var(--cm-text)] placeholder:text-[var(--cm-muted-dim)] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Очистить"
              className="shrink-0 text-[var(--cm-muted-dim)] hover:text-[var(--cm-text)] transition cursor-pointer"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>
        <FilterDrawer
          active={active}
          onChange={setActive}
          realm={realm}
          themeStyle={themeStyle}
        />
      </div>

      {/* Sticky chip bar: только подсекции (фильтры переехали в drawer) */}
      {sections.length > 1 && (
        <div
          className={cn(
            'sticky top-[117px] z-[15] -mx-4 mb-4',
            'sm:-mx-6 sm:top-[121px]',
            'lg:static lg:mx-0 lg:mb-0',
          )}
        >
          <div className="border-b border-[var(--cm-border)] bg-[var(--cm-bg)]/95 backdrop-blur-md lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex gap-2 px-4 pt-2.5 pb-2 sm:px-6 lg:px-0 lg:mb-3">
                <Chip
                  label={tSections('all')}
                  on={activeSection === null}
                  onClick={() => setActiveSection(null)}
                />
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
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 sm:gap-x-7 sm:gap-y-10">
        {filtered.map((item) => (
          <CoffeeItemCard
            key={item.id}
            item={item}
            name={pickItemName(item, locale)}
            description={null}
            locationSlug={locationSlug}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <div className="mb-2 text-2xl text-[var(--cm-muted-dim)]/40">◍</div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--cm-muted-dim)]">
            {tSearch('noResults')}
          </p>
        </div>
      )}
    </div>
  );
}

function Chip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 font-[family-name:var(--font-sans)] text-[13px] transition cursor-pointer',
        on
          ? 'bg-[var(--cm-accent)] font-medium text-white'
          : 'bg-[var(--cm-surface)] text-[var(--cm-text-soft)] hover:text-[var(--cm-text)]',
      )}
    >
      {label}
    </button>
  );
}

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
