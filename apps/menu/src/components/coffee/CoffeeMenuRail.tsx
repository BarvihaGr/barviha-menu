'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { ResolvedMenuItem } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { pickItemName } from '@/lib/i18n-helpers';

interface Props {
  items: ResolvedMenuItem[];
  locationSlug: string;
}

/**
 * Узкая вертикальная лента кружков-превью блюд категории (светлый дизайн
 * Coffeemania, только Бауманская). Тап → детальная карточка блюда.
 *
 * Десктоп — sticky-колонка справа от сетки меню. Мобайл — плавающая полоска,
 * приклеенная к правому краю экрана по центру по вертикали (поверх сетки).
 * Низ списка мягко затухает, стрелка снизу прокручивает.
 */
export function CoffeeMenuRail({ items, locationSlug }: Props) {
  const withPhoto = items.filter((i) => i.photo);
  if (withPhoto.length === 0) return null;

  return (
    <>
      {/* Десктоп: колонка в сетке */}
      <aside className="hidden shrink-0 lg:block lg:w-[84px]" aria-label="rail-desktop">
        <div className="sticky top-6">
          <RailBox items={withPhoto} locationSlug={locationSlug} circle="w-14" />
        </div>
      </aside>

      {/* Мобайл: плавающая полоска у правого края */}
      <div
        className="fixed right-1.5 top-1/2 z-30 -translate-y-1/2 lg:hidden"
        style={{ marginTop: 'env(safe-area-inset-top)' }}
      >
        <RailBox items={withPhoto} locationSlug={locationSlug} circle="w-11" floating />
      </div>
    </>
  );
}

/** Скруглённый контейнер ленты с прокруткой и стрелкой. */
function RailBox({
  items,
  locationSlug,
  circle,
  floating = false,
}: {
  items: ResolvedMenuItem[];
  locationSlug: string;
  circle: string;
  floating?: boolean;
}) {
  const t = useTranslations('item');
  const locale = useLocale() as Locale;
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    el.scrollTo({ top: atEnd ? 0 : el.scrollTop + el.clientHeight * 0.8, behavior: 'smooth' });
  };

  return (
    <div
      className={
        floating
          ? 'flex flex-col items-center gap-2 rounded-full border border-[#ececec] bg-white/85 p-1.5 shadow-[0_6px_22px_rgba(0,0,0,0.12)] backdrop-blur-md'
          : 'flex flex-col items-center gap-2 rounded-3xl border border-[#ececec] bg-[#fbfbfa] p-2'
      }
    >
      <div
        ref={scrollerRef}
        className={`flex flex-col items-center gap-3 overflow-y-auto no-scrollbar [mask-image:linear-gradient(to_bottom,transparent,#000_14px,#000_calc(100%-14px),transparent)] ${
          floating ? 'max-h-[64vh]' : 'max-h-[72vh]'
        }`}
      >
        {items.map((it) => {
          const name = pickItemName(it, locale);
          return (
            <Link
              key={it.id}
              href={`/${locationSlug}/item/${it.id}`}
              aria-label={name}
              title={name}
              className={`group relative block aspect-square ${circle} shrink-0 overflow-hidden rounded-full border border-[#e6e3dc] bg-[#f3f2ef] transition duration-300 hover:scale-105 hover:border-[var(--cm-accent)]`}
            >
              <Image
                src={it.photo!}
                alt={name}
                fill
                sizes="56px"
                className="object-cover transition duration-500 group-hover:scale-110"
              />
            </Link>
          );
        })}
      </div>

      {items.length > 5 && (
        <button
          type="button"
          onClick={scrollDown}
          aria-label={t('related')}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#bdbdbd] transition hover:text-[var(--cm-accent)] cursor-pointer"
        >
          <ChevronDown size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
