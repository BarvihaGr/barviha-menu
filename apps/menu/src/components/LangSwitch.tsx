'use client';

import { useState } from 'react';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

/** Название каждого языка — на его же языке. */
const NATIVE_NAME: Record<Locale, string> = {
  ru: 'Русский',
  en: 'English',
  zh: '中文',
  hy: 'Հայերեն',
};

/**
 * Переключатель языка — кнопка с названием текущего языка, по тапу
 * открывается меню со списком всех языков (каждый на своём языке).
 * Заменяет прежний тесный ряд из трёх кнопок RU/EN/中.
 */
export function LangSwitch({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const switchTo = (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 hover:bg-gold/20 hover:border-gold transition px-2.5 sm:px-3.5 py-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.12em] sm:tracking-[0.2em] text-gold cursor-pointer"
      >
        <Languages size={13} className="shrink-0" />
        <span className="max-w-[80px] truncate">{NATIVE_NAME[locale]}</span>
        <ChevronDown size={12} className={cn('transition opacity-80', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="absolute right-0 top-full mt-2 z-50 w-40 overflow-hidden rounded-sm border border-gold bg-card shadow-2xl"
            >
              {routing.locales.map((l) => {
                const active = l === locale;
                return (
                  <li key={l}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => switchTo(l)}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-sm transition cursor-pointer hover:bg-black/30 border-l-2',
                        active ? 'text-gold border-gold' : 'text-foreground border-transparent',
                      )}
                    >
                      <span>{NATIVE_NAME[l]}</span>
                      {active && <Check size={14} className="text-gold shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
