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
 * Sticky-навигация по категориям локации в стиле Coffeemania:
 * горизонтальная лента ссылок, активная подсвечена. Кальяны ведут на свой роут.
 */
export function CoffeeCategoryNav({ categories, currentSlug, locationSlug, locale }: Props) {
  return (
    <nav className="sticky top-0 z-30 -mx-4 mb-6 bg-[color:var(--background-deep)]/85 backdrop-blur-md sm:-mx-6">
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-1 px-4 py-3 sm:px-6">
          {categories.map((c) => {
            const href =
              c.slug === 'hookah'
                ? `/${locationSlug}/hookah`
                : `/${locationSlug}/${c.slug}`;
            const on = c.slug === currentSlug;
            return (
              <Link
                key={c.id}
                href={href}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-full px-4 py-2 font-[family-name:var(--font-sans)] text-[12px] uppercase tracking-[0.16em] transition',
                  on
                    ? 'bg-gold text-[#2A1B11]'
                    : 'text-muted hover:text-gold',
                )}
              >
                {pickCategoryName(c, locale)}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
