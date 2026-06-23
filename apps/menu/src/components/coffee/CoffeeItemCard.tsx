'use client';

import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { ResolvedMenuItem } from '@barviha/db';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { useToast } from '@/store/toast';

interface Props {
  item: ResolvedMenuItem;
  name: string;
  description: string | null;
  locationSlug: string;
}

/**
 * Карточка блюда в светлом дизайне Coffeemania: крупное фото на тёплом сером
 * фоне со скруглением, под ним — название и строка «вес / цена ₽» серым.
 * Круглая кнопка «+» появляется при наведении в углу фото.
 */
export function CoffeeItemCard({ item, name, locationSlug }: Props) {
  const add = useCart((s) => s.add);
  const push = useToast((s) => s.push);
  const t = useTranslations();
  const [bump, setBump] = useState(false);

  const meta = [item.weight, formatPrice(item.price)].filter(Boolean).join(' / ');

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
      <Link
        href={`/${locationSlug}/item/${item.id}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cm-text)]/20 rounded-[18px]"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-[18px] bg-[var(--cm-surface)]">
          {item.photo ? (
            <>
              <Image
                src={item.photo}
                alt={name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
                style={{ filter: 'var(--cm-photo, none)' }}
                className="object-cover object-center transition duration-500 group-hover:scale-[1.05]"
              />
              {/* Единая «вуаль» поверх фото — сводит пере/недосвет к одному тону. */}
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

          <button
            type="button"
            onClick={addToCart}
            aria-label={t('toast.addedToCart')}
            className={cnBump(
              bump,
              'absolute bottom-2.5 right-2.5 grid h-9 w-9 place-items-center rounded-full bg-[var(--cm-surface-2)] text-[var(--cm-text)] shadow-[0_2px_10px_rgba(0,0,0,0.12)] transition-all duration-200 hover:bg-[var(--cm-accent)] hover:text-white cursor-pointer [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-y-1 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0',
            )}
          >
            <Plus className="h-5 w-5" strokeWidth={2.4} />
          </button>
        </div>

        <h3
          className="mt-2.5 text-[15px] font-light normal-case leading-[1.3] tracking-[0.03em] text-[var(--cm-text)] line-clamp-2"
          style={{ fontFamily: "'Jost', sans-serif" }}
        >
          {capitalize(name)}
        </h3>
        {meta && (
          <p className="mt-1 font-[family-name:var(--font-sans)] text-[13px] font-normal text-[var(--cm-muted-dim)]">
            {meta}
          </p>
        )}
      </Link>
    </article>
  );
}

/** Лёгкий «толчок» кнопки при добавлении в корзину. */
function cnBump(active: boolean, base: string): string {
  return active ? `${base} scale-90` : base;
}

/** Названия в данных капсом — приводим к человеческому виду. */
function capitalize(s: string): string {
  if (!s) return s;
  const lower = s.toLocaleLowerCase('ru');
  return lower.charAt(0).toLocaleUpperCase('ru') + lower.slice(1);
}
