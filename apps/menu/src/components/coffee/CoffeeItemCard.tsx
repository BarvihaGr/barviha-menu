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

interface Props {
  item: ResolvedMenuItem;
  name: string;
  description: string | null;
  locationSlug: string;
}

export function CoffeeItemCard({ item, name, locationSlug }: Props) {
  const add = useCart((s) => s.add);
  const push = useToast((s) => s.push);
  const t = useTranslations();
  const [bump, setBump] = useState(false);

  const displayName = capitalizeRu(name.replace(/,.*$/, ''));
  const weightStr = item.weight != null ? `${item.weight} г` : null;

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(item.id, 1);
    push(t('toast.addedToCart'), 'success');
    setBump(true);
    setTimeout(() => setBump(false), 180);
  };

  return (
    <motion.article
      className="group flex flex-col"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link
        href={`/${locationSlug}/item/${item.id}`}
        className="flex flex-col h-full focus:outline-none"
      >
        {/* Квадратное фото */}
        <div className="relative aspect-square w-full overflow-hidden rounded-[var(--cm-card-radius,16px)] bg-[var(--cm-surface)]">
          {item.photo ? (
            <Image
              src={item.photo}
              alt={displayName}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              style={{ filter: 'var(--cm-photo, none)', objectPosition: 'center 35%' }}
              className="object-cover transition duration-500 group-hover:scale-[1.05]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-3xl text-[var(--cm-muted-dim)]">
              ◍
            </div>
          )}
        </div>

        {/* Инфо под фото */}
        <div className="flex flex-col flex-1 pt-2.5 pb-1">
          {/* Название */}
          <h3
            className="text-[13.5px] font-medium leading-[1.3] text-[var(--cm-text)] overflow-hidden"
            style={{ maxHeight: 'calc(1.3em * 2)' }}
          >
            {displayName}
          </h3>

          {/* Вес + цена + кнопка */}
          <div className="mt-auto flex items-center justify-between gap-1 pt-2">
            <div className="flex flex-col leading-none">
              {/* Строка веса — всегда занимает место (h-[15px]), цена всегда на одной высоте */}
              <span className="block h-[15px] text-[11px] text-[var(--cm-muted)]">
                {weightStr ?? ''}
              </span>
              <span className="text-[14px] font-semibold text-[var(--cm-accent-on-bg,var(--cm-accent))]">
                {formatPrice(item.price)}
              </span>
            </div>

            <button
              type="button"
              onClick={addToCart}
              aria-label={`${t('item.addToCart')} ${displayName}`}
              className={cnBump(
                bump,
                'shrink-0 grid h-8 w-8 place-items-center rounded-full bg-[var(--cm-accent)] text-[var(--cm-text)] shadow-sm transition-all duration-200 active:scale-90 cursor-pointer',
              )}
            >
              <Plus className="h-4 w-4" strokeWidth={2.2} />
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
