import type { Category } from '@barviha/db';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { pickCategoryName } from '@/lib/i18n-helpers';
import { coffeeAccentStyle } from '@/lib/coffee-design';

interface Props {
  locationSlug: string;
  categories: Category[];
  locale: Locale;
}

/** Подзаголовки разделов по ТЗ (slug → описание). */
const SUBTITLE: Record<string, string> = {
  kitchen: 'Авторская кухня',
  bar: 'Коктейли и напитки',
  hookah: 'Премиальный табак',
};

/** Переопределения названий разделов под ТЗ. */
const TITLE_OVERRIDE: Record<string, string> = {
  hookah: 'Кальянная карта',
};

/**
 * Экран-хаб «МЕНЮ» (lux, по ТЗ «Киевская»): заголовок Canela + крупные строки
 * разделов (название + описание + золотая стрелка), разделённые тонкими
 * золотыми линиями. Тёмный люкс-минимализм.
 */
export function CoffeeLuxMenu({ locationSlug, categories, locale }: Props) {
  const hrefFor = (slug: string) =>
    slug === 'hookah' ? `/${locationSlug}/hookah` : `/${locationSlug}/${slug}`;

  return (
    <div
      className="relative left-1/2 right-1/2 -mx-[50vw] -mt-2 min-h-[100svh] w-screen bg-[var(--cm-bg)] text-[var(--cm-text)]"
      style={coffeeAccentStyle(locationSlug)}
    >
      <div className="mx-auto w-full max-w-[680px] px-6 pb-32 pt-10 sm:pt-14">
        <h1 className="mb-8 font-[family-name:var(--font-sans)] text-[34px] font-light uppercase tracking-[0.14em] text-[var(--cm-text)] sm:mb-10 sm:text-[44px]">
          Меню
        </h1>

        <div className="border-t border-[var(--cm-border)]">
          {categories.map((c) => {
            const title = TITLE_OVERRIDE[c.slug] ?? pickCategoryName(c, locale);
            const subtitle = SUBTITLE[c.slug];
            return (
              <Link
                key={c.id}
                href={hrefFor(c.slug)}
                className="group flex items-center justify-between gap-4 border-b border-[var(--cm-border)] py-6 transition-colors sm:py-7"
              >
                <div className="min-w-0">
                  <h2 className="font-[family-name:var(--font-sans)] text-[26px] font-light leading-tight tracking-[0.06em] text-[var(--cm-text)] transition-colors group-hover:text-[color:var(--cm-accent)] sm:text-[32px]">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="mt-1.5 font-[family-name:var(--font-sans)] text-[13px] font-normal tracking-[0.02em] text-[var(--cm-muted)] sm:text-[14px]">
                      {subtitle}
                    </p>
                  )}
                </div>
                <span
                  aria-hidden
                  className="shrink-0 text-[20px] text-[color:var(--cm-accent)] transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
