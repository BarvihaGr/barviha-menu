'use client';

import Image from 'next/image';
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
            style={{ filter: 'brightness(0.72) saturate(1.1)' }}
          />
          {/* Нижний фейд в цвет страницы */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--cm-bg)] to-transparent" />
          {/* Верхний скрим */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
        </div>

        {/* Контент героя */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-12 px-6 pt-8 pb-28 text-center">

          {/* Логотип + название */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col items-center gap-4"
          >
            <Image
              src="/logo-barvikha.png"
              alt="Barvikha"
              width={72}
              height={72}
              className="drop-shadow-lg"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <div>
              <h1
                className="font-[family-name:var(--font-display)] text-[52px] font-light uppercase leading-none tracking-[0.1em] text-white sm:text-[72px]"
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}
              >
                {locationName}
              </h1>
              <p
                className="mt-2 font-[family-name:var(--font-display)] text-[13px] uppercase tracking-[0.3em] text-white/75"
                style={{ textShadow: '0 1px 10px rgba(0,0,0,0.7)' }}
              >
                Lounge Restaurant & Bar
              </p>
              {locationCity && (
                <p className="mt-1 text-[12px] tracking-[0.15em] text-white/55">
                  {locationCity}
                </p>
              )}
            </div>
          </motion.div>

          {/* Кнопки — одна сейчас, место под будущие */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex w-full max-w-[340px] flex-col gap-3"
          >
            <Link
              href={menuHref}
              className="group flex h-[52px] items-center justify-center gap-3 rounded-[14px] border border-white/35 bg-white/15 font-[family-name:var(--font-display)] text-[13px] font-light uppercase tracking-[0.28em] text-white backdrop-blur-[10px] transition-all duration-300 ease-out hover:border-white/55 hover:bg-white/25 focus-visible:outline-none active:scale-[0.985] cursor-pointer"
            >
              {menuLabel}
              <span className="text-[15px] leading-none transition-transform duration-300 ease-out group-hover:translate-x-1" aria-hidden>→</span>
            </Link>
            {/* Место под будущие кнопки */}
          </motion.div>
        </div>
      </section>

    </div>
  );
}
