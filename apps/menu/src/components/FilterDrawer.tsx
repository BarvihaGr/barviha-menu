'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FILTERS_BY_REALM, type FilterKey, type FilterRealm } from './FilterBar';

interface Props {
  active: Set<FilterKey>;
  onChange: (next: Set<FilterKey>) => void;
  realm?: FilterRealm;
  /** Только иконка без текста (для строки иконки+пилюли). */
  iconOnly?: boolean;
  /**
   * Передаётся из coffee-контекста чтобы применить --cm-* переменные
   * внутри портала (который рендерится вне .coffee-theme дерева).
   */
  themeStyle?: React.CSSProperties;
}

export function FilterDrawer({ active, onChange, realm = 'kitchen', iconOnly, themeStyle }: Props) {
  const t = useTranslations('filters');
  const [open, setOpen] = useState(false);
  const available = FILTERS_BY_REALM[realm];

  if (available.length === 0) return null;

  const toggle = (key: FilterKey) => {
    const next = new Set(active);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };

  const count = active.size;
  const isCoffee = !!themeStyle;

  // ── Триггер-кнопка ──
  const trigger = iconOnly ? (
    <button
      type="button"
      className={cn(
        'relative flex aspect-square items-center justify-center self-stretch rounded-full transition cursor-pointer',
        count > 0 ? 'text-foreground' : 'text-muted hover:text-foreground',
      )}
    >
      <SlidersHorizontal size={16} strokeWidth={2} />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-foreground px-0.5 text-[9px] font-bold text-background">
          {count}
        </span>
      )}
    </button>
  ) : (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full transition-all duration-200 cursor-pointer shrink-0',
        isCoffee
          ? cn(
              'px-4 py-1.5 font-[family-name:var(--font-sans)] text-[13px] bg-[var(--cm-surface)] text-[var(--cm-text)] hover:bg-[var(--cm-surface-2)]',
              count > 0 && 'bg-[var(--cm-accent)] text-white',
            )
          : cn(
              'border px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em]',
              count > 0
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-card text-muted hover:border-border-strong hover:text-foreground',
            ),
      )}
    >
      <SlidersHorizontal size={13} strokeWidth={2.2} />
      {t('title')}
      {count > 0 && (
        <span className={cn(
          'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold',
          isCoffee ? 'bg-white/25 text-white' : 'bg-background/30 text-background',
        )}>
          {count}
        </span>
      )}
    </button>
  );

  // ── Стили чипов внутри шторки ──
  const chipCls = (on: boolean) => cn(
    'shrink-0 whitespace-nowrap rounded-full transition-all duration-200 cursor-pointer',
    isCoffee
      ? cn('px-5 py-2.5 font-[family-name:var(--font-sans)] text-[14px]',
          on ? 'bg-[var(--cm-accent)] text-white font-medium' : 'bg-[var(--cm-surface)] text-[var(--cm-muted)] hover:text-[var(--cm-text)]')
      : cn('border px-4 py-2.5 text-[12px] uppercase tracking-[0.1em]',
          on
            ? 'border-foreground bg-foreground text-background'
            : 'border-border bg-card text-muted hover:border-border-strong hover:text-foreground'),
  );

  // ── Цвета шторки ──
  const sheetBg = isCoffee ? 'bg-[var(--cm-bg)]' : 'bg-background';
  const sheetBorder = isCoffee ? 'border-t border-[var(--cm-border)]' : 'border-t border-border';
  const handleColor = isCoffee ? 'bg-[var(--cm-border)]' : 'bg-border';
  const titleColor = isCoffee ? 'text-[var(--cm-text)]' : 'text-foreground uppercase tracking-[0.18em]';
  const closeBtnCls = isCoffee
    ? 'text-[var(--cm-muted-dim)] hover:text-[var(--cm-text)] hover:bg-[var(--cm-surface)]'
    : 'text-muted hover:text-foreground hover:bg-card';
  const resetBtnCls = isCoffee
    ? 'bg-[var(--cm-surface)] text-[var(--cm-muted-dim)] hover:text-[var(--cm-text)]'
    : 'border border-border text-muted hover:border-border-strong hover:text-foreground text-[11px] uppercase tracking-[0.15em]';
  const doneBtnCls = isCoffee
    ? 'bg-[var(--cm-accent)] text-white'
    : 'bg-foreground text-background text-[11px] uppercase tracking-[0.15em]';

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger}
      </Dialog.Trigger>

      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            <Dialog.Content
              asChild
              aria-describedby={undefined}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className={cn('fixed bottom-0 left-0 right-0 z-[80] rounded-t-3xl', sheetBg, sheetBorder)}
                style={{
                  paddingBottom: 'max(env(safe-area-inset-bottom), 1.25rem)',
                  ...(themeStyle ?? {}),
                }}
              >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className={cn('h-1 w-10 rounded-full', handleColor)} />
                </div>

                {/* Заголовок + крестик */}
                <div className={cn(
                  'flex items-center justify-between px-5 py-3.5',
                  isCoffee ? 'border-b border-[var(--cm-border)]' : 'border-b border-border',
                )}>
                  <Dialog.Title className={cn('text-[15px] font-semibold', titleColor)}>
                    {t('title')}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className={cn('flex h-8 w-8 items-center justify-center rounded-full transition cursor-pointer', closeBtnCls)}
                    >
                      <X size={17} />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Чипы фильтров */}
                <div className="flex flex-wrap gap-2.5 px-5 py-5">
                  {available.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggle(f)}
                      aria-pressed={active.has(f)}
                      className={chipCls(active.has(f))}
                    >
                      {t(f)}
                    </button>
                  ))}
                </div>

                {/* Кнопки: Сбросить + Готово */}
                <div className="flex gap-2.5 px-5 pt-1">
                  {count > 0 && (
                    <button
                      type="button"
                      onClick={() => onChange(new Set())}
                      className={cn('flex-1 rounded-full py-3 text-[13px] font-medium transition cursor-pointer', resetBtnCls)}
                    >
                      {t('reset')}
                    </button>
                  )}
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className={cn(
                        'rounded-full py-3 text-[13px] font-semibold transition cursor-pointer',
                        count > 0 ? 'flex-1' : 'w-full',
                        doneBtnCls,
                      )}
                    >
                      {t('close')}
                    </button>
                  </Dialog.Close>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
