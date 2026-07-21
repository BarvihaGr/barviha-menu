'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { googleMapsUrl, twoGisUrl, yandexMapsUrl, type DirectionsTarget } from '@/lib/maps-links';

interface Props extends DirectionsTarget {
  /** Существующий визуальный триггер («Как добраться» и т.п.) — оборачиваем
   * его вместо прямой ссылки, сам вид не меняем. */
  children: React.ReactNode;
}

/**
 * По тапу на «Как добраться» раньше сразу открывался Google Maps. Теперь —
 * шторка снизу с выбором приложения (Яндекс/2ГИС/Google), т.к. в России
 * у гостей чаще стоят Яндекс.Карты или 2ГИС, а не Google Maps.
 */
export function DirectionsMenu({ children, ...target }: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('location');

  const options = [
    { label: t('yandexMaps'), href: yandexMapsUrl(target) },
    { label: t('twoGis'), href: twoGisUrl(target) },
    { label: t('googleMaps'), href: googleMapsUrl(target) },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>

      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-describedby={undefined}>
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 32 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="fixed inset-x-0 bottom-0 z-[96] rounded-t-3xl border-t border-gold/30 bg-card px-5 pt-5 shadow-2xl"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}
              >
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />
                <Dialog.Title className="mb-4 text-center text-[11px] uppercase tracking-[0.2em] text-muted">
                  {t('chooseMapApp')}
                </Dialog.Title>
                <div className="flex flex-col gap-2">
                  {options.map((opt) => (
                    <a
                      key={opt.label}
                      href={opt.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center rounded-xl border border-[color:var(--border)] bg-background/40 py-3.5 text-sm text-foreground transition hover:border-gold hover:text-gold cursor-pointer"
                    >
                      {opt.label}
                    </a>
                  ))}
                </div>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="mt-3 w-full py-3 text-center text-sm text-muted transition hover:text-foreground cursor-pointer"
                  >
                    {t('close')}
                  </button>
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
