'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export interface RelatedItem {
  id: string;
  name: string;
  photo: string | null;
}

interface Props {
  items: RelatedItem[];
  locationSlug: string;
}

/**
 * Узкая боковая лента «из этой же категории». Кружки-превью блюд той же
 * категории, которые можно листать. Тап → карточка другого блюда.
 *
 * Контейнер ограничен по высоте (не «уезжает в бесконечность»), кружки
 * помещаются целиком, низ списка мягко затухает — намёк, что есть ещё.
 * Кнопка-стрелка снизу прокручивает ленту.
 */
export function RelatedItemsRail({ items, locationSlug }: Props) {
  const t = useTranslations('item');
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scrollDown = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    el.scrollTo({ top: atEnd ? 0 : el.scrollTop + el.clientHeight * 0.8, behavior: 'smooth' });
  };

  return (
    <aside className="shrink-0 w-[64px] sm:w-[80px]" aria-label={t('related')}>
      <div className="sticky top-4 flex flex-col items-center gap-2 rounded-3xl border border-gold/15 bg-black/20 p-2">
        <div
          ref={scrollerRef}
          className="flex max-h-[58vh] flex-col items-center gap-3 overflow-y-auto no-scrollbar [mask-image:linear-gradient(to_bottom,transparent,#000_14px,#000_calc(100%-14px),transparent)]"
        >
          {items.map((it) => (
            <Link
              key={it.id}
              href={`/${locationSlug}/item/${it.id}`}
              aria-label={it.name}
              title={it.name}
              className="group relative block aspect-square w-12 sm:w-14 shrink-0 overflow-hidden rounded-full border border-gold/25 bg-gradient-to-br from-[#453324] to-[#2A1B11] transition duration-300 hover:scale-105 hover:border-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {it.photo ? (
                <Image
                  src={it.photo}
                  alt={it.name}
                  fill
                  sizes="56px"
                  className="object-cover transition duration-500 group-hover:scale-110"
                  style={{ filter: 'brightness(0.9) saturate(0.95)' }}
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-xl text-gold-dark opacity-40">
                  ◈
                </span>
              )}
            </Link>
          ))}
        </div>

        {items.length > 4 && (
          <button
            type="button"
            onClick={scrollDown}
            aria-label="↓"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/30 text-gold/70 transition hover:border-gold hover:text-gold cursor-pointer"
          >
            <ChevronDown size={15} strokeWidth={2} />
          </button>
        )}
      </div>
    </aside>
  );
}
