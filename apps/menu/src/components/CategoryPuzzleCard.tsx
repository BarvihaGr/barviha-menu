'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface Props {
  href: string;
  title: string;
  icon: React.ReactNode;
  index?: number;
  /** Соотношение сторон карточки — для пазлового эффекта. */
  aspect?: 'tall' | 'normal' | 'wide';
  /** Вертикальное смещение от базовой линии — создаёт пазл. */
  offsetY?: 'up' | 'none' | 'down';
  /** Какой вариант «среза дерева» — каждая карточка имеет свою форму. */
  shape?: 0 | 1 | 2;
}

const ASPECT_MAP = {
  tall: 'aspect-[3/4]',
  normal: 'aspect-[4/4]',
  wide: 'aspect-[5/4]',
};
const OFFSET_MAP = {
  up: '-translate-y-3 sm:-translate-y-6',
  none: 'translate-y-0',
  down: 'translate-y-3 sm:translate-y-6',
};

/**
 * Органические формы «срезов дерева» — разные неровные border-radius
 * и лёгкий поворот. Каждый shape уникальный, не выглядит как квадрат.
 */
const SHAPE_STYLES: Array<{ radius: string; rotate: string }> = [
  { radius: '62% 38% 52% 48% / 48% 60% 40% 52%', rotate: '-2.5deg' },
  { radius: '44% 56% 38% 62% / 56% 42% 58% 44%', rotate: '1.8deg' },
  { radius: '58% 42% 64% 36% / 38% 56% 44% 62%', rotate: '-1.2deg' },
];

/**
 * Карточка категории в стиле «пазл-срез дерева».
 *
 * Визуал: тёмный фон + текстура годовых колец (SVG inline), карточки
 * разной высоты и смещены по вертикали — складываются как пазл.
 * Иконка крупно по центру золотом + название снизу.
 */
export function CategoryPuzzleCard({
  href,
  title,
  icon,
  index = 0,
  aspect = 'normal',
  offsetY = 'none',
  shape = 0,
}: Props) {
  const shapeStyle = SHAPE_STYLES[shape];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.1, 0.5), duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className={cn(OFFSET_MAP[offsetY])}
    >
      <Link
        href={href}
        className={cn(
          'group relative block h-full w-full overflow-hidden border border-gold/30 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer',
          'hover:border-gold hover:shadow-[0_8px_28px_rgba(196,146,98,0.25)]',
          ASPECT_MAP[aspect],
        )}
        style={{
          borderRadius: shapeStyle?.radius,
          transform: `rotate(${shapeStyle?.rotate})`,
        }}
      >
        {/* Базовый фон карточки (тёплый тёмный) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#3B2A20] via-[#2A1B11] to-[#1B110A]" />

        {/* SVG-текстура «годовых колец» — концентрические эллипсы с золотыми штрихами */}
        <svg
          aria-hidden
          viewBox="0 0 200 240"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full opacity-60 mix-blend-screen"
        >
          <defs>
            <radialGradient id={`rings-${title}`} cx="35%" cy="55%" r="120%">
              <stop offset="0%" stopColor="rgba(229,196,144,0.08)" />
              <stop offset="3%" stopColor="rgba(229,196,144,0.18)" />
              <stop offset="5%" stopColor="rgba(196,146,98,0.04)" />
              <stop offset="8%" stopColor="rgba(229,196,144,0.16)" />
              <stop offset="11%" stopColor="rgba(196,146,98,0.04)" />
              <stop offset="14%" stopColor="rgba(229,196,144,0.14)" />
              <stop offset="18%" stopColor="rgba(196,146,98,0.03)" />
              <stop offset="22%" stopColor="rgba(229,196,144,0.13)" />
              <stop offset="27%" stopColor="rgba(196,146,98,0.03)" />
              <stop offset="32%" stopColor="rgba(229,196,144,0.11)" />
              <stop offset="38%" stopColor="rgba(196,146,98,0.02)" />
              <stop offset="44%" stopColor="rgba(229,196,144,0.10)" />
              <stop offset="51%" stopColor="rgba(196,146,98,0.02)" />
              <stop offset="58%" stopColor="rgba(229,196,144,0.08)" />
              <stop offset="66%" stopColor="rgba(196,146,98,0.01)" />
              <stop offset="74%" stopColor="rgba(229,196,144,0.06)" />
              <stop offset="84%" stopColor="rgba(196,146,98,0)" />
              <stop offset="100%" stopColor="rgba(196,146,98,0)" />
            </radialGradient>
          </defs>
          <rect width="200" height="240" fill={`url(#rings-${title})`} />
        </svg>

        {/* Радиальная подсветка по центру для глубины */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-40 group-hover:opacity-70"
          style={{
            background: 'radial-gradient(ellipse at 50% 45%, rgba(229,196,144,0.18), transparent 65%)',
          }}
        />

        {/* Контент — отвёрнут в обратную сторону чтобы текст и иконка стояли ровно */}
        <div
          className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-3 px-3 py-5"
          style={{ transform: `rotate(${shapeStyle ? `calc(${shapeStyle.rotate} * -1)` : '0deg'})` }}
        >
          <div
            className="text-[#E5C490] drop-shadow-[0_2px_12px_rgba(229,196,144,0.25)] transition group-hover:scale-110"
            style={{ filter: 'drop-shadow(0 0 6px rgba(229,196,144,0.35))' }}
          >
            {icon}
          </div>
          <h3
            className="text-center text-[11px] sm:text-sm uppercase tracking-[0.25em] font-medium"
            style={{ color: '#E5C490' }}
          >
            {title}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}
