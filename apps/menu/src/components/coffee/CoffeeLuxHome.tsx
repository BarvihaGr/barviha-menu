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
          preload="metadata"
          poster="/locations/arka/poster.jpg"
          className="h-full w-full object-cover"
          style={{ filter: 'brightness(1.45) saturate(1.35) contrast(1.06)' }}
        >
          <source src="/locations/arka/hero.mp4" type="video/mp4" />
        </video>
        {/* Нижний переход в фон страницы */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--cm-bg)] to-transparent" />
        {/* Скрим под текстом — радиальный, только в центре, фото открыто по краям */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_60%,rgba(0,0,0,0.52)_0%,transparent_100%)]" />
      </div>

      {/* Контент hero — только крупное дерево по центру + кнопка «Меню» */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-12 px-6 pt-8 pb-28 text-center">
        {/* Название + сабтайтл + адрес */}
        <div className="flex flex-col items-center gap-5 sm:gap-6">
          <div className="flex flex-col items-center gap-2.5 sm:gap-3">
            <h1
              className="font-[family-name:var(--font-display)] text-[44px] font-light uppercase leading-[0.95] tracking-[0.12em] text-white sm:text-[72px]"
              style={{ textShadow: '0 2px 24px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.9)' }}
            >
              {locationName}
            </h1>
            <p
              className="font-[family-name:var(--font-display)] text-[13px] uppercase tracking-[0.34em] text-white/80 sm:text-[15px]"
              style={{ textShadow: '0 1px 12px rgba(0,0,0,0.8)' }}
            >
              {HERO_SUBTITLE}
            </p>
            {address && (
              <p
                className="font-[family-name:var(--font-sans)] text-[12px] tracking-[0.14em] text-white/65 sm:text-[13px]"
                style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}
              >
                {address}
              </p>
            )}
          </div>
        </div>

        {/* Первичное действие — открыть меню */}
        <div className="flex w-full max-w-[360px] flex-col gap-3">
          <Link
            href={menuHref}
            className="group flex h-[52px] items-center justify-center gap-3 rounded-[14px] border border-[#C4A882]/50 bg-[#8B6644]/35 font-[family-name:var(--font-display)] text-[13px] font-light uppercase tracking-[0.28em] text-[#F5EAD8] backdrop-blur-[8px] transition-all duration-300 ease-out hover:border-[#C4A882]/80 hover:bg-[#8B6644]/55 focus-visible:outline-none active:scale-[0.985] cursor-pointer"
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
