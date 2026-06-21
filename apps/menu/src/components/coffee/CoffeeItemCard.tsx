'use client';

import Image from 'next/image';
import type { ResolvedMenuItem } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/utils';
import { AddToCartButton } from '../AddToCartButton';

interface Props {
  item: ResolvedMenuItem;
  name: string;
  description: string | null;
  locationSlug: string;
}

/**
 * Карточка блюда в стиле Coffeemania: единое фото 4:3 (object-cover → все ровные),
 * чистая типографика (Inter), минимум рамок. Фото — крупное и аккуратное, текст
 * под ним; цена + грамовка + кнопка в подвале. Тёплая палитра проекта.
 */
export function CoffeeItemCard({ item, name, description, locationSlug }: Props) {
  const teaser = description
    ? (description.match(/^.*?[.!?…](\s|$)/)?.[0] ?? description).trim()
    : null;

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/${locationSlug}/item/${item.id}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-2xl"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#3B2A20] to-[#241509]">
          {item.photo ? (
            <Image
              src={item.photo}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-5xl text-gold/25">◈</div>
          )}
          {item.is_premium && (
            <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-gold backdrop-blur-sm">
              Premium
            </span>
          )}
        </div>

        <h3 className="mt-3 font-[family-name:var(--font-sans)] text-[15px] font-medium leading-snug tracking-[0.01em] text-cream line-clamp-2">
          {name}
        </h3>
        {teaser && (
          <p className="mt-1 font-[family-name:var(--font-sans)] text-[12px] font-light leading-snug text-muted line-clamp-2">
            {teaser}
          </p>
        )}
      </Link>

      <div className="mt-auto flex items-center justify-between gap-3 pt-3">
        <div className="flex items-baseline gap-2">
          <span className="font-[family-name:var(--font-sans)] text-[16px] font-semibold text-gold">
            {formatPrice(item.price)}
          </span>
          {item.weight && (
            <span className="font-[family-name:var(--font-sans)] text-[11px] text-muted-dim">
              {item.weight}
            </span>
          )}
        </div>
        <AddToCartButton itemId={item.id} itemName={name} className="shrink-0" />
      </div>
    </article>
  );
}
