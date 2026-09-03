'use client';

import { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Menu, X, Search, Check, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import type { Location } from '@barviha/db';
import { TEMPLATE_SLUGS } from '@barviha/db/onboarding';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import {
  getMetroColor,
  pickSwitcherName,
  LOCATION_GROUPS,
  buildLocationTree,
  findOpenLocationPath,
  type ResolvedLocationNode,
} from '@/lib/location-theme';
import { useKievTheme } from '@/store/kievTheme';
import { cn } from '@/lib/utils';

const LANG_LABEL: Record<Locale, string> = {
  ru: 'RU',
  en: 'EN',
  zh: '中',
  hy: 'ՀԱ',
};

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

// label берётся из messages (palette.*) — раньше названия палитры Киевской
// были захардкожены по-русски и такими и показывались на en/zh/hy.
const PALETTE_OPTIONS = [
  { id: 'ivory' as const, i18nKey: 'ivory', swatch: '#F2EAE0', swatchBorder: '#D4C4A8' },
  { id: 'arka'  as const, i18nKey: 'arka', swatch: '#6B5242', swatchBorder: '#8C7464' },
];

export function HamburgerMenu({ locationSlug, locations, variant = 'dark', themeStyle, showPalettePicker }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  // Раскрыта по умолчанию только группа текущей локации — остальные свёрнуты,
  // список локаций длинный (30+), сворачивание держит панель компактной.
  const [openKeys, setOpenKeys] = useState<Set<string>>(
    () => new Set(findOpenLocationPath(LOCATION_GROUPS, locationSlug) ?? []),
  );
  const toggleKey = (key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const tLoc = useTranslations('location');
  const tLang = useTranslations('lang');
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  const kievVariant = useKievTheme((s) => s.variant);
  const setKievVariant = useKievTheme((s) => s.setVariant);

  // Панель адаптируется: если выбрана Арка — тёмные токены
  const isDark = variant === 'dark' || (showPalettePicker === true && kievVariant === 'arka');

  const tree = useMemo(() => {
    const query = q.trim().toLowerCase().replace(/ё/g, 'е');
    const bySlug = new Map(locations.map((l) => [l.slug, l]));
    // Тест лок (Арка/Киевская — эталоны дизайна) не показываем покупателю —
    // они доступны только по прямой ссылке, для внутреннего использования.
    const matches = (l: Location) =>
      !(TEMPLATE_SLUGS as readonly string[]).includes(l.slug) &&
      (!query ||
        [l.name, l.name_en, l.name_zh, l.name_hy, l.city]
          .filter(Boolean)
          .some((s) => s!.toLowerCase().replace(/ё/g, 'е').includes(query)));
    return buildLocationTree(LOCATION_GROUPS, bySlug, matches, locale);
  }, [locations, q, locale]);

  // Пока идёт поиск — показываем все совпадения сразу, игнорируя свёрнутость
  // (пользователь ищет конкретное место, ему не нужно сначала разворачивать группу).
  const isSearching = q.trim().length > 0;

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
    // Заголовки групп и обычные пункты локаций — один и тот же цвет/шрифт (text-[13px] text-gold),
    // чтобы список не выглядел разнородным (раньше группы были золотом+капс, пункты — чёрным).
    groupLabel: 'text-[13px] text-gold',
    groupChevron: 'text-gold/60',
    langOn:     'border-gold text-gold bg-gold/12',
    langOff:    'border-white/12 text-muted hover:border-gold/45 hover:text-cream/80',
    search:     'bg-white/5 border-white/10 focus-within:border-gold/40 text-foreground placeholder:text-muted/50',
    searchIcon: 'text-muted/50',
    itemText:   'text-[13px] text-gold hover:bg-white/5',
    trigger:    'border-gold/35 text-gold/80 hover:border-gold hover:text-gold hover:bg-gold/8',
  } : {
    panel:      'bg-white border-l border-[#e8e5e0]',
    title:      'text-[#999690] tracking-[0.28em]',
    closeBtn:   'text-[#aaa] hover:text-[#333] hover:bg-black/5',
    divider:    'border-[#efefed]',
    label:      'text-[10px] uppercase tracking-[0.22em] text-[#b0ada8] mb-2.5',
    groupLabel: 'text-[13px] text-[var(--cm-accent,#c49262)]',
    groupChevron: 'text-[var(--cm-accent,#c49262)]/70',
    langOn:     'border-[var(--cm-accent,#c49262)] text-[var(--cm-accent,#c49262)] bg-[var(--cm-accent,#c49262)]/10',
    langOff:    'border-[#dedad5] text-[#888] hover:border-[var(--cm-accent,#c49262)]/50 hover:text-[#333]',
    search:     'bg-[#f5f4f1] border-[#e8e5e0] focus-within:border-[var(--cm-accent,#c49262)]/40 text-[#333] placeholder:text-[#b0ada8]',
    searchIcon: 'text-[#b0ada8]',
    itemText:   'text-[13px] text-[var(--cm-accent,#c49262)] hover:bg-[#f5f4f1]',
    trigger:    'border-[#dedad5] text-[#888] hover:border-[var(--cm-accent,#c49262)]/50 hover:text-[#333]',
  };

  const triggerCls = cn(
    'flex h-9 w-9 items-center justify-center rounded-full border transition cursor-pointer',
    D.trigger,
  );

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQ(''); }}>
      <Dialog.Trigger asChild>
        <button type="button" aria-label={tNav('menu')} className={triggerCls}>
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
                {/* Крестик — абсолютный, без отдельной полосы */}
                <Dialog.Title className="sr-only">{tCommon('navigation')}</Dialog.Title>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label={tCommon('close')}
                    className={cn('absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full transition cursor-pointer z-10', D.closeBtn)}
                  >
                    <X size={17} />
                  </button>
                </Dialog.Close>

                {/* Скроллируемое тело */}
                <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">

                  {/* ── Язык ── */}
                  <div className="px-5 pt-5 pb-4 shrink-0">
                    <p className={D.label}>{tLang('label')}</p>
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
                    <p className={cn(D.label, 'shrink-0')}>{tLoc('sectionLabel')}</p>

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

                    {/* Список локаций, сгруппированный по городам — группы с несколькими
                        локациями сворачиваются, группы из одной локации идут сразу списком. */}
                    <div className="overflow-y-auto flex-1 -mx-1">
                      {tree.map((node) => (
                        <LocationTreeRow
                          key={node.key}
                          node={node}
                          depth={0}
                          openKeys={openKeys}
                          toggleKey={toggleKey}
                          isSearching={isSearching}
                          locale={locale}
                          locationSlug={locationSlug}
                          D={D}
                          close={close}
                        />
                      ))}

                      {tree.length === 0 && (
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

function LocationTreeRow({
  node,
  depth,
  openKeys,
  toggleKey,
  isSearching,
  locale,
  locationSlug,
  D,
  close,
}: {
  node: ResolvedLocationNode<Location>;
  depth: number;
  openKeys: Set<string>;
  toggleKey: (key: string) => void;
  isSearching: boolean;
  locale: Locale;
  locationSlug: string;
  D: Record<string, string>;
  close: () => void;
}) {
  const indentStyle = depth > 0 ? { paddingLeft: `${12 + depth * 12}px` } : undefined;

  // Не сворачиваемая ветка (одна вложенная локация/группа) — рендерим детей сразу, без заголовка.
  if (!node.collapsible) {
    if (node.locs) {
      return (
        <div>
          {node.locs.map((l) => (
            <LocationRow key={l.id} l={l} depth={depth} locale={locale} locationSlug={locationSlug} D={D} close={close} />
          ))}
        </div>
      );
    }
    return (
      <div>
        {node.children!.map((c) => (
          <LocationTreeRow
            key={c.key}
            node={c}
            depth={depth}
            openKeys={openKeys}
            toggleKey={toggleKey}
            isSearching={isSearching}
            locale={locale}
            locationSlug={locationSlug}
            D={D}
            close={close}
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
        className="flex w-full items-center justify-between gap-2 px-3 pt-3 pb-1 text-left cursor-pointer"
      >
        <span className={D.groupLabel}>{node.label}</span>
        <ChevronDown size={15} className={cn('shrink-0 transition-transform', D.groupChevron, isOpen && 'rotate-180')} />
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
                  <LocationRow key={l.id} l={l} depth={depth + 1} locale={locale} locationSlug={locationSlug} D={D} close={close} />
                ))
              : node.children!.map((c) => (
                  <LocationTreeRow
                    key={c.key}
                    node={c}
                    depth={depth + 1}
                    openKeys={openKeys}
                    toggleKey={toggleKey}
                    isSearching={isSearching}
                    locale={locale}
                    locationSlug={locationSlug}
                    D={D}
                    close={close}
                  />
                ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LocationRow({
  l,
  depth,
  locale,
  locationSlug,
  D,
  close,
}: {
  l: Location;
  depth: number;
  locale: Locale;
  locationSlug: string;
  D: Record<string, string>;
  close: () => void;
}) {
  const active = l.slug === locationSlug;
  const accent = getMetroColor(l.slug);
  return (
    <Link
      href={`/${l.slug}`}
      onClick={close}
      className={cn('flex items-center gap-2.5 rounded-lg py-2.5 pr-3 transition cursor-pointer border-l-2', D.itemText)}
      style={{ borderLeftColor: active ? accent : 'transparent', paddingLeft: `${12 + depth * 12}px` }}
    >
      <span className="flex-1 truncate leading-tight">
        {pickSwitcherName(l, locale)}
      </span>
    </Link>
  );
}
