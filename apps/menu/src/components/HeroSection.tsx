'use client';

import { useState, useEffect, useRef } from 'react';
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

/**
 * Hero-секция главной страницы локации.
 *
 * Загрузка идёт поэтапно (вместо «всё разом» = лаг):
 *  1. Сначала показывается градиент + poster.jpg (мгновенно, ~30-200KB)
 *  2. Параллельно стартует анимация логотипа (без блокировки видео)
 *  3. Видео начинает грузиться ТОЛЬКО после mount + idle (откладывает 11MB на потом)
 *  4. Когда видео реально загрузилось — оно плавно фейдится с лёгким zoom-out
 *
 * Появление контента:
 *  - Видео: blur(20px)→0 + scale(1.08)→1 (cinemagraph effect, 1.4s)
 *  - Лого: scale(0.7)+rotate(-6°)→1, с golden-glow burst (0.8s, spring)
 *  - Название: каждая буква отдельно через stagger (0.07s между буквами)
 *  - Адрес: fade-up с задержкой
 */
export function HeroSection({
  videoSrc,
  poster,
  locationName,
  locationCity,
  accent = '#C49262',
}: Props) {
  const [videoReady, setVideoReady] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  /**
   * НЕ грузим видео если:
   *  - мобильный viewport (<768px): 8.7MB убивают 4G и батарею
   *  - Data Saver включён или соединение медленнее 4G
   * Вместо видео показываем постер с лёгким Ken-Burns зумом (CSS).
   */
  useEffect(() => {
    if (!videoSrc) return;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection;
    const slow = conn?.saveData === true || (conn?.effectiveType && /2g|slow-2g|3g/.test(conn.effectiveType));
    if (isMobile || slow) return; // десктоп only

    const start = () => setShouldLoadVideo(true);
    if ('requestIdleCallback' in window) {
      const id = (window as Window & typeof globalThis).requestIdleCallback(start, { timeout: 1200 });
      return () => (window as Window & typeof globalThis).cancelIdleCallback?.(id);
    }
    const t = setTimeout(start, 400);
    return () => clearTimeout(t);
  }, [videoSrc]);

  // Когда src появился — велим браузеру начать загрузку
  useEffect(() => {
    if (shouldLoadVideo && videoRef.current) {
      videoRef.current.load();
    }
  }, [shouldLoadVideo]);

  return (
    <section className="relative -mt-12 sm:-mt-8 h-[62svh] min-h-[380px] overflow-hidden left-1/2 -translate-x-1/2 w-[min(130%,calc(100vw-1rem))]">
      {/* Фон-плейсхолдер: градиент + постер (показывается мгновенно) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#453324] via-[#2A1B11] to-[#1B110A]" />
      {poster && (
        <Image
          src={poster}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1560px"
          className={`object-cover transition-opacity duration-500 ${videoReady ? 'opacity-0' : 'opacity-90'} ken-burns`}
        />
      )}

      {videoSrc && shouldLoadVideo && (
        <motion.video
          ref={videoRef}
          initial={{ opacity: 0, scale: 1.08, filter: 'blur(20px)' }}
          animate={
            videoReady
              ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
              : { opacity: 0, scale: 1.08, filter: 'blur(20px)' }
          }
          transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 h-full w-full object-cover"
          src={videoSrc}
          poster={poster ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          onLoadedData={() => setVideoReady(true)}
        />
      )}

      {/* Лёгкое затемнение для читаемости */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/55 via-transparent to-[var(--background)]/30" />
      {/* Акцентная вуаль локации */}
      <div
        className="absolute inset-0 opacity-25 mix-blend-soft-light pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 35%, ${accent}, transparent 60%)` }}
      />
      {/* Плавный фейд по всем 4 краям — видео без резких границ */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[var(--background)] to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/80 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-16 sm:w-40 bg-gradient-to-r from-[var(--background)] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 sm:w-40 bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2 px-6 pt-2 pb-16 text-center">
        {/* Логотип — кинематографичный entrance (scale + slight rotate + glow burst) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotate: -6, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <motion.div
            initial={{ filter: 'drop-shadow(0 0 0 rgba(229,196,144,0))' }}
            animate={{
              filter: [
                'drop-shadow(0 0 0 rgba(229,196,144,0))',
                'drop-shadow(0 0 40px rgba(229,196,144,0.7))',
                'drop-shadow(0 4px 24px rgba(0,0,0,0.6))',
              ],
            }}
            transition={{ duration: 1.6, delay: 0.6, times: [0, 0.4, 1], ease: 'easeOut' }}
          >
            <Image
              src="/locations/arka/logo-tree.png"
              alt="Barvikha"
              width={2559}
              height={1591}
              priority
              className="h-40 sm:h-52 w-auto"
            />
          </motion.div>
        </motion.div>

        {/* Название локации — буква за буквой (stagger) */}
        {locationName && (
          <motion.h1
            className="font-[family-name:var(--font-display)] text-[1.7rem] sm:text-[2.7rem] font-semibold tracking-wide drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)] -mt-3"
            style={{ color: '#E5C490' }}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07, delayChildren: 0.7 } },
            }}
            aria-label={locationName}
          >
            {Array.from(locationName).map((ch, i) => (
              <motion.span
                key={i}
                style={{ display: 'inline-block', whiteSpace: 'pre' }}
                variants={{
                  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
              >
                {ch}
              </motion.span>
            ))}
          </motion.h1>
        )}

        {/* Адрес — slide-up fade с финальной задержкой */}
        {locationCity && (
          <motion.span
            className="text-[9px] sm:text-[11px] uppercase tracking-[0.3em]"
            style={{ color: '#E5C490', opacity: 0.85 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2, ease: 'easeOut' }}
          >
            {locationCity}
          </motion.span>
        )}
      </div>
    </section>
  );
}
