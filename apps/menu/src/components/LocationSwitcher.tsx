'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import type { Location } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import {
  getMetroColor,
  LOCATION_GROUPS,
  buildLocationTree,
  findOpenLocationPath,
  type ResolvedLocationNode,
} from '@/lib/location-theme';

interface Props {
  locations: Location[];
  currentSlug: string;
}

/** Одна и та же строка текста — и для заголовков групп/стран, и для точек: чтобы всё выглядело одним шрифтом и цветом. */
const ITEM_TEXT_CLASS = 'text-xs text-gold';

function locName(l: Location, locale: Locale): string {
  if (locale === 'en' && l.name_en) return l.name_en;
  if (locale === 'zh' && l.name_zh) return l.name_zh;
  return l.name;
}

type ResolvedNode = ResolvedLocationNode<Location>;

export function LocationSwitcher({ locations, currentSlug }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const t = useTranslations('location');
  const locale = useLocale() as Locale;

  const current = locations.find((l) => l.slug === currentSlug);
  const currentAccent = getMetroColor(currentSlug);
  // Раскрыт по умолчанию только путь до текущей локации — остальные ветки свёрнуты.
  const [openKeys, setOpenKeys] = useState<Set<string>>(
    () => new Set(findOpenLocationPath(LOCATION_GROUPS, currentSlug) ?? []),
  );
  const toggleKey = (key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const tree = useMemo(() => {
    const query = q.trim().toLowerCase().replace(/ё/g, 'е');
    const bySlug = new Map(locations.map((l) => [l.slug, l]));
    const matches = (l: Location) =>
      !query ||
      [l.name, l.name_en, l.name_zh, l.city]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().replace(/ё/g, 'е').includes(query));
    return buildLocationTree(LOCATION_GROUPS, bySlug, matches);
  }, [locations, q]);

  // Пока идёт поиск — показываем все совпадения сразу, игнорируя свёрнутость.
  const isSearching = q.trim().length > 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 sm:gap-2 rounded-full border border-gold/40 bg-gold/10 hover:bg-gold/20 hover:border-gold transition px-2 sm:px-3.5 py-1 sm:py-1.5 text-[9px] sm:text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-gold cursor-pointer shadow-[0_0_12px_rgba(196,146,98,0.18)]"
        aria-label={t('switch')}
        aria-expanded={open}
      >
        <span
          className="inline-block h-[7px] w-[7px] sm:h-2 sm:w-2 rounded-full shrink-0 opacity-70"
          style={{ background: currentAccent }}
        />
        <span className="max-w-[68px] sm:max-w-[180px] truncate">
          {current ? locName(current, locale) : t('switch')}
        </span>
        <ChevronDown size={11} className={cn('transition opacity-80 shrink-0', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 top-full mt-2 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-sm border border-gold bg-card shadow-2xl"
            >
              <div className="flex items-center gap-2 border-b border-[color:var(--border)] px-3 py-2.5">
                <Search size={14} className="text-gold/70" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t('search')}
                  className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted outline-none"
                  autoFocus
                />
                {q && (
                  <button onClick={() => setQ('')} aria-label="clear" className="text-muted hover:text-gold cursor-pointer">
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="max-h-[60vh] overflow-y-auto py-1">
                {tree.map((node) => (
                  <LocationTreeNode
                    key={node.key}
                    node={node}
                    depth={0}
                    openKeys={openKeys}
                    toggleKey={toggleKey}
                    isSearching={isSearching}
                    currentSlug={currentSlug}
                    locale={locale}
                    onNavigate={() => setOpen(false)}
                  />
                ))}
                {tree.length === 0 && (
                  <div className="px-3 py-6 text-center text-[11px] uppercase tracking-[0.2em] text-muted">—</div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function LocationTreeNode({
  node,
  depth,
  openKeys,
  toggleKey,
  isSearching,
  currentSlug,
  locale,
  onNavigate,
}: {
  node: ResolvedNode;
  depth: number;
  openKeys: Set<string>;
  toggleKey: (key: string) => void;
  isSearching: boolean;
  currentSlug: string;
  locale: Locale;
  onNavigate: () => void;
}) {
  const indentStyle = depth > 0 ? { paddingLeft: `${12 + depth * 12}px` } : undefined;

  // Не сворачиваемая ветка (одна вложенная локация/группа) — рендерим детей сразу, без заголовка.
  if (!node.collapsible) {
    if (node.locs) {
      return (
        <div>
          {node.locs.map((l) => (
            <LocationLink key={l.id} l={l} depth={depth} locale={locale} currentSlug={currentSlug} onNavigate={onNavigate} />
          ))}
        </div>
      );
    }
    return (
      <div>
        {node.children!.map((c) => (
          <LocationTreeNode
            key={c.key}
            node={c}
            depth={depth}
            openKeys={openKeys}
            toggleKey={toggleKey}
            isSearching={isSearching}
            currentSlug={currentSlug}
            locale={locale}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    );
  }

  const isOpen = isSearching || openKeys.has(node.key);
  return (
    <div>
      <button
        type="button"
        onClick={() => toggleKey(node.key)}
        style={indentStyle}
        className="flex w-full items-center justify-between gap-2 px-3 pt-2.5 pb-1 text-left cursor-pointer first:pt-1.5"
      >
        <span className={ITEM_TEXT_CLASS}>{node.label}</span>
        <ChevronDown size={15} className={cn('shrink-0 text-gold/60 transition-transform', isOpen && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {node.locs
              ? node.locs.map((l) => (
                  <LocationLink key={l.id} l={l} depth={depth + 1} locale={locale} currentSlug={currentSlug} onNavigate={onNavigate} />
                ))
              : node.children!.map((c) => (
                  <LocationTreeNode
                    key={c.key}
                    node={c}
                    depth={depth + 1}
                    openKeys={openKeys}
                    toggleKey={toggleKey}
                    isSearching={isSearching}
                    currentSlug={currentSlug}
                    locale={locale}
                    onNavigate={onNavigate}
                  />
                ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LocationLink({
  l,
  depth,
  locale,
  currentSlug,
  onNavigate,
}: {
  l: Location;
  depth: number;
  locale: Locale;
  currentSlug: string;
  onNavigate: () => void;
}) {
  const a = getMetroColor(l.slug);
  return (
    <Link
      href={`/${l.slug}`}
      onClick={onNavigate}
      style={{
        borderLeftColor: l.slug === currentSlug ? a : 'transparent',
        paddingLeft: `${12 + depth * 12}px`,
      }}
      className={cn('flex items-center gap-2.5 py-2.5 pr-3 transition hover:bg-black/30 cursor-pointer border-l-2', ITEM_TEXT_CLASS)}
    >
      <span
        className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
        style={{ background: a, boxShadow: `0 0 6px ${a}` }}
      />
      <span className="truncate flex-1">{locName(l, locale)}</span>
    </Link>
  );
}
