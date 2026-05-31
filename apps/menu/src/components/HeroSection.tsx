'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Props {
  /** Путь к hero-видео локации (mp4). Если нет — показываем градиент-фон. */
  videoSrc?: string | null;
  poster?: string | null;
  /** Название локации — крупно под логотипом. */
  locationName?: string;
  /** Город/адрес — мелким под названием. */
  locationCity?: string | null;
  /** Акцентный цвет локации (для подчёркивания названия). */
  accent?: string;
}

export function HeroSection({
  videoSrc,
  poster,
  locationName,
  locationCity,
  accent = '#C49262',
}: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen -mt-6 -mb-10 h-[82svh] min-h-[480px] overflow-hidden">
      {/* Фон: видео или градиент */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#453324] via-[#2A1B11] to-[#1B110A]" />
      {videoSrc && (
        <video
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          src={videoSrc}
          poster={poster ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setLoaded(true)}
        />
      )}
      {/* Затемнение для читаемости (мягкое, сверху и снизу) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/60 via-transparent to-[var(--background)]/35" />
      {/* Акцентная вуаль локации (еле заметный цветовой подтон) */}
      <div
        className="absolute inset-0 opacity-25 mix-blend-soft-light pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 20%, ${accent}, transparent 60%)` }}
      />
      {/* Плавное растворение видео в фон страницы снизу */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/85 to-transparent pointer-events-none" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-6 pb-[12%] text-center">
        {/* Логотип */}
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <Image
            src="/logo-arka.png"
            alt="Barvikha"
            width={2560}
            height={2072}
            priority
            className="h-28 sm:h-36 w-auto drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
          />
        </motion.div>

        {/* Название локации — крупно, с акцентным подчёркиванием */}
        {locationName && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col items-center gap-2"
          >
            <h1
              className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-semibold tracking-wide text-[color:var(--cream)] drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)]"
              style={{ textShadow: `0 0 40px ${accent}66` }}
            >
              {locationName}
            </h1>
            {locationCity && (
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-beige/80">
                {locationCity}
              </span>
            )}
          </motion.div>
        )}

      </div>
    </section>
  );
}
