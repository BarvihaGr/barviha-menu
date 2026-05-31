'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import type { ResolvedMenuItem } from '@barviha/db';
import { pickItemName } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/utils';
import { Badge } from './Badge';

interface Props {
  items: ResolvedMenuItem[];
  locationSlug: string;
}

/** Горизонтальная карусель хитов/акций — красивый «вылет» карточек. */
export function PromoCarousel({ items, locationSlug }: Props) {
  const locale = useLocale() as Locale;
  if (items.length === 0) return null;

  return (
    <div className="-mx-4 sm:-mx-6 overflow-x-auto no-scrollbar px-4 sm:px-6">
      <div className="flex gap-3 sm:gap-4 pb-2">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.08, 0.5), duration: 0.5, ease: 'easeOut' }}
            className="shrink-0 w-[260px] sm:w-[300px]"
          >
            <Link
              href={`/${locationSlug}/item/${item.id}`}
              className="group block overflow-hidden rounded-sm border border-[color:var(--border)] bg-card transition hover:-translate-y-1 hover:border-gold cursor-pointer"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#453324] to-[#2A1B11]">
                {item.photo ? (
                  <Image
                    src={item.photo}
                    alt={pickItemName(item, locale)}
                    fill
                    sizes="300px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    style={{ filter: 'brightness(0.85) saturate(0.9)' }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-5xl text-gold-dark opacity-30">
                    ◈
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {item.labels[0] && (
                  <div className="absolute left-3 top-3 flex gap-1.5 z-10">
                    <Badge label={item.labels[0]} />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between gap-2">
                  <span className="text-sm text-white font-medium line-clamp-1 drop-shadow">
                    {pickItemName(item, locale)}
                  </span>
                  <span className="shrink-0 text-sm gold-text font-semibold">{formatPrice(item.price)}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
