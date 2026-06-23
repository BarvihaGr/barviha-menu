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
   * Видео грузится поэтапно — НЕ блокирует первый paint:
   *  - сначала постер (мгновенно)
   *  - после mount + idle (~700-1500ms) стартует загрузка видео
   *  - когда видео реально готово — фейдится поверх постера
   *
   * Если включён Data Saver или соединение 2g/slow-2g —
   * оставляем только постер.
   */
  useEffect(() => {
    if (!videoSrc) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection;
    const veryslow = conn?.saveData === true || (conn?.effectiveType && /^(2g|slow-2g)$/.test(conn.effectiveType));
    if (veryslow) return;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const start = () => setShouldLoadVideo(true);
    // на мобиле — больше задержка чтобы UI успел проинтерактивиться
    const fallbackMs = isMobile ? 900 : 400;
    if ('requestIdleCallback' in window) {
      const id = (window as Window & typeof globalThis).requestIdleCallback(start, {
        timeout: isMobile ? 2500 : 1200,
      });
      return () => (window as Window & typeof globalThis).cancelIdleCallback?.(id);
    }
    const t = setTimeout(start, fallbackMs);
    return () => clearTimeout(t);
  }, [videoSrc]);

  // Когда src появился — велим браузеру начать загрузку
  useEffect(() => {
    if (shouldLoadVideo && videoRef.current) {
      videoRef.current.load();
    }
  }, [shouldLoadVideo]);

  return (
    <section className="relative isolate z-[1] -mt-28 sm:-mt-20 -mb-8 h-[56svh] min-h-[340px] overflow-hidden left-1/2 -translate-x-1/2 w-screen max-w-none">
      {/* Placeholder пока грузится постер */}
      <div className="absolute inset-0 bg-[#2A1B11]" />

      {/* Постер — полная яркость, без фильтров, object-center */}
      {poster && (
        <Image
          src={poster}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1560px"
          className={`object-cover object-center transition-opacity duration-500 ${videoReady ? 'opacity-0' : 'opacity-100'} ken-burns`}
          style={{ filter: 'brightness(1.3) saturate(1.6) contrast(1.08)' }}
        />
      )}

      {/* Видео — полная яркость */}
      {videoSrc && shouldLoadVideo && (
        <motion.video
          ref={videoRef}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={videoReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.08 }}
          transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ filter: 'brightness(1.3) saturate(1.6) contrast(1.08)' }}
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

      {/* Минимальный нижний переход — не закрывает фото */}
      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2 px-6 pt-16 pb-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotate: -6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.7))' }}
        >
          <Image
            src="/locations/arka/logo-tree.png"
            alt="Barvikha"
            width={2559}
            height={1591}
            priority
            className="h-[8.5rem] sm:h-44 w-auto"
          />
        </motion.div>

        {locationName && (
          <motion.h1
            className="font-[family-name:var(--font-display)] text-[1.45rem] sm:text-[2.3rem] font-semibold tracking-wide -mt-3"
            style={{
              color: '#E5C490',
              textShadow: '0px 4px 10px rgba(0,0,0,0.6), 0px 1px 3px rgba(0,0,0,0.8)',
            }}
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
                  hidden: { opacity: 0, y: 18 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
              >
                {ch}
              </motion.span>
            ))}
          </motion.h1>
        )}

        {locationCity && (
          <motion.span
            className="text-[9px] sm:text-[11px] uppercase tracking-[0.3em]"
            style={{
              color: '#E5C490',
              opacity: 0.9,
              textShadow: '0px 2px 8px rgba(0,0,0,0.7)',
            }}
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
