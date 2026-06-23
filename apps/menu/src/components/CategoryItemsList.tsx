'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ResolvedMenuItem } from '@barviha/db';
import { pickItemName, pickSubLabel } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/routing';
import { activeSectionsFor } from '@/lib/menu-sections';
import { searchItems } from '@/lib/search';
import { ItemCard } from './ItemCard';
import { applyFilters, type FilterKey, type FilterRealm } from './FilterBar';
import { FilterDrawer } from './FilterDrawer';
import { SectionTabs } from './SectionTabs';

interface Props {
  items: ResolvedMenuItem[];
  locationSlug: string;
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
  const tSearch = useTranslations('search');
  const tFilters = useTranslations('filters');

  const [active, setActive] = useState<Set<FilterKey>>(new Set());
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [query, setQuery] = useState('');

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
    // 1. Подсекция (Салаты / Закуски / …)
    let pool = items;
    if (activeSection) {
      const sec = sections.find((s) => s.id === activeSection);
      if (sec) pool = items.filter((i) => sec.itemIds.has(i.id));
    }
    // 2. Свойства блюда (Острое / Веган / Без мяса)
    pool = applyFilters(pool, active);
    // 3. Текстовый поиск (по названию, описанию, составу + синонимы)
    const q = query.trim();
    if (q) pool = searchItems(pool, q, pool.length).map((r) => r.item);
    return pool;
  }, [items, active, activeSection, sections, query]);

  const tabSections = sections.map((s) => ({
    id: s.id,
    i18nKey: s.id,
    itemIds: [...s.itemIds],
    label: s.label,
  }));

  const isFiltering = active.size > 0 || query.trim().length > 0;

  return (
    <div className="flex flex-col gap-4">

      {/* ── Поиск + кнопка фильтров в одной строке ── */}
      <div className="flex items-center gap-2">
        <div className="relative flex flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 focus-within:border-gold/50 transition-colors duration-200">
          <Search size={14} className="shrink-0 text-gold/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tSearch('placeholder')}
            className="flex-1 min-w-0 bg-transparent text-[13px] text-foreground placeholder:text-muted/60 outline-none"
            aria-label={tSearch('placeholder')}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="shrink-0 text-muted hover:text-gold transition cursor-pointer"
              aria-label="clear"
            >
              <X size={14} />
            </button>
          )}
        </div>
        {showFilters && (
          <FilterDrawer active={active} onChange={setActive} realm={realm} />
        )}
      </div>

      {/* ── Подсекции (Салаты / Закуски / Супы / …) ── */}
      {sections.length > 1 && (
        <SectionTabs
          sections={tabSections}
          active={activeSection}
          onChange={setActiveSection}
        />
      )}

      {/* ── Сетка блюд с плавным enter/exit ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              className="h-full"
              initial={{ opacity: 0, scale: 0.93, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.14, ease: 'easeIn' } }}
              transition={{
                duration: 0.24,
                ease: [0.25, 0.1, 0.25, 1],
                delay: Math.min(i * 0.028, 0.24),
              }}
            >
              <ItemCard
                item={item}
                name={pickItemName(item, locale)}
                locationSlug={locationSlug}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Пустое состояние ── */}
      <AnimatePresence>
        {filtered.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="py-16 text-center"
          >
            <div className="mb-2 text-2xl text-muted/30">◈</div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted">
              {isFiltering ? tFilters('emptyFilters') : '—'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
