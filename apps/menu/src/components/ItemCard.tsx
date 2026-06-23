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
        className="group flex flex-col h-full overflow-hidden rounded-2xl border border-white/10 bg-card/80 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer"
      >
        {/* ── Фото ── */}
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
          {/* Нижний градиент на фото */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          {/* Бейджи (Острое, Веган…) */}
          {item.labels.length > 0 && (
            <div className="absolute left-2.5 top-2.5 flex flex-col gap-1 z-10">
              {item.labels.slice(0, 2).map((label) => (
                <Badge key={label} label={label} />
              ))}
            </div>
          )}
        </div>

        {/* ── Текстовый блок ──
            flex-col flex-1: занимает всё пространство ниже фото.
            Структура: зона-названия (фикс. высота) → mt-auto → цена+кнопка.
            mt-auto прижимает футер вниз: если название короткое — появляется
            пустое пространство между текстом и ценой, но цена всегда снизу. */}
        <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3 sm:px-3.5 sm:pt-3 sm:pb-3.5">

          {/* Зона названия — строго 2 строки.
              Оборачивающий div фиксирует высоту: font 13px × leading(1.4) × 2 = 36px
              На sm+ (14px × 1.4 × 2 = 39px → h-10). overflow-hidden обрезает лишнее. */}
          <div className="h-[36px] sm:h-[40px] overflow-hidden">
            <h3 className="text-[12.5px] sm:text-[13.5px] font-light tracking-[0.01em] text-cream/95 leading-[1.4] line-clamp-2">
              {name}
            </h3>
          </div>

          {/* Авто-спейсер: съедает оставшееся пространство,
              прижимая футер к самому низу карточки */}
          <div className="mt-auto" />

          {/* ── Футер: цена слева, кнопка справа ──
              items-center: оба элемента строго по горизонтальной оси.
              Позиция этого блока всегда одинакова во всех карточках ряда. */}
          <div className="mt-2 flex items-center justify-between w-full gap-1.5">
            <span className="text-[12.5px] sm:text-[13px] font-medium text-gold leading-none">
              {formatPrice(item.price)}
            </span>
            <AddToCartButton itemId={item.id} itemName={name} className="shrink-0" />
          </div>

        </div>
      </Link>
    </article>
  );
}
