'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { ResolvedMenuItem } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/utils';
import { Badge } from './Badge';
import { AddToCartButton } from './AddToCartButton';

interface Props {
  item: ResolvedMenuItem;
  name: string;
  description: string | null;
  locationSlug: string;
  index?: number;
}

export function ItemCard({ item, name, locationSlug, index = 0 }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.4, ease: 'easeOut' }}
    >
      <Link
        href={`/${locationSlug}/item/${item.id}`}
        className="group block h-full overflow-hidden rounded-3xl border border-[color:var(--border)] bg-card transition hover:-translate-y-1 hover:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer"
      >
        <div className="relative m-2.5 mb-0 aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-[#453324] to-[#2A1B11]">
          {item.photo ? (
            <Image
              src={item.photo}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
              style={{ filter: 'brightness(0.85) saturate(0.9)' }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-6xl text-gold-dark opacity-30">
              ◈
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 pointer-events-none" />
          {item.labels.length > 0 && (
            <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
              {item.labels.slice(0, 2).map((label) => (
                <Badge key={label} label={label} />
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-normal tracking-wide text-white leading-tight line-clamp-2">
              {name}
            </h3>
            <span className="mt-1.5 block text-base sm:text-lg font-medium text-gold">
              {formatPrice(item.price)}
            </span>
          </div>
          <AddToCartButton itemId={item.id} itemName={name} className="shrink-0" />
        </div>
      </Link>
    </motion.article>
  );
}
