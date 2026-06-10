'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';

/**
 * Три «спила бревна» — кнопки на основе НАСТОЯЩЕГО фото среза (ясень),
 * вырезанного по контуру (прозрачный фон, рваный край коры сохранён).
 *
 * Один снимок → три визуально разных спила: поворот + отражение + лёгкий
 * сдвиг тона. Главное — у спила есть ТОЛЩИНА (градиентный торец через
 * стек drop-shadow по силуэту) → это объёмный кусок дерева, а не плоская
 * наклейка. Тёплый ореол-подсветка + приземляющая тень; при наведении —
 * золотое свечение по контуру и лёгкий подъём.
 */
export interface WoodSliceItem {
  href: string;
  title: string;
}

interface Props {
  items: WoodSliceItem[];
  locationSlug?: string;
}

// градиентный торец спила (объём): силуэт, продавленный вниз, светлее
// сверху → темнее книзу. Применяется на ОБЁРТКЕ поверх повёрнутой
// картинки → всегда вниз по экрану, не «улетает» при повороте.
const EDGE =
  'drop-shadow(0 1px 0 rgb(88,57,30)) drop-shadow(0 2px 0 rgb(82,53,28)) drop-shadow(0 3px 0 rgb(76,49,25)) drop-shadow(0 4px 0 rgb(70,45,23)) drop-shadow(0 5px 0 rgb(64,41,21)) drop-shadow(0 6px 0 rgb(58,37,19)) drop-shadow(0 7px 0 rgb(52,33,17)) drop-shadow(0 8px 0 rgb(46,29,15)) drop-shadow(0 9px 0 rgb(40,25,12)) drop-shadow(0 10px 0 rgb(34,21,10)) drop-shadow(0 11px 0 rgb(28,17,8)) drop-shadow(0 12px 0 rgb(22,13,6))';

// варианты подачи одного фото — мелкие естественные углы + отражение +
// сдвиг тона. Большие повороты убраны: они выдавали один и тот же спил,
// прокрученный вокруг оси.
const VARIANTS = [
  { rotate: -3, scaleX: 1, grade: 'saturate(1.06) contrast(1.05) brightness(1.03) hue-rotate(3deg)' },
  { rotate: 2, scaleX: -1, grade: 'saturate(1.1) contrast(1.06) brightness(1.0) hue-rotate(2deg)' },
  { rotate: -2, scaleX: 1, grade: 'saturate(1.04) contrast(1.04) brightness(1.06) hue-rotate(4deg)' },
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
              {/* тёплая подсветка-ореол за спилом */}
              <span
                aria-hidden
                className="pointer-events-none absolute rounded-[50%]"
                style={{
                  inset: '-14% -10% -6% -10%',
                  background: isHover
                    ? 'radial-gradient(50% 50% at 50% 48%, rgba(242,214,158,0.45), rgba(214,162,92,0.18) 55%, rgba(214,162,92,0) 72%)'
                    : 'radial-gradient(50% 50% at 50% 48%, rgba(214,162,92,0.34), rgba(214,162,92,0.12) 55%, rgba(214,162,92,0) 72%)',
                  filter: 'blur(14px)',
                  transition: 'background 0.3s ease',
                  zIndex: 0,
                }}
              />
              {/* контактная тень под спилом */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-[16%] bottom-[-6%] h-[12%] rounded-[50%]"
                style={{
                  background: 'radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.62), rgba(0,0,0,0) 72%)',
                  filter: 'blur(4px)',
                  zIndex: 0,
                }}
              />
              {/* обёртка с торцом: фильтр применяется ПОВЕРХ повёрнутой
                  картинки → выдавливание всегда строго вниз по экрану */}
              <div
                className="relative w-full"
                style={{
                  filter: isHover
                    ? `${EDGE} drop-shadow(0 12px 12px rgba(0,0,0,0.5)) drop-shadow(0 0 8px rgba(242,214,158,0.9)) drop-shadow(0 0 2px rgba(242,214,158,0.95))`
                    : `${EDGE} drop-shadow(0 10px 10px rgba(0,0,0,0.5))`,
                  transition: 'filter 0.25s ease',
                  zIndex: 2,
                }}
              >
                <img
                  src="/wood/slice-cut.webp"
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="block h-auto w-full select-none"
                  style={{
                    transform: `rotate(${v.rotate}deg) scaleX(${v.scaleX})`,
                    filter: v.grade,
                  }}
                />
              </div>
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
