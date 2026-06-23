'use client';

import Image from 'next/image';
import type { ResolvedMenuItem } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/utils';
import { Badge } from './Badge';
import { AddToCartButton } from './AddToCartButton';

interface Props {
  item: ResolvedMenuItem;
  name: string;
  locationSlug: string;
}

export function ItemCard({ item, name, locationSlug }: Props) {
  return (
    <article className="h-full">
      <Link
        href={`/${locationSlug}/item/${item.id}`}
        className="group flex flex-col h-full overflow-hidden rounded-2xl border border-white/[0.12] bg-card/90 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer"
      >
        {/* Фото */}
        <div className="relative m-2 mb-0 aspect-[4/3] shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#453324] to-[#2A1B11]">
          {item.photo ? (
            <Image
              src={item.photo}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
              style={{ filter: 'brightness(0.88) saturate(0.92)' }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-5xl text-gold-dark opacity-25">
              ◈
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          {item.labels.length > 0 && (
            <div className="absolute left-2.5 top-2.5 flex flex-col gap-1 z-10">
              {item.labels.slice(0, 2).map((label) => (
                <Badge key={label} label={label} />
              ))}
            </div>
          )}
        </div>

        {/* Контент.
            position:relative — для absolute-футера.
            pb-[44px] — защита: текст не залезет под футер.
            Футер absolute bottom-3: всегда на одинаковой высоте
            от низа. В CSS grid все карточки ряда одной высоты →
            bottom-3 означает одинаковую Y-координату у всех. */}
        <div className="relative flex-1 px-3 pt-2.5 pb-[44px] sm:px-3.5 sm:pt-3">

          <h3 className="text-[13px] sm:text-[14px] font-light tracking-[0.01em] text-cream/95 leading-[1.45] line-clamp-2">
            {name}
          </h3>

          <div className="absolute bottom-3 left-3 right-3 sm:left-3.5 sm:right-3.5 flex items-center justify-between gap-2">
            <span className="text-[12.5px] sm:text-[13.5px] font-medium text-gold leading-none">
              {formatPrice(item.price)}
            </span>
            <AddToCartButton itemId={item.id} itemName={name} className="shrink-0" />
          </div>

        </div>
      </Link>
    </article>
  );
}
