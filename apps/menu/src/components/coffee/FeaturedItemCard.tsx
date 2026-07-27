'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ResolvedMenuItem } from '@barviha/db';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { formatPrice, capitalizeRu } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { useToast } from '@/store/toast';
import { photoTransformCss } from '@/lib/photo-transform';
import { trackAdd } from '@/lib/stats';

interface Props {
  item: ResolvedMenuItem;
  name: string;
  locationSlug: string;
}

/**
 * Широкая карточка на всю ширину сетки — для позиций с is_featured (см.
 * ResolvedMenuItem). Фото не квадратное, а широкое (во всю ширину), но
 * название/описание/цена — под фото, как в обычной карточке (см.
 * CoffeeItemCard), а не оверлеем поверх снимка: на светлых фото
 * белый текст поверх градиента было не прочитать.
 */
export function FeaturedItemCard({ item, name, locationSlug }: Props) {
  const add = useCart((s) => s.add);
  const push = useToast((s) => s.push);
  const t = useTranslations();
  const [bump, setBump] = useState(false);
  const [index, setIndex] = useState(0);

  const photos = item.photos;
  const canCycle = photos.length > 1;

  const activeIndex = Math.min(index, photos.length - 1);
  const active = photos[activeIndex];

  // Листание по клику на само фото — карточка кликабельна целиком (переход
  // на страницу позиции), поэтому тут отдельно перехватываем клик именно по
  // фото и гасим переход по ссылке, чтобы можно было пролистать кадры, не
  // уходя со страницы. Клик по остальной части карточки (название/цена/
  // кнопка) по-прежнему ведёт на страницу позиции как обычно.
  function onPhotoClick(e: React.MouseEvent) {
    if (!canCycle) return;
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + 1) % photos.length);
  }

  const displayName = capitalizeRu(name.replace(/,.*$/, ''));

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(item.id, 1);
    trackAdd(locationSlug, item.id);
    push(t('toast.addedToCart'), 'success');
    setBump(true);
    setTimeout(() => setBump(false), 180);
  };

  return (
    <motion.article
      className="group col-span-2 sm:col-span-3"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link href={`/${locationSlug}/item/${item.id}`} className="block focus:outline-none">
        {/* Широкое фото — тап по самому фото листает кадры (кросс-фейд),
         * дальше без таймера — только по клику. */}
        <div
          className={`relative aspect-[3/2] w-full overflow-hidden rounded-[var(--cm-card-radius,16px)] bg-[var(--cm-surface)] ${canCycle ? 'cursor-pointer' : ''}`}
          onClick={onPhotoClick}
        >
          {active ? (
            <AnimatePresence mode="sync">
              <motion.div
                key={active.src}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              >
                <Image
                  src={active.src}
                  alt={displayName}
                  fill
                  sizes="100vw"
                  priority={activeIndex === 0}
                  style={{
                    filter: 'var(--cm-photo, none)',
                    objectPosition: active.position ? `${active.position.x}% ${active.position.y}%` : 'center',
                    transform: photoTransformCss(active.transform),
                  }}
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl text-[var(--cm-muted-dim)]">
              ◍
            </div>
          )}

          {canCycle && (
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Инфо под фото */}
        <div className="flex items-end justify-between gap-4 pt-3">
          <div className="min-w-0">
            <h3 className="font-[family-name:var(--font-display)] text-[18px] sm:text-[22px] font-light uppercase tracking-[0.05em] text-[var(--cm-text)]">
              {displayName}
            </h3>
            {item.description && (
              <p className="mt-1 max-w-xl text-[12.5px] sm:text-[13.5px] leading-snug text-[var(--cm-muted)]">
                {item.description}
              </p>
            )}
            <span className="mt-2 block text-[15px] font-semibold text-[var(--cm-accent-on-bg,var(--cm-accent))]">
              {formatPrice(item.price)}
            </span>
          </div>

          <button
            type="button"
            onClick={addToCart}
            aria-label={`${t('item.addToCart')} ${displayName}`}
            className={cnBump(
              bump,
              'grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--cm-accent)] text-[var(--cm-text)] shadow-sm transition-all duration-200 active:scale-90 cursor-pointer',
            )}
          >
            <Plus className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>
      </Link>
    </motion.article>
  );
}

function cnBump(active: boolean, base: string): string {
  return active ? `${base} scale-90` : base;
}
