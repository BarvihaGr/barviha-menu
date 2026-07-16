'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
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
 * Широкая карточка-баннер на всю ширину сетки — для позиций с is_featured
 * (см. ResolvedMenuItem). В остальном тот же функционал, что у CoffeeItemCard
 * (переход на детальную, добавление в корзину), но фото не квадратное, а
 * широкое, и под названием сразу видно описание — как единое групповое фото.
 */
export function FeaturedItemCard({ item, name, locationSlug }: Props) {
  const add = useCart((s) => s.add);
  const push = useToast((s) => s.push);
  const t = useTranslations();
  const [bump, setBump] = useState(false);

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
        {/* Широкое фото-баннер */}
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-[var(--cm-card-radius,16px)] bg-[var(--cm-surface)]">
          {item.photo ? (
            <Image
              src={item.photo}
              alt={displayName}
              fill
              sizes="100vw"
              style={{
                filter: 'var(--cm-photo, none)',
                objectPosition: item.photo_position ? `${item.photo_position.x}% ${item.photo_position.y}%` : 'center',
                transform: photoTransformCss(item.photo_transform),
              }}
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl text-[var(--cm-muted-dim)]">
              ◍
            </div>
          )}
          {/* Затемнение снизу — чтобы текст поверх фото не терялся, если фото поставят позже */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 sm:p-6">
            <div className="min-w-0">
              <h3 className="font-[family-name:var(--font-display)] text-[20px] sm:text-[26px] font-light uppercase tracking-[0.05em] text-white">
                {displayName}
              </h3>
              {item.description && (
                <p className="mt-1 max-w-xl text-[12.5px] sm:text-[13.5px] leading-snug text-white/80 line-clamp-2">
                  {item.description}
                </p>
              )}
              <span className="mt-2 block text-[15px] font-semibold text-white">
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
        </div>
      </Link>
    </motion.article>
  );
}

function cnBump(active: boolean, base: string): string {
  return active ? `${base} scale-90` : base;
}
