'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useState } from 'react';
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

  const weightStr = item.weight != null ? `${item.weight} г` : null;
  const meta = [weightStr, formatPrice(item.price)].filter(Boolean).join(' / ');

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(item.id, 1);
    push(t('toast.addedToCart'), 'success');
    setBump(true);
    setTimeout(() => setBump(false), 180);
  };

  return (
    <article className="group flex h-full flex-col">
      {/* Link — flex-col h-full чтобы контент тянулся и цена всегда снизу */}
      <Link
        href={`/${locationSlug}/item/${item.id}`}
        className="relative flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cm-text)]/20"
      >
        {/* Фото */}
        <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-[18px] bg-[var(--cm-surface)]">
          {item.photo ? (
            <>
              <Image
                src={item.photo}
                alt={name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
                style={{ filter: 'var(--cm-photo, none)', objectPosition: 'center 35%' }}
                className="object-cover scale-[1.08] transition duration-500 group-hover:scale-[1.13]"
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'var(--cm-photo-veil, transparent)' }}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl text-[#d8d6d0]">
              ◍
            </div>
          )}
        </div>

        {/* Текстовый блок.
            position:relative — для absolute-футера.
            pb-[40px] — защита: название не залезет под цену/кнопку.
            Футер absolute bottom-0: всегда на одной высоте.
            В CSS grid все карточки ряда одинаковой высоты →
            bottom-0 даёт одинаковую Y-позицию у всех. */}
        <div className="relative flex-1 pt-2.5 pb-[40px]">
          <h3
            className="text-[14px] sm:text-[15px] font-light normal-case leading-[1.35] tracking-[0.02em] text-[var(--cm-text)] line-clamp-1"
            style={{ fontFamily: "'Jost', sans-serif" }}
          >
            {capitalizeRu(name)}
          </h3>

          {/* Футер: цена слева, кнопка «+» справа — строго на одной оси */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2">
            {meta ? (
              <p className="font-[family-name:var(--font-sans)] text-[12.5px] sm:text-[13px] font-normal leading-none text-[var(--cm-muted-dim)]">
                {meta}
              </p>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={addToCart}
              aria-label={`${t('item.addToCart')} ${name}`}
              className={cnBump(
                bump,
                'shrink-0 grid h-8 w-8 place-items-center rounded-full bg-[var(--cm-surface)] text-[var(--cm-text)] shadow-sm transition-all duration-200 hover:bg-[var(--cm-accent)] hover:text-white cursor-pointer',
              )}
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}

function cnBump(active: boolean, base: string): string {
  return active ? `${base} scale-90` : base;
}
