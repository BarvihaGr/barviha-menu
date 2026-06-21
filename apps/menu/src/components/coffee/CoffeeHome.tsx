import Image from 'next/image';
import type { Category } from '@barviha/db';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { pickCategoryName } from '@/lib/i18n-helpers';
import { coffeeAccentStyle } from '@/lib/coffee-design';

interface Props {
  locationSlug: string;
  locationName: string;
  locationCity: string | null;
  /** Категории в порядке отображения (Кальяны | Кухня | Бар). */
  categories: Category[];
  /** Репрезентативное фото на категорию (slug → url). */
  categoryPhotos?: Record<string, string | null>;
  locale: Locale;
  /** Подпись «Открыть меню» для карточки. */
  ctaLabel: string;
}

/**
 * Главная локации в светлом дизайне Coffeemania: чистый текстовый хедер
 * (eyebrow + название + город) и крупные плитки-категории с фото блюда,
 * градиентом и названием поверх. Акцент — фирменный цвет локации (`--cm-accent`).
 * Без видео-героя и каруселей. Только для редизайн-локаций (Бауманская).
 */
export function CoffeeHome({
  locationSlug,
  locationName,
  locationCity,
  categories,
  categoryPhotos = {},
  locale,
  ctaLabel,
}: Props) {
  const hrefFor = (slug: string) =>
    slug === 'hookah' ? `/${locationSlug}/hookah` : `/${locationSlug}/${slug}`;

  return (
    // Полноширинный светлый фон — выходим за пределы контейнера main.
    <div
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen -mt-2 min-h-screen bg-[var(--cm-bg)] text-[var(--cm-text)]"
      style={coffeeAccentStyle(locationSlug)}
    >
      <div className="mx-auto w-full max-w-[1100px] px-4 pb-32 pt-12 sm:px-6 lg:pt-16">
        {/* Хедер локации */}
        <header className="mb-9 text-center sm:mb-12">
          <p className="font-[family-name:var(--font-display)] text-[12px] font-medium uppercase tracking-[0.34em] text-[color:var(--cm-accent)] sm:text-[13px]">
            Barvikha Group
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-[36px] font-semibold leading-[1.04] tracking-[-0.01em] text-[var(--cm-text)] sm:text-[52px]">
            {locationName}
          </h1>
          {locationCity && (
            <p className="mt-3 font-[family-name:var(--font-sans)] text-[14px] text-[var(--cm-muted-dim)] sm:text-[15px]">
              {locationCity}
            </p>
          )}
        </header>

        {/* Плитки-категории с фото */}
        {categories.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
            {categories.map((c, i) => {
              const photo = categoryPhotos[c.slug] ?? null;
              return (
                <Link
                  key={c.id}
                  href={hrefFor(c.slug)}
                  className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl bg-[var(--cm-surface)] shadow-[0_4px_24px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_14px_44px_rgba(0,0,0,0.14)] sm:aspect-[3/4]"
                >
                  {photo ? (
                    <Image
                      src={photo}
                      alt={pickCategoryName(c, locale)}
                      fill
                      sizes="(max-width: 640px) 100vw, 360px"
                      priority={i === 0}
                      className="object-cover transition-transform duration-[600ms] group-hover:scale-[1.05]"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(150deg, var(--cm-accent) 0%, var(--cm-text) 125%)',
                      }}
                    />
                  )}

                  {/* Затемнение снизу для читаемости подписи */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  <div className="relative p-5 sm:p-6">
                    <h2 className="font-[family-name:var(--font-display)] text-[26px] font-semibold leading-tight tracking-[-0.01em] text-white sm:text-[30px]">
                      {pickCategoryName(c, locale)}
                    </h2>
                    <span className="mt-2 inline-flex items-center gap-1.5 font-[family-name:var(--font-sans)] text-[13px] font-medium text-white/80 transition-colors group-hover:text-white">
                      {ctaLabel}
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
