import type { Category } from '@barviha/db';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { pickCategoryName } from '@/lib/i18n-helpers';

interface Props {
  locationSlug: string;
  locationName: string;
  locationCity: string | null;
  /** Категории в порядке отображения (Кальяны | Кухня | Бар). */
  categories: Category[];
  locale: Locale;
  /** Подпись «Открыть меню» для карточки. */
  ctaLabel: string;
}

/**
 * Главная локации в светлом дизайне Coffeemania: чистый текстовый хедер
 * (eyebrow + название + город) и аккуратная сетка категорий — белые карточки
 * с тонкой границей. Без видео-героя, каруселей и нижней плашки-кнопок.
 * Только для редизайн-локаций (Бауманская).
 */
export function CoffeeHome({
  locationSlug,
  locationName,
  locationCity,
  categories,
  locale,
  ctaLabel,
}: Props) {
  const hrefFor = (slug: string) =>
    slug === 'hookah' ? `/${locationSlug}/hookah` : `/${locationSlug}/${slug}`;

  return (
    // Полноширинный светлый фон — выходим за пределы контейнера main.
    <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen -mt-2 min-h-screen bg-[#fbfbfa] text-[#1a1a1a]">
      <div className="mx-auto w-full max-w-[1100px] px-4 pb-32 pt-12 sm:px-6 lg:pt-20">
        {/* Хедер локации */}
        <header className="mb-10 text-center sm:mb-14">
          <p className="font-[family-name:var(--font-display)] text-[12px] font-medium uppercase tracking-[0.32em] text-[#c49262] sm:text-[13px]">
            Barvikha
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[34px] font-semibold leading-[1.05] tracking-[-0.01em] text-[#1a1a1a] sm:text-[48px]">
            {locationName}
          </h1>
          {locationCity && (
            <p className="mt-3 font-[family-name:var(--font-sans)] text-[14px] text-[#9b9b9b] sm:text-[15px]">
              {locationCity}
            </p>
          )}
        </header>

        {/* Сетка категорий */}
        {categories.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={hrefFor(c.slug)}
                className="group flex flex-col justify-between rounded-2xl border border-[#ececec] bg-white px-6 py-7 transition-all duration-300 hover:border-[#1a1a1a]/15 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:min-h-[170px]"
              >
                <h2 className="font-[family-name:var(--font-display)] text-[24px] font-semibold leading-tight tracking-[-0.01em] text-[#1a1a1a] sm:text-[26px]">
                  {pickCategoryName(c, locale)}
                </h2>
                <span className="mt-6 inline-flex items-center gap-1.5 font-[family-name:var(--font-sans)] text-[13px] font-medium text-[#9b9b9b] transition-colors group-hover:text-[#c49262]">
                  {ctaLabel}
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
