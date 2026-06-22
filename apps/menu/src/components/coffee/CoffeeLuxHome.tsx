import Image from 'next/image';
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
  menuHref,
  menuLabel,
  socials = [],
}: Props) {
  return (
    <div
      className="relative left-1/2 right-1/2 -mx-[50vw] -mt-2 flex min-h-[100svh] w-screen flex-col bg-[var(--cm-bg)] text-[var(--cm-text)]"
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
        {/* Дерево + название локации — по центру */}
        <div className="flex flex-col items-center gap-5">
          <Image
            src="/locations/arka/logo-tree.png"
            alt="Барвиха"
            width={760}
            height={472}
            priority
            sizes="(max-width: 640px) 80vw, 460px"
            className="h-52 w-auto sm:h-72"
          />
          <h1 className="font-[family-name:var(--font-display)] text-[48px] font-light uppercase leading-[0.95] tracking-[0.12em] text-[var(--cm-text)] sm:text-[72px]">
            {locationName}
          </h1>
        </div>

        {/* Первичное действие — открыть меню */}
        <div className="flex w-full max-w-[360px] flex-col gap-3">
          <Link
            href={menuHref}
            className="flex h-[52px] items-center justify-center rounded-[14px] bg-[color:var(--cm-accent)] font-[family-name:var(--font-display)] text-[13px] font-light uppercase tracking-[0.28em] text-[#111111] transition-all duration-300 ease-out hover:opacity-95 hover:shadow-[0_0_22px_-6px_var(--cm-accent)] focus-visible:shadow-[0_0_26px_-4px_var(--cm-accent)] focus-visible:outline-none active:scale-[0.985] active:shadow-[0_0_36px_-2px_var(--cm-accent)] active:brightness-[1.06] cursor-pointer"
          >
            {menuLabel}
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
