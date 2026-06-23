import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { coffeeAccentStyle } from '@/lib/coffee-design';

interface Props {
  locationSlug: string;
  locationName: string;
  /** Адрес/город под названием (если есть). */
  locationCity: string | null;
  /** Первая категория меню — для кнопки «Меню». */
  menuHref: string;
  /** Подпись кнопки «Меню». */
  menuLabel: string;
  locale: Locale;
  /** Соцсети для футера (минимально — VK · Telegram). */
  socials?: { label: string; href: string }[];
}

/** Подзаголовок hero — общий для всех lux-локаций. */
const HERO_SUBTITLE = 'Lounge Restaurant & Bar';

/** Адрес под названием. Берём из данных локации, иначе — ручной фолбэк по slug. */
const LUX_ADDRESS: Record<string, string> = {
  kievskaia: 'ул. Киевская, 2',
};

/**
 * Главная в стиле «дорогой минимализм» (концепт Coffeemania × Барвиха):
 * полноэкранный тёмный hero c фото интерьера, дерево-бренд сверху, крупное
 * название филиала тонким сан-серифом, «Lounge Restaurant & Bar», адрес и две
 * первичные кнопки — Забронировать стол / Меню. Соцсети — только в подвале.
 * Золото (--cm-accent) появляется дозированно: дерево, активная кнопка, акценты.
 * Только для lux-локаций (Ереван).
 */
export function CoffeeLuxHome({
  locationSlug,
  locationName,
  locationCity,
  menuHref,
  menuLabel,
  socials = [],
}: Props) {
  const address = LUX_ADDRESS[locationSlug] ?? locationCity;
  return (
    <div
      // Ровно один экран без скролла: высота = видимый экран минус хедер.
      // -mt-2/-mb-32 гасят паддинги <main>, чтобы фон-видео доходило до краёв,
      // а контент центрировался во весь экран и на телефоне, и на компьютере.
      className="relative left-1/2 right-1/2 -mx-[50vw] -mt-2 -mb-32 flex h-[calc(100svh-60px)] w-screen flex-col overflow-hidden bg-[var(--cm-bg)] text-[var(--cm-text)] sm:h-[calc(100svh-64px)]"
      style={coffeeAccentStyle(locationSlug)}
    >
      {/* Фон — крутящееся видео интерьера «Арки» + затемнение для воздуха
          и читаемости. Постер-кадр как фолбэк до загрузки/при ошибке. */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/locations/arka/poster.jpg"
          className="h-full w-full object-cover opacity-55"
        >
          <source src="/locations/arka/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--cm-bg)]/85 via-[var(--cm-bg)]/55 to-[var(--cm-bg)]" />
      </div>

      {/* Контент hero — только крупное дерево по центру + кнопка «Меню» */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-12 px-6 pt-8 pb-28 text-center">
        {/* Дерево + название + сабтайтл + адрес — строго по центральной оси */}
        <div className="flex flex-col items-center gap-5 sm:gap-6">
          <div className="flex flex-col items-center gap-2.5 sm:gap-3">
            <h1 className="font-[family-name:var(--font-display)] text-[44px] font-light uppercase leading-[0.95] tracking-[0.12em] text-[var(--cm-text)] sm:text-[72px]">
              {locationName}
            </h1>
            <p className="font-[family-name:var(--font-display)] text-[13px] uppercase tracking-[0.34em] text-[var(--cm-text-soft)] sm:text-[15px]">
              {HERO_SUBTITLE}
            </p>
            {address && (
              <p className="font-[family-name:var(--font-sans)] text-[12px] tracking-[0.14em] text-[var(--cm-muted)] sm:text-[13px]">
                {address}
              </p>
            )}
          </div>
        </div>

        {/* Первичное действие — открыть меню */}
        <div className="flex w-full max-w-[360px] flex-col gap-3">
          <Link
            href={menuHref}
            className="group flex h-[52px] items-center justify-center gap-3 rounded-[14px] border border-white/20 bg-white/[0.02] font-[family-name:var(--font-display)] text-[13px] font-light uppercase tracking-[0.28em] text-white backdrop-blur-[2px] transition-all duration-300 ease-out hover:border-white/40 hover:bg-white/[0.07] focus-visible:border-white/40 focus-visible:outline-none active:scale-[0.985] active:bg-white/[0.1] cursor-pointer"
          >
            {menuLabel}
            <span
              aria-hidden
              className="text-[15px] leading-none transition-transform duration-300 ease-out group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>

        {/* Соцсети — только в подвале, дозированно */}
        {socials.length > 0 && (
          <div className="flex items-center gap-4 font-[family-name:var(--font-sans)] text-[12px] uppercase tracking-[0.2em] text-[var(--cm-muted)]">
            {socials.map((s, i) => (
              <span key={s.label} className="flex items-center gap-4">
                {i > 0 && <span className="text-[var(--cm-muted-dim)]">·</span>}
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-[color:var(--cm-accent)] cursor-pointer"
                >
                  {s.label}
                </a>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
