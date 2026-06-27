'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
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
import { useKievTheme } from '@/store/kievTheme';
import { KIEV_PALETTES } from './KievThemeProvider';
import { CoffeeItemCard } from './CoffeeItemCard';

interface SectionDef {
  id: string;
  label: string;
  items: ResolvedMenuItem[];
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

  const chipBarRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const kievVariant = useKievTheme((s) => s.variant);
  const themeStyle = locationSlug === 'kievskaia'
    ? { ...coffeeAccentStyle(locationSlug), ...(KIEV_PALETTES[kievVariant] as React.CSSProperties) }
    : coffeeAccentStyle(locationSlug);

  // ── Фильтрованный пул (без секций) ────────────────────────────────
  const filteredPool = useMemo(() => {
    let pool = applyFilters(items, active);
    const q = query.trim();
    if (q) pool = searchItems(pool, q, pool.length).map((r) => r.item);
    return pool;
  }, [items, active, query]);

  // ── Секции из sub-поля или из статичной карты ──────────────────────
  const sections: SectionDef[] = useMemo(() => {
    const fromSub = buildFromSub(filteredPool, locale);
    if (fromSub.length > 0) return fromSub;
    if (!categorySlug) return [{ id: '__all', label: '', items: filteredPool }];
    const defs = activeSectionsFor(categorySlug, filteredPool);
    if (defs.length === 0) return [{ id: '__all', label: '', items: filteredPool }];
    const idSet = (ids: readonly string[]) => new Set(ids);
    return defs.map((s) => ({
      id: s.id,
      label: tSections(s.i18nKey),
      items: filteredPool.filter((i) => idSet(s.itemIds).has(i.id)),
    }));
  }, [filteredPool, categorySlug, tSections, locale]);

  const hasMultipleSections = sections.length > 1 && sections[0]?.id !== '__all';

  // ── Scroll spy ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasMultipleSections) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Берём секцию с наибольшим пересечением, которая входит в зону
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (e.isIntersecting) {
            if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
          }
        }
        if (best) setActiveSection(best.target.id);
      },
      { rootMargin: '-10% 0px -60% 0px', threshold: [0, 0.1, 0.5] },
    );

    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [hasMultipleSections, sections]);

  // ── Автоскролл активного чипа в видимую зону ──────────────────────
  useEffect(() => {
    if (!activeSection || !chipBarRef.current) return;
    const chip = chipBarRef.current.querySelector<HTMLElement>(`[data-sec="${activeSection}"]`);
    chip?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeSection]);

  // ── Тап по чипу — прыжок к секции ────────────────────────────────
  const jumpTo = (id: string) => {
    const el = sectionRefs.current.get(id);
    if (!el) return;
    const headerH = 120;
    const top = el.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const isEmpty = sections.every((s) => s.items.length === 0);

  return (
    <div>
      {/* ── Поиск + фильтры ── */}
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
            <button type="button" onClick={() => setQuery('')} aria-label="Очистить"
              className="shrink-0 text-[var(--cm-muted-dim)] hover:text-[var(--cm-text)] transition cursor-pointer">
              <X className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>
        <FilterDrawer active={active} onChange={setActive} realm={realm} themeStyle={themeStyle} />
      </div>

      {/* ── Scroll-spy чипы ── */}
      {hasMultipleSections && (
        <div className="sticky top-[117px] z-[15] -mx-4 mb-5 sm:-mx-6 sm:top-[121px]">
          <div
            ref={chipBarRef}
            className="overflow-x-auto no-scrollbar border-b border-[var(--cm-border)] bg-[var(--cm-bg)]/96 backdrop-blur-md"
          >
            <div className="flex gap-2 px-4 pt-2.5 pb-2.5 sm:px-6">
              {sections.map((s) => (
                <button
                  key={s.id}
                  data-sec={s.id}
                  type="button"
                  onClick={() => jumpTo(s.id)}
                  className={cn(
                    'shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 font-[family-name:var(--font-sans)] text-[13px] transition-all duration-200 cursor-pointer',
                    activeSection === s.id
                      ? 'bg-[var(--cm-accent)] font-semibold text-white shadow-sm'
                      : 'bg-[var(--cm-surface)] text-[var(--cm-text-soft)] hover:text-[var(--cm-text)]',
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Секции (непрерывный скролл) ── */}
      {isEmpty ? (
        <div className="py-16 text-center">
          <div className="mb-2 text-2xl text-[var(--cm-muted-dim)]/40">◍</div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--cm-muted-dim)]">
            {tSearch('noResults')}
          </p>
        </div>
      ) : (
        sections.map((s) => (
          s.items.length > 0 && (
            <div
              key={s.id}
              id={s.id}
              ref={(el) => {
                if (el) sectionRefs.current.set(s.id, el);
                else sectionRefs.current.delete(s.id);
              }}
              className="mb-8"
            >
              {/* Заголовок секции */}
              {hasMultipleSections && s.label && (
                <h2 className="mb-4 font-[family-name:var(--font-display)] text-[20px] font-light tracking-[0.05em] text-[var(--cm-text)] opacity-85">
                  {s.label}
                </h2>
              )}

              {/* Сетка карточек */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-8">
                {s.items.map((item) => (
                  <CoffeeItemCard
                    key={item.id}
                    item={item}
                    name={pickItemName(item, locale)}
                    description={null}
                    locationSlug={locationSlug}
                  />
                ))}
              </div>
            </div>
          )
        ))
      )}
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
      s = { id: it.sub, label, items: [] };
      map.set(it.sub, s);
      order.push(it.sub);
    }
    s.items.push(it);
  }
  return order.map((k) => map.get(k)!);
}
