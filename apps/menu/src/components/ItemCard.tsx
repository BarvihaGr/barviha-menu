'use client';

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

export function ItemCard({ item, name, description, locationSlug, index = 0 }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.4, ease: 'easeOut' }}
    >
      <Link
        href={`/${locationSlug}/item/${item.id}`}
        className="group block h-full overflow-hidden rounded-sm border border-[color:var(--border)] bg-card transition hover:-translate-y-1 hover:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer"
      >
        <div className="relative aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-[#222] to-[#0c0c0c] overflow-hidden">
          {item.labels.length > 0 && (
            <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
              {item.labels.slice(0, 2).map((label) => (
                <Badge key={label} label={label} />
              ))}
            </div>
          )}
          <span className="text-6xl text-gold-dark opacity-30 transition group-hover:opacity-50 group-hover:scale-110">
            ◈
          </span>
        </div>
        <div className="flex flex-col gap-3 p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-normal tracking-wide text-white leading-tight line-clamp-2">
            {name}
          </h3>
          {description && (
            <p className="flex-1 text-xs sm:text-sm leading-relaxed text-muted line-clamp-2">
              {description}
            </p>
          )}
          <div className="flex items-center justify-between border-t border-[color:var(--border)] pt-3 mt-auto">
            <span className="text-base sm:text-lg font-medium text-gold">
              {formatPrice(item.price)}
            </span>
            <AddToCartButton itemId={item.id} itemName={name} />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
