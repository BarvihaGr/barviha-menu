'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import type { Location } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { getMetroColor, LOCATION_GROUPS } from '@/lib/location-theme';

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
  const [openRegions, setOpenRegions] = useState<Set<string>>(() => {
    const g = LOCATION_GROUPS.find((g) => g.collapsible && g.slugs.includes(currentSlug));
    return new Set(g ? [g.label] : []);
  });
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
    const bySlug = new Map(locations.map((l) => [l.slug, l]));
    // Порядок групп и локаций внутри — фиксированный, см. LOCATION_GROUPS.
    return LOCATION_GROUPS.map((g) => ({
      label: g.label,
      collapsible: g.collapsible,
      locs: g.slugs
        .map((slug) => bySlug.get(slug))
        .filter((l): l is Location => Boolean(l))
        .filter(
          (l) =>
            !query ||
            [l.name, l.name_en, l.name_zh, l.city]
              .filter(Boolean)
              .some((s) => s!.toLowerCase().replace(/ё/g, 'е').includes(query)),
        ),
    })).filter((g) => g.locs.length > 0);
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
                {groups.map((g) => {
                  if (!g.collapsible) {
                    return (
                      <div key={g.label}>
                        {g.locs.map((l) => (
                          <LocationLink key={l.id} l={l} locale={locale} currentSlug={currentSlug} onNavigate={() => setOpen(false)} />
                        ))}
                      </div>
                    );
                  }
                  const isOpen = isSearching || openRegions.has(g.label);
                  return (
                    <div key={g.label}>
                      <button
                        type="button"
                        onClick={() => toggleRegion(g.label)}
                        className="flex w-full items-center justify-between gap-2 px-3 pt-2.5 pb-1 text-left cursor-pointer first:pt-1.5"
                      >
                        <span className="text-[12px] font-medium uppercase tracking-[0.12em] text-gold/75">{g.label}</span>
                        <ChevronDown
                          size={15}
                          className={cn('shrink-0 text-gold/60 transition-transform', isOpen && 'rotate-180')}
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
                            {g.locs.map((l) => (
                              <LocationLink key={l.id} l={l} locale={locale} currentSlug={currentSlug} onNavigate={() => setOpen(false)} />
                            ))}
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

function LocationLink({
  l,
  locale,
  currentSlug,
  onNavigate,
}: {
  l: Location;
  locale: Locale;
  currentSlug: string;
  onNavigate: () => void;
}) {
  const a = getMetroColor(l.slug);
  return (
    <Link
      href={`/${l.slug}`}
      onClick={onNavigate}
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
}
