'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';

/**
 * Три «спила бревна» — кнопки на основе НАСТОЯЩЕГО фото среза (ясень),
 * вырезанного по контуру (прозрачный фон, рваный край коры сохранён).
 *
 * Один снимок → три визуально разных спила: поворот + отражение + лёгкий
 * сдвиг тона, чтобы кнопки не выглядели близнецами. Цвет мягко уведён в
 * тёплую палитру Барвихи (фотореализм сохранён). Контактная тень даёт
 * объём, при наведении — золотое свечение по контуру.
 */
export interface WoodSliceItem {
  href: string;
  title: string;
}

interface Props {
  items: WoodSliceItem[];
  locationSlug?: string;
}

// варианты подачи одного фото — чтобы три кнопки выглядели как три спила
const VARIANTS = [
  { rotate: -4, scaleX: 1, grade: 'saturate(1.12) contrast(1.05) brightness(1.02) sepia(0.08) hue-rotate(-6deg)' },
  { rotate: 124, scaleX: -1, grade: 'saturate(1.18) contrast(1.06) brightness(0.99) sepia(0.12) hue-rotate(-10deg)' },
  { rotate: 238, scaleX: 1, grade: 'saturate(1.1) contrast(1.04) brightness(1.05) sepia(0.05) hue-rotate(-3deg)' },
] as const;

export function WoodSliceRow({ items }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-3xl items-end justify-center gap-2 px-1 sm:gap-6 sm:px-4">
      {items.slice(0, 3).map((it, i) => {
        const v = VARIANTS[i % VARIANTS.length]!;
        const isHover = hovered === i;
        return (
          <Link
            key={it.href}
            href={it.href}
            prefetch
            aria-label={it.title}
            className="group relative flex w-1/3 flex-col items-center focus:outline-none"
            onPointerEnter={() => setHovered(i)}
            onPointerDown={() => setHovered(i)}
            onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered((h) => (h === i ? null : h))}
          >
            <motion.div
              className="relative w-full"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.06, y: -5 }}
            >
              {/* контактная тень под спилом */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-[12%] bottom-[2%] h-[14%] rounded-[50%]"
                style={{
                  background: 'radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.55), rgba(0,0,0,0))',
                  filter: 'blur(2px)',
                  zIndex: 0,
                }}
              />
              <img
                src="/wood/slice-cut.webp"
                alt=""
                aria-hidden
                draggable={false}
                className="relative block h-auto w-full select-none"
                style={{
                  transform: `rotate(${v.rotate}deg) scaleX(${v.scaleX})`,
                  filter: isHover
                    ? `${v.grade} drop-shadow(0 10px 16px rgba(0,0,0,0.5)) drop-shadow(0 0 7px rgba(242,214,158,0.85)) drop-shadow(0 0 2px rgba(242,214,158,0.95))`
                    : `${v.grade} drop-shadow(0 8px 14px rgba(0,0,0,0.45))`,
                  transition: 'filter 0.25s ease',
                  zIndex: 1,
                }}
              />
            </motion.div>
            <span
              className="mt-1 text-center text-[11px] uppercase tracking-[0.2em] sm:mt-2 sm:text-sm sm:tracking-[0.28em]"
              style={{
                color: isHover ? '#F2D69E' : '#E7C994',
                textShadow: '0 1px 6px rgba(0,0,0,0.6)',
                transition: 'color 0.25s',
              }}
            >
              {it.title}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
