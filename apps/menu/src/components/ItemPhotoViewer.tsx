'use client';

import { useState } from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { Expand, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Props {
  src: string;
  alt: string;
}

/**
 * Фото блюда/кальяна в карточке: в превью показывается кадрированным
 * (object-cover), по тапу открывается на весь экран целиком (object-contain),
 * чтобы блюдо можно было нормально рассмотреть.
 */
export function ItemPhotoViewer({ src, alt }: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('item');

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={t('viewPhoto')}
          className="group absolute inset-0 cursor-zoom-in outline-none"
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            style={{ filter: 'brightness(0.85) saturate(0.9)' }}
          />
          {/* Подсказка «увеличить» */}
          <span className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/90 backdrop-blur-sm transition group-hover:border-gold group-hover:text-gold">
            <Expand size={16} />
          </span>
        </button>
      </Dialog.Trigger>

      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md"
              />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              aria-describedby={undefined}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8"
              >
                <Dialog.Title className="sr-only">{alt}</Dialog.Title>

                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label={t('closePhoto')}
                    className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/90 backdrop-blur-sm transition hover:border-gold hover:text-gold cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </Dialog.Close>

                {/* Сам кадр — целиком, по тапу закрывается */}
                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label={t('closePhoto')}
                    className="relative flex max-h-full max-w-full cursor-zoom-out items-center justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- произвольное соотношение сторон, нужен natural-size */}
                    <img
                      src={src}
                      alt={alt}
                      className="max-h-[88vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
                    />
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
