'use client';

import { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X, Search, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import type { Location } from '@barviha/db';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { getMetroColor } from '@/lib/location-theme';
import { useKievTheme } from '@/store/kievTheme';
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
  /** 'dark' — тёмный Барвиха; 'coffee' — светлый Coffeemania */
  variant?: 'dark' | 'coffee';
  /**
   * Для coffee-варианта: инлайн-стили с --cm-* переменными.
   * Нужны, потому что панель рендерится через Radix Portal вне .coffee-theme.
   */
  themeStyle?: React.CSSProperties;
  /** Показывать переключатель палитры (только Киевская) */
  showPalettePicker?: boolean;
}

const PALETTE_OPTIONS = [
  { id: 'ivory' as const, label: 'Слоновая кость', swatch: '#F2EAE0', swatchBorder: '#D4C4A8' },
  { id: 'arka'  as const, label: 'Арка',           swatch: '#6B5242', swatchBorder: '#8C7464' },
];

export function HamburgerMenu({ locationSlug, locations, variant = 'dark', themeStyle, showPalettePicker }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const tLoc = useTranslations('location');

  const kievVariant = useKievTheme((s) => s.variant);
  const setKievVariant = useKievTheme((s) => s.setVariant);

  // Панель адаптируется: если выбрана Арка — тёмные токены
  const isDark = variant === 'dark' || (showPalettePicker === true && kievVariant === 'arka');

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

  const close = () => { setOpen(false); setQ(''); };

  // ── Дизайн-токены по варианту ──
  const D = isDark ? {
    panel:      'bg-[#1A0F07] border-l border-gold/15',
    title:      'text-cream/50 tracking-[0.28em]',
    closeBtn:   'text-muted hover:text-cream hover:bg-white/6',
    divider:    'border-white/8',
    label:      'text-[10px] uppercase tracking-[0.22em] text-muted/55 mb-2.5',
    langOn:     'border-gold text-gold bg-gold/12',
    langOff:    'border-white/12 text-muted hover:border-gold/45 hover:text-cream/80',
    search:     'bg-white/5 border-white/10 focus-within:border-gold/40 text-foreground placeholder:text-muted/50',
    searchIcon: 'text-muted/50',
    itemText:   'text-foreground/75 hover:bg-white/5',
    itemActive: 'text-gold',
    trigger:    'border-gold/35 text-gold/80 hover:border-gold hover:text-gold hover:bg-gold/8',
  } : {
    panel:      'bg-white border-l border-[#e8e5e0]',
    title:      'text-[#999690] tracking-[0.28em]',
    closeBtn:   'text-[#aaa] hover:text-[#333] hover:bg-black/5',
    divider:    'border-[#efefed]',
    label:      'text-[10px] uppercase tracking-[0.22em] text-[#b0ada8] mb-2.5',
    langOn:     'border-[var(--cm-accent,#c49262)] text-[var(--cm-accent,#c49262)] bg-[var(--cm-accent,#c49262)]/10',
    langOff:    'border-[#dedad5] text-[#888] hover:border-[var(--cm-accent,#c49262)]/50 hover:text-[#333]',
    search:     'bg-[#f5f4f1] border-[#e8e5e0] focus-within:border-[var(--cm-accent,#c49262)]/40 text-[#333] placeholder:text-[#b0ada8]',
    searchIcon: 'text-[#b0ada8]',
    itemText:   'text-[#333] hover:bg-[#f5f4f1]',
    itemActive: 'text-[var(--cm-accent,#c49262)]',
    trigger:    'border-[#dedad5] text-[#888] hover:border-[var(--cm-accent,#c49262)]/50 hover:text-[#333]',
  };

  const triggerCls = cn(
    'flex h-9 w-9 items-center justify-center rounded-full border transition cursor-pointer',
    D.trigger,
  );

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQ(''); }}>
      <Dialog.Trigger asChild>
        <button type="button" aria-label="Меню" className={triggerCls}>
          <Menu size={18} strokeWidth={1.8} />
        </button>
      </Dialog.Trigger>

      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Затемнение */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]"
              />
            </Dialog.Overlay>

            {/* Панель справа */}
            <Dialog.Content
              asChild
              aria-describedby={undefined}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 340, damping: 34 }}
                className={cn(
                  'fixed right-0 top-0 bottom-0 z-[70] flex w-[min(300px,85vw)] flex-col shadow-2xl',
                  D.panel,
                )}
                style={{
                  paddingBottom: 'env(safe-area-inset-bottom)',
                  ...(themeStyle ?? {}),
                }}
              >
                {/* Шапка */}
                <div className={cn('flex items-center justify-end px-5 pt-5 pb-4 border-b shrink-0', D.divider)}>
                  <Dialog.Title className="sr-only">Навигация</Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Закрыть"
                      className={cn('flex h-8 w-8 items-center justify-center rounded-full transition cursor-pointer', D.closeBtn)}
                    >
                      <X size={17} />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Скроллируемое тело */}
                <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">

                  {/* ── Язык ── */}
                  <div className="px-5 pt-5 pb-4 shrink-0">
                    <p className={D.label}>Язык</p>
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
                              active ? D.langOn : D.langOff,
                            )}
                          >
                            {active && <Check size={11} strokeWidth={2.5} />}
                            {LANG_LABEL[l]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className={cn('mx-5 border-t shrink-0', D.divider)} />


                  {/* ── Локация ── */}
                  <div className="flex flex-col min-h-0 flex-1 px-5 pt-4 pb-3">
                    <p className={cn(D.label, 'shrink-0')}>Локация</p>

                    {/* Поиск */}
                    <div className={cn('flex items-center gap-2 rounded-xl border px-3 py-2 mb-3 shrink-0', D.search)}>
                      <Search size={13} className={cn('shrink-0', D.searchIcon)} />
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder={tLoc('search')}
                        className="flex-1 bg-transparent text-[13px] outline-none"
                        autoComplete="off"
                      />
                      {q && (
                        <button onClick={() => setQ('')} className="opacity-50 hover:opacity-80 cursor-pointer shrink-0">
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {/* Список локаций */}
                    <div className="overflow-y-auto flex-1 -mx-1">
                      {filtered.map((l) => {
                        const active = l.slug === locationSlug;
                        const accent = getMetroColor(l.slug);
                        return (
                          <Link
                            key={l.id}
                            href={`/${l.slug}`}
                            onClick={close}
                            className={cn(
                              'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] transition cursor-pointer border-l-2',
                              D.itemText,
                              active && D.itemActive,
                            )}
                            style={{ borderLeftColor: active ? accent : 'transparent' }}
                          >
                            <span className="flex-1 truncate leading-tight">
                              {locName(l, locale)}
                            </span>
                            {l.city && l.city !== locName(l, locale) && (
                              <span className="shrink-0 text-[11px] opacity-40">{l.city}</span>
                            )}
                          </Link>
                        );
                      })}
                      {filtered.length === 0 && (
                        <div className="py-8 text-center text-[12px] opacity-30 uppercase tracking-[0.2em]">—</div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
