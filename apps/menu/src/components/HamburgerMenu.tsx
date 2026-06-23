'use client';

import { useMemo, useState } from 'react';
import { Menu, X, Search, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import type { Location } from '@barviha/db';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { getMetroColor } from '@/lib/location-theme';
import { cn } from '@/lib/utils';

const LANG_LABEL: Record<Locale, string> = {
  ru: 'RU',
  en: 'EN',
  zh: '中',
  hy: 'ՀԱ',
};

function locName(l: Location, locale: Locale): string {
  if (locale === 'en' && l.name_en) return l.name_en;
  if (locale === 'zh' && l.name_zh) return l.name_zh;
  return l.name;
}

interface Props {
  locationSlug: string;
  locations: Location[];
  /** 'dark' — для тёмного дизайна Барвихи; 'coffee' — для светлого Coffeemania */
  variant?: 'dark' | 'coffee';
}

export function HamburgerMenu({ locationSlug, locations, variant = 'dark' }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const tLoc = useTranslations('location');

  const isDark = variant === 'dark';

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase().replace(/ё/g, 'е');
    return [...locations]
      .filter((l) =>
        !query ||
        [l.name, l.name_en, l.name_zh, l.city]
          .filter(Boolean)
          .some((s) => s!.toLowerCase().replace(/ё/g, 'е').includes(query)),
      )
      .sort((a, b) => locName(a, locale).localeCompare(locName(b, locale), 'ru'));
  }, [locations, q, locale]);

  const switchLang = (next: Locale) => {
    setOpen(false);
    if (next !== locale) router.replace(pathname, { locale: next });
  };

  // ── Токены по варианту ──
  const panelBg    = isDark ? 'bg-[#1A0F07]'                   : 'bg-[var(--cm-surface-2)]';
  const panelBorder = isDark ? 'border-l border-gold/15'         : 'border-l border-[var(--cm-border)]';
  const titleColor = isDark ? 'text-cream/70 tracking-[0.25em]' : 'text-[var(--cm-muted-dim)] tracking-[0.2em]';
  const closeColor = isDark ? 'text-muted hover:text-cream'      : 'text-[var(--cm-muted-dim)] hover:text-[var(--cm-text)]';
  const sectionLabel = isDark ? 'text-[10px] uppercase tracking-[0.22em] text-muted/60 mb-2.5' : 'text-[10px] uppercase tracking-[0.22em] text-[var(--cm-muted-dim)] mb-2.5';
  const dividerColor = isDark ? 'border-white/6'                 : 'border-[var(--cm-border)]';
  const searchBg   = isDark ? 'bg-white/5 border-white/10 focus-within:border-gold/40 text-foreground placeholder:text-muted/50' : 'bg-[var(--cm-surface)] border-[var(--cm-border)] focus-within:border-[var(--cm-accent)]/40 text-[var(--cm-text)] placeholder:text-[var(--cm-muted-dim)]';
  const itemHover  = isDark ? 'hover:bg-white/5'                 : 'hover:bg-[var(--cm-surface)]';
  const itemText   = isDark ? 'text-foreground/80'               : 'text-[var(--cm-text)]';
  const accentColor = isDark ? 'text-gold'                       : 'text-[var(--cm-accent)]';
  const activeBorder = isDark ? 'border-gold'                    : 'border-[var(--cm-accent)]';
  const triggerCls = isDark
    ? 'flex h-9 w-9 items-center justify-center rounded-full border border-gold/35 text-gold/80 transition hover:border-gold hover:text-gold hover:bg-gold/8 cursor-pointer'
    : 'flex h-9 w-9 items-center justify-center rounded-full border border-[var(--cm-border)] text-[var(--cm-muted)] transition hover:border-[var(--cm-accent)]/50 hover:text-[var(--cm-text)] cursor-pointer';

  return (
    <div className="relative">
      {/* ── Кнопка ≡ ── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Меню"
        aria-expanded={open}
        className={triggerCls}
      >
        <Menu size={18} strokeWidth={1.8} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Затемнение */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
              onClick={() => { setOpen(false); setQ(''); }}
            />

            {/* Панель справа */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className={cn(
                'fixed right-0 top-0 bottom-0 z-50 flex w-[min(300px,85vw)] flex-col',
                panelBg, panelBorder,
              )}
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {/* Шапка панели */}
              <div className={cn('flex items-center justify-between px-5 pt-5 pb-4', `border-b ${dividerColor}`)}>
                <span className={cn('text-[10px] font-semibold uppercase', titleColor)}>
                  МЕНЮ
                </span>
                <button
                  type="button"
                  onClick={() => { setOpen(false); setQ(''); }}
                  aria-label="Закрыть"
                  className={cn('flex h-8 w-8 items-center justify-center rounded-full transition cursor-pointer', closeColor)}
                >
                  <X size={17} />
                </button>
              </div>

              {/* Контент */}
              <div className="flex flex-col gap-0 overflow-y-auto flex-1">

                {/* ── Язык ── */}
                <div className="px-5 pt-5 pb-4">
                  <p className={sectionLabel}>Язык</p>
                  <div className="flex gap-2 flex-wrap">
                    {routing.locales.map((l) => {
                      const active = l === locale;
                      return (
                        <button
                          key={l}
                          type="button"
                          onClick={() => switchLang(l)}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition cursor-pointer',
                            active
                              ? cn('border-current', accentColor, isDark ? 'bg-gold/12' : 'bg-[var(--cm-accent)]/10')
                              : cn(isDark ? 'border-white/12 text-muted hover:border-gold/40 hover:text-cream/80' : 'border-[var(--cm-border)] text-[var(--cm-muted-dim)] hover:border-[var(--cm-accent)]/40 hover:text-[var(--cm-text)]'),
                          )}
                        >
                          {active && <Check size={11} strokeWidth={2.5} />}
                          {LANG_LABEL[l]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={cn('mx-5 border-t', dividerColor)} />

                {/* ── Локация ── */}
                <div className="flex flex-col min-h-0 flex-1 px-5 pt-4 pb-3">
                  <p className={sectionLabel}>Локация</p>

                  {/* Поиск */}
                  <div className={cn('flex items-center gap-2 rounded-xl border px-3 py-2 mb-3', searchBg)}>
                    <Search size={13} className="shrink-0 opacity-50" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder={tLoc('search')}
                      className="flex-1 bg-transparent text-[13px] outline-none"
                      autoComplete="off"
                    />
                    {q && (
                      <button onClick={() => setQ('')} className="opacity-50 hover:opacity-80 cursor-pointer">
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  {/* Список */}
                  <div className="overflow-y-auto flex-1 -mx-1">
                    {filtered.map((l) => {
                      const accent = getMetroColor(l.slug);
                      const active = l.slug === locationSlug;
                      return (
                        <Link
                          key={l.id}
                          href={`/${l.slug}`}
                          onClick={() => { setOpen(false); setQ(''); }}
                          className={cn(
                            'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] transition cursor-pointer border-l-2',
                            itemHover,
                            active ? accentColor : itemText,
                          )}
                          style={{ borderLeftColor: active ? accent : 'transparent' }}
                        >
                          <span
                            className="inline-block h-2 w-2 shrink-0 rounded-full"
                            style={{ background: accent, boxShadow: active ? `0 0 6px ${accent}` : 'none' }}
                          />
                          <span className="flex-1 truncate leading-tight">
                            {locName(l, locale)}
                          </span>
                          {l.city && l.city !== locName(l, locale) && (
                            <span className="shrink-0 text-[11px] opacity-50">{l.city}</span>
                          )}
                        </Link>
                      );
                    })}
                    {filtered.length === 0 && (
                      <div className="py-8 text-center text-[12px] opacity-40 uppercase tracking-[0.2em]">—</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
