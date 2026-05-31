'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Props {
  /** Путь к hero-видео локации (mp4). Если нет — показываем градиент-фон. */
  videoSrc?: string | null;
  poster?: string | null;
  tagline?: string;
}

export function HeroSection({ videoSrc, poster, tagline }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <section className="relative -mx-4 sm:-mx-6 -mt-6 mb-2 h-[42vh] min-h-[280px] max-h-[440px] overflow-hidden">
      {/* Фон: видео или градиент */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#643102] via-[#3F1904] to-[#05342C]" />
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
      {/* Затемнение для читаемости */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#3F1904] via-[#3F1904]/40 to-[#3F1904]/30" />

      {/* Логотип по центру */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <Image
            src="/logo.png"
            alt="Barvikha"
            width={427}
            height={57}
            priority
            className="h-9 sm:h-12 w-auto drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
          />
        </motion.div>
        {tagline && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-[10px] sm:text-xs uppercase tracking-[0.4em] gold-text font-medium"
          >
            {tagline}
          </motion.p>
        )}
      </div>
    </section>
  );
}
