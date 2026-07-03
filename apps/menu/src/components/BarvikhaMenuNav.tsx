'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Category } from '@barviha/db';
import { pickCategoryName } from '@/lib/i18n-helpers';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/routing';

interface Props {
  locationSlug: string;
  categories: Category[];
  currentCategorySlug: string;
  locale: Locale;
}

const NAV_ORDER = ['kitchen', 'bar', 'hookah'] as const;

export function BarvikhaMenuNav({ locationSlug, categories, currentCategorySlug, locale }: Props) {
  const ordered = NAV_ORDER
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter((c): c is Category => Boolean(c));

  if (ordered.length === 0) return null;

  return (
    <div
      className="sticky z-20 -mx-4 sm:mx-0 border-b border-border bg-background/95 backdrop-blur-sm"
      style={{ top: 'var(--header-h, 62px)' }}
    >
      <div className="-mx-0 flex items-center">

        {/* Иконки: поиск + фильтр — фиксированные слева, нефункциональные-визуально */}
        <div className="flex shrink-0 items-center pl-4 sm:pl-0">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:text-foreground cursor-pointer"
            aria-label="search"
          >
            <Search size={16} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:text-foreground cursor-pointer"
            aria-label="filter"
          >
            <SlidersHorizontal size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Разделитель */}
        <div className="mx-1.5 h-4 w-px shrink-0 bg-border" />

        {/* Горизонтально прокручиваемые вкладки категорий */}
        <div className="overflow-x-auto no-scrollbar flex-1">
          <div className="flex gap-0.5 py-2 pr-4 sm:pr-0">
            {ordered.map((cat) => {
              const isActive = cat.slug === currentCategorySlug;
              const href = cat.slug === 'hookah'
                ? `/${locationSlug}/hookah`
                : `/${locationSlug}/${cat.slug}`;

              return (
                <Link
                  key={cat.slug}
                  href={href}
                  className={cn(
                    'shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors cursor-pointer',
                    isActive
                      ? 'border border-foreground text-foreground'
                      : 'text-muted hover:text-foreground',
                  )}
                >
                  {pickCategoryName(cat, locale)}
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
