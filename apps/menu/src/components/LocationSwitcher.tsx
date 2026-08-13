'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import type { Location } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { getMetroColor, regionFor } from '@/lib/location-theme';

interface Props {
  locations: Location[];
  currentSlug: string;
}

function locName(l: Location, locale: Locale): string {
  if (locale === 'en' && l.name_en) return l.name_en;
  if (locale === 'zh' && l.name_zh) return l.name_zh;
  return l.name;
}

export function LocationSwitcher({ locations, currentSlug }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const t = useTranslations('location');
  const locale = useLocale() as Locale;

  const current = locations.find((l) => l.slug === currentSlug);
  const currentAccent = getMetroColor(currentSlug);
  // Раскрыта по умолчанию только группа текущей локации — остальные свёрнуты.
  const [openRegions, setOpenRegions] = useState<Set<string>>(() => new Set([regionFor(current?.city ?? 'Москва')]));
  const toggleRegion = (region: string) => {
    setOpenRegions((prev) => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });
  };

  const groups = useMemo(() => {
    const query = q.trim().toLowerCase().replace(/ё/g, 'е');
    const list = query
      ? locations.filter((l) =>
          [l.name, l.name_en, l.name_zh, l.city]
            .filter(Boolean)
            .some((s) => s!.toLowerCase().replace(/ё/g, 'е').includes(query)),
        )
      : locations;
    const filtered = [...list].sort((a, b) => locName(a, locale).localeCompare(locName(b, locale)));

    const byRegion = new Map<string, Location[]>();
    for (const l of filtered) {
      const region = regionFor(l.city ?? '');
      if (!byRegion.has(region)) byRegion.set(region, []);
      byRegion.get(region)!.push(l);
    }
    // Москва — самая крупная группа, показываем первой; «Приближённые города
    // к Москве» — сразу за ней; остальные — по алфавиту.
    return [...byRegion.entries()].sort(([a], [b]) => {
      if (a === 'Москва') return -1;
      if (b === 'Москва') return 1;
      if (a === 'Приближённые города к Москве') return -1;
      if (b === 'Приближённые города к Москве') return 1;
      return a.localeCompare(b, 'ru');
    });
  }, [locations, q, locale]);

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
                {groups.map(([region, locs]) => {
                  const isOpen = isSearching || openRegions.has(region);
                  return (
                    <div key={region}>
                      <button
                        type="button"
                        onClick={() => toggleRegion(region)}
                        className="flex w-full items-center justify-between gap-2 px-3 pt-2.5 pb-1 text-left cursor-pointer first:pt-1.5"
                      >
                        <span className="text-[10px] uppercase tracking-[0.18em] text-muted/70">{region}</span>
                        <ChevronDown
                          size={12}
                          className={cn('shrink-0 text-muted/60 transition-transform', isOpen && 'rotate-180')}
                        />
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
                            {locs.map((l) => {
                              const a = getMetroColor(l.slug);
                              return (
                                <Link
                                  key={l.id}
                                  href={`/${l.slug}`}
                                  onClick={() => setOpen(false)}
                                  className={cn(
                                    'flex items-center gap-2.5 px-3 py-2.5 text-xs transition hover:bg-black/30 cursor-pointer border-l-2',
                                    l.slug === currentSlug ? 'text-gold' : 'text-foreground',
                                  )}
                                  style={{ borderLeftColor: l.slug === currentSlug ? a : 'transparent' }}
                                >
                                  <span
                                    className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                                    style={{ background: a, boxShadow: `0 0 6px ${a}` }}
                                  />
                                  <span className="truncate flex-1">{locName(l, locale)}</span>
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
                {groups.length === 0 && (
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
