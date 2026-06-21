import type { Category } from '@barviha/db';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { pickCategoryName } from '@/lib/i18n-helpers';
import { cn } from '@/lib/utils';

interface Props {
  categories: Category[];
  currentSlug: string;
  locationSlug: string;
  locale: Locale;
}

/**
 * Навигация по категориям в стиле Coffeemania.
 * Десктоп — вертикальный sticky-список слева; мобайл — горизонтальная лента.
 * Активная категория — тёмная и жирная, остальные — серые. Кальяны → свой роут.
 */
export function CoffeeCategoryNav({ categories, currentSlug, locationSlug, locale }: Props) {
  const hrefFor = (slug: string) =>
    slug === 'hookah' ? `/${locationSlug}/hookah` : `/${locationSlug}/${slug}`;

  return (
    <>
      {/* Десктоп: вертикальный список */}
      <nav className="hidden lg:block">
        <ul className="sticky top-6 flex flex-col gap-0.5">
          {categories.map((c) => {
            const on = c.slug === currentSlug;
            return (
              <li key={c.id}>
                <Link
                  href={hrefFor(c.slug)}
                  className={cn(
                    'block rounded-lg px-3 py-2 font-[family-name:var(--font-sans)] text-[15px] leading-snug transition-colors',
                    on
                      ? 'font-semibold text-[var(--cm-accent)]'
                      : 'font-normal text-[var(--cm-muted)] hover:text-[var(--cm-text)]',
                  )}
                >
                  {pickCategoryName(c, locale)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Мобайл: горизонтальная лента */}
      <nav className="-mx-4 mb-2 overflow-x-auto no-scrollbar sm:-mx-6 lg:hidden">
        <div className="flex gap-1 px-4 sm:px-6">
          {categories.map((c) => {
            const on = c.slug === currentSlug;
            return (
              <Link
                key={c.id}
                href={hrefFor(c.slug)}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-full px-4 py-2 font-[family-name:var(--font-sans)] text-[14px] transition-colors',
                  on
                    ? 'bg-[var(--cm-accent)] font-medium text-white'
                    : 'bg-[var(--cm-surface)] text-[var(--cm-muted)]',
                )}
              >
                {pickCategoryName(c, locale)}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
