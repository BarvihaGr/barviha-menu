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
  description: string | null;
  locationSlug: string;
  index?: number;
}

export function ItemCard({ item, name, locationSlug }: Props) {
  return (
    <article className="h-full">
      <Link
        href={`/${locationSlug}/item/${item.id}`}
        className="group flex flex-col h-full overflow-hidden rounded-3xl border border-[color:var(--border)] bg-card transition hover:-translate-y-1 hover:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer"
      >
        {/* Фото — фиксированная пропорция */}
        <div className="relative m-2.5 mb-0 aspect-[4/3] w-[calc(100%-20px)] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#453324] to-[#2A1B11]">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          {item.labels.length > 0 && (
            <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
              {item.labels.slice(0, 2).map((label) => (
                <Badge key={label} label={label} />
              ))}
            </div>
          )}
        </div>

        {/* Контент */}
        <div className="flex flex-col flex-1 p-3 sm:p-4 pt-2.5">

          {/* Название — максимум 2 строки */}
          <h3 className="text-[13px] sm:text-[14px] font-light tracking-[0.02em] text-cream leading-snug line-clamp-2">
            {name}
          </h3>

          {/* Спейсер — прижимает футер вниз */}
          <div className="flex-1 min-h-[6px]" />

          {/* Футер: цена слева, кнопка справа — строго на одной оси */}
          <div className="flex items-center justify-between w-full mt-1 gap-2">
            <span className="text-[13px] sm:text-[14px] font-medium text-gold leading-none shrink-0">
              {formatPrice(item.price)}
            </span>
            <AddToCartButton itemId={item.id} itemName={name} className="shrink-0" />
          </div>

        </div>
      </Link>
    </article>
  );
}
