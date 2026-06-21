'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Phone, X, Navigation } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface Props {
  locationName: string;
  address: string | null;
  phone: string | null;
  accent: string;
  /** Что показывать в роли триггера — кнопка-бейдж в хедере. */
  triggerClassName?: string;
  /** Кастомный триггер. Если передан — используется вместо бейджа с названием. */
  children?: React.ReactNode;
  /** Светлая тема Coffeemania. Модалка рендерится в портале (вне .coffee-theme),
   *  поэтому светлую палитру навешиваем прямо на её контент. */
  light?: boolean;
}

/**
 * Маршрут до точки на Яндекс.Картах ("от меня" → адрес).
 * Универсально работает в десктопе и на мобиле; смартфон спросит,
 * открыть ли в нативном приложении.
 */
function yandexDirectionsUrl(address: string): string {
  return `https://yandex.ru/maps/?rtext=~${encodeURIComponent(address)}&rtt=auto`;
}

export function LocationInfoModal({
  locationName,
  address,
  phone,
  accent,
  triggerClassName,
  children,
  light = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('location');

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {children ?? (
          <button
            type="button"
            className={cn(
              'group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm px-2 py-1 -mx-2',
              triggerClassName,
            )}
            aria-label={t('info')}
          >
            <span className="gold-pulse text-[11px] tracking-[0.25em] uppercase font-medium">
              {locationName}
            </span>
          </button>
        )}
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
                className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              aria-describedby={undefined}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, x: '-50%', y: 'calc(-50% + 16px)', scale: 0.96 }}
                animate={{ opacity: 1, x: '-50%', y: '-50%', scale: 1 }}
                exit={{ opacity: 0, x: '-50%', y: 'calc(-50% + 16px)', scale: 0.96 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                style={light ? ({ ['--cm-accent']: accent } as React.CSSProperties) : undefined}
                className={cn(
                  'fixed left-1/2 top-1/2 z-[90] w-[min(440px,calc(100vw-2rem))] rounded-sm border border-gold bg-card shadow-2xl',
                  light && 'coffee-theme',
                )}
              >
                <div className="h-1 w-full" style={{ background: accent, boxShadow: `0 0 12px ${accent}` }} />

                <div className="flex items-start justify-between px-6 pt-5 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
                    />
                    <Dialog.Title className="text-base tracking-[0.2em] uppercase text-cream font-medium">
                      {locationName}
                    </Dialog.Title>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label={t('close')}
                      className="text-muted hover:text-gold transition cursor-pointer -mr-2"
                    >
                      <X size={18} />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="px-6 pb-6 pt-3 flex flex-col gap-3">
                  {address ? (
                    <a
                      href={yandexDirectionsUrl(address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/row flex items-start gap-3 rounded-sm border border-[color:var(--border)] bg-background/40 px-4 py-3.5 hover:border-gold transition cursor-pointer"
                    >
                      <MapPin size={18} className="mt-0.5 shrink-0 text-gold" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] uppercase tracking-[0.25em] text-muted">
                          {t('address')}
                        </div>
                        <div className="mt-1 text-sm text-foreground leading-snug">{address}</div>
                        <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gold group-hover/row:text-gold-light transition">
                          <Navigation size={11} />
                          {t('directions')}
                        </div>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-start gap-3 rounded-sm border border-[color:var(--border)] bg-background/40 px-4 py-3.5 opacity-60">
                      <MapPin size={18} className="mt-0.5 shrink-0 text-muted" />
                      <div className="flex-1">
                        <div className="text-[9px] uppercase tracking-[0.25em] text-muted">
                          {t('address')}
                        </div>
                        <div className="mt-1 text-sm text-muted italic">{t('addressTBD')}</div>
                      </div>
                    </div>
                  )}

                  {phone ? (
                    <a
                      href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                      className="group/row flex items-center gap-3 rounded-sm border border-[color:var(--border)] bg-background/40 px-4 py-3.5 hover:border-gold transition cursor-pointer"
                    >
                      <Phone size={18} className="shrink-0 text-gold" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] uppercase tracking-[0.25em] text-muted">
                          {t('phone')}
                        </div>
                        <div className="mt-0.5 text-sm text-foreground group-hover/row:text-gold transition">
                          {phone}
                        </div>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 rounded-sm border border-[color:var(--border)] bg-background/40 px-4 py-3.5 opacity-60">
                      <Phone size={18} className="shrink-0 text-muted" />
                      <div className="flex-1">
                        <div className="text-[9px] uppercase tracking-[0.25em] text-muted">
                          {t('phone')}
                        </div>
                        <div className="mt-0.5 text-sm text-muted italic">{t('phoneTBD')}</div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
