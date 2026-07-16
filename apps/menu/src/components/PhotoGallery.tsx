'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { Expand, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PhotoEntry } from '@barviha/db';

const SWIPE_THRESHOLD = 60;

/**
 * Фото блюда в карточке товара — как CoffeePhotoViewer раньше (кроп-превью
 * с зумом по тапу на весь экран), плюс листание свайпом, если фото больше
 * одного. При одном фото/без фото ведёт себя ровно как раньше — без точек
 * и свайп-жеста.
 */
export function PhotoGallery({ photos, alt }: { photos: PhotoEntry[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const t = useTranslations('item');
  const draggedRef = useRef(false);

  if (photos.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-7xl text-[#d8d6d0]">
        ◍
      </div>
    );
  }

  const activeIndex = Math.min(index, photos.length - 1);
  const active = photos[activeIndex]!;
  const canSwipe = photos.length > 1;

  function onDragEnd(_: unknown, info: PanInfo) {
    if (Math.abs(info.offset.x) > 10) draggedRef.current = true;
    if (info.offset.x < -SWIPE_THRESHOLD) setIndex((i) => Math.min(photos.length - 1, i + 1));
    else if (info.offset.x > SWIPE_THRESHOLD) setIndex((i) => Math.max(0, i - 1));
  }

  function onFrameClick() {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    setOpen(true);
  }

  return (
    <>
      <motion.div
        className="group absolute inset-0 cursor-zoom-in outline-none"
        drag={canSwipe ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={onDragEnd}
        onClick={onFrameClick}
      >
        <Image
          src={active.src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          priority={activeIndex === 0}
          draggable={false}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--cm-surface-2)]/90 text-[var(--cm-text)] shadow-[0_1px_8px_rgba(0,0,0,0.1)] backdrop-blur transition group-hover:bg-[var(--cm-surface-2)]">
          <Expand size={16} />
        </span>
        {canSwipe && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {photos.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </motion.div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <AnimatePresence>
          {open && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[80] bg-[var(--cm-text)]/85 backdrop-blur-md"
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
                      className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--cm-surface-2)]/90 text-[var(--cm-text)] shadow-[0_1px_8px_rgba(0,0,0,0.1)] backdrop-blur transition hover:bg-[var(--cm-surface-2)] cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </Dialog.Close>

                  <motion.div
                    className="relative flex max-h-full max-w-full items-center justify-center"
                    drag={canSwipe ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.15}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -SWIPE_THRESHOLD) setIndex((i) => Math.min(photos.length - 1, i + 1));
                      else if (info.offset.x > SWIPE_THRESHOLD) setIndex((i) => Math.max(0, i - 1));
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- произвольное соотношение сторон, нужен natural-size */}
                    <img
                      src={active.src}
                      alt={alt}
                      draggable={false}
                      className="max-h-[88vh] max-w-[92vw] cursor-default rounded-2xl object-contain shadow-2xl"
                    />
                  </motion.div>

                  {canSwipe && (
                    <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                      {photos.map((_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 rounded-full transition-all ${i === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </>
  );
}
