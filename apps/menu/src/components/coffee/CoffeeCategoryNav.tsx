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

      {/* Мобайл: горизонтальная лента. Залипает под шапкой при скролле.
          Высота шапки ≈68px (py-3.5 + h-10 logo) мобайл,
          ≈72px (py-3.5 + h-11 logo) sm → top смещён соответственно. */}
      <nav className="sticky top-[67px] z-20 -mx-4 mb-3 border-b border-[var(--cm-border)] bg-[var(--cm-bg)]/80 backdrop-blur-md sm:-mx-6 sm:top-[71px] lg:hidden">
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-2 px-4 py-2.5 sm:px-6">
            {categories.map((c) => {
              const on = c.slug === currentSlug;
              return (
                <Link
                  key={c.id}
                  href={hrefFor(c.slug)}
                  aria-current={on ? 'page' : undefined}
                  className={cn(
                    'shrink-0 whitespace-nowrap rounded-full border px-4 py-2 font-[family-name:var(--font-sans)] text-[14px] transition-all duration-300 ease-out',
                    on
                      ? 'border-transparent bg-[var(--cm-accent)] font-medium text-white shadow-[0_2px_12px_-4px_var(--cm-accent)]'
                      : 'border-[var(--cm-border)] bg-[var(--cm-surface)]/60 text-[var(--cm-muted)] hover:text-[var(--cm-text)]',
                  )}
                >
                  {pickCategoryName(c, locale)}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
