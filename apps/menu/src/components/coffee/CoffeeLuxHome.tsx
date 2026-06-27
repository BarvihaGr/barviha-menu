'use client';

import { motion } from 'framer-motion';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { coffeeAccentStyle } from '@/lib/coffee-design';
import { AutoPlayVideo } from './AutoPlayVideo';

interface Props {
  locationSlug: string;
  locationName: string;
  locationCity: string | null;
  menuHref: string;
  menuLabel: string;
  locale: Locale;
  socials?: { label: string; href: string }[];
}


export function CoffeeLuxHome({
  locationSlug,
  locationName,
  locationCity,
  menuHref,
  menuLabel,
}: Props) {
  const style = coffeeAccentStyle(locationSlug);

  return (
    <div
      className="relative left-1/2 right-1/2 -mx-[50vw] -mt-2 -mb-32 w-screen overflow-x-hidden"
      style={style}
    >
      {/* ── ГЕРОЙ (полный экран) ──────────────────────────────── */}
      <section className="relative flex h-[100svh] w-full flex-col overflow-hidden">

        {/* Видео-фон */}
        <div className="absolute inset-0">
          <AutoPlayVideo
            src="/locations/arka/hero.mp4"
            poster="/locations/arka/poster.jpg"
            className="h-full w-full object-cover"
            style={{ filter: 'brightness(0.65) saturate(1.1)' }}
          />
          {/* Центральный радиальный скрим — гарантирует читаемость текста */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_65%_at_50%_48%,rgba(0,0,0,0.52)_0%,rgba(0,0,0,0.08)_100%)]" />
          {/* Верхний скрим */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
          {/* Нижний фейд в цвет страницы */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--cm-bg)] to-transparent" />
        </div>

        {/* Контент героя */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-12 px-6 pt-8 pb-28 text-center">

          {/* Название */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col items-center gap-4"
          >
            <div>
              <h1
                className="font-[family-name:var(--font-display)] text-[52px] font-light uppercase leading-none tracking-[0.1em] text-white sm:text-[72px]"
                style={{ textShadow: '0 2px 32px rgba(0,0,0,0.85), 0 1px 6px rgba(0,0,0,0.9)' }}
              >
                {locationName}
              </h1>
              <p
                className="mt-2 font-[family-name:var(--font-display)] text-[13px] uppercase tracking-[0.3em] text-white/85"
                style={{ textShadow: '0 1px 12px rgba(0,0,0,0.9)' }}
              >
                Lounge Restaurant & Bar
              </p>
              {locationCity && (
                <p className="mt-1.5 text-[12px] tracking-[0.15em] text-white/65"
                  style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
                  {locationCity}
                </p>
              )}
            </div>
          </motion.div>

          {/* Кнопка МЕНЮ с микро-анимацией */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex w-full max-w-[340px] flex-col gap-3"
          >
            <motion.div whileTap={{ scale: 0.94 }} whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
              <Link
                href={menuHref}
                className="group flex h-[54px] w-full items-center justify-center gap-3 rounded-[14px] border border-white/40 bg-white/18 font-[family-name:var(--font-display)] text-[13px] font-light uppercase tracking-[0.28em] text-white shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-[12px] transition-colors duration-300 hover:border-white/60 hover:bg-white/28 focus-visible:outline-none cursor-pointer"
              >
                {menuLabel}
                <motion.span
                  aria-hidden
                  className="text-[15px] leading-none"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
