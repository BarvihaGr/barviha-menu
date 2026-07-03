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
import { cn } from '@/lib/utils';
import { ItemCard } from './ItemCard';
import { applyFilters, type FilterKey, type FilterRealm } from './FilterBar';
import { FilterDrawer } from './FilterDrawer';

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
  const [searchOpen, setSearchOpen] = useState(false);

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

  const isFiltering = active.size > 0 || query.trim().length > 0;
  const hasSections = sections.length > 1;
  const searchActive = searchOpen || !!query.trim();

  const toggleSearch = () => {
    if (searchOpen) {
      setSearchOpen(false);
      setQuery('');
    } else {
      setSearchOpen(true);
    }
  };

  return (
    <div className="flex flex-col gap-3">

      {/* ── Строка поиска — появляется по тапу на иконку ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="relative flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2.5 focus-within:border-border-strong transition-colors duration-200">
              <Search size={14} className="shrink-0 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tSearch('placeholder')}
                className="flex-1 min-w-0 bg-transparent text-[13px] text-foreground placeholder:text-muted outline-none"
                aria-label={tSearch('placeholder')}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="shrink-0 text-muted hover:text-foreground transition cursor-pointer"
                  aria-label="clear"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── [🔍] [≡] | [пилюля] [пилюля] ... — всё в одну строку ── */}
      <div className="-mx-4 sm:mx-0 flex items-center">

        {/* Фиксированные иконки слева */}
        <div className="flex shrink-0 items-center pl-4 sm:pl-0">
          <button
            type="button"
            onClick={toggleSearch}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition cursor-pointer',
              searchActive ? 'text-foreground' : 'text-muted hover:text-foreground',
            )}
            aria-label={searchOpen ? 'close search' : 'open search'}
          >
            {searchActive
              ? <X size={16} strokeWidth={2} />
              : <Search size={16} strokeWidth={2} />
            }
          </button>
          {showFilters && (
            <FilterDrawer iconOnly active={active} onChange={setActive} realm={realm} />
          )}
        </div>

        {/* Тонкий разделитель */}
        {hasSections && <div className="mx-2 h-4 w-px shrink-0 bg-border" />}

        {/* Прокручиваемые пилюли подсекций */}
        {hasSections && (
          <div className="overflow-x-auto no-scrollbar flex-1">
            <div className="flex gap-2 pr-4 sm:pr-0">
              {sections.map((s) => (
                <PillTab
                  key={s.id}
                  label={s.label}
                  on={activeSection === s.id}
                  onClick={() => setActiveSection(s.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Сетка блюд ── */}
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

function PillTab({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer',
        on
          ? 'border border-foreground text-foreground'
          : 'text-muted hover:text-foreground',
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
