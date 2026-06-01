'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface Props {
  href: string;
  title: string;
  icon: React.ReactNode;
  index?: number;
  /** Соотношение сторон карточки (для пазлового эффекта). */
  aspect?: 'tall' | 'normal' | 'wide';
  /** Вертикальное смещение от базовой линии — создаёт пазл. */
  offsetY?: 'up' | 'none' | 'down';
  /** Какой вариант «среза дерева» — 3 разных силуэта + узора колец. */
  shape?: 0 | 1 | 2;
  /** Доп. CSS-классы (для overlap через negative margin). */
  className?: string;
  /** z-index — чтобы средняя могла лечь поверх краёв соседей. */
  z?: number;
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
const ROTATE_MAP = ['-2.8deg', '1.8deg', '-1.4deg'];

// ───────── Генерация формы среза + узора (детерминированно) ─────────
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface SliceData {
  outline: string;
  rings: Array<{ rx: number; ry: number; cx: number; cy: number; rot: number; opacity: number }>;
  cracks: string[];
  cx: number;
  cy: number;
}

function buildSlice(seed: number): SliceData {
  const rng = mulberry32(seed);
  const cx = 50 + (rng() - 0.5) * 6;
  const cy = 52 + (rng() - 0.5) * 6;

  // Зазубренный контур: 44 точки с пульсирующим радиусом + шум
  const pts: Array<[number, number]> = [];
  const N = 44;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const baseR = 46 + Math.sin(a * 1 + seed * 0.7) * 3;
    const wide = Math.sin(a * 3 + seed * 1.1) * 2.5;
    const med = Math.sin(a * 7 + seed * 1.7) * 1.4;
    const fine = Math.sin(a * 15 + seed * 0.5) * 0.7;
    const noise = (rng() - 0.5) * 1.6;
    const r = baseR + wide + med + fine + noise;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 1.05]);
  }
  const outline =
    pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ') + ' Z';

  // ~22 концентрических кольца с лёгким эксцентриситетом
  const rings: SliceData['rings'] = [];
  const ringRot = (rng() - 0.5) * 30;
  for (let i = 1; i <= 22; i++) {
    const t = i / 22;
    const rx = 4 + t * 44 + Math.sin(i + seed) * 1.4;
    const ry = rx * (1.05 + Math.sin(i * 0.7) * 0.06);
    const opacity = 0.08 + (1 - Math.abs(t - 0.55)) * 0.22 + (i % 3 === 0 ? 0.05 : 0);
    rings.push({ rx, ry, cx, cy, rot: ringRot, opacity });
  }

  // 4-5 радиальных трещин от центра к краю
  const cracks: string[] = [];
  const crackCount = 4 + Math.floor(rng() * 2);
  for (let i = 0; i < crackCount; i++) {
    const a = (i / crackCount) * Math.PI * 2 + rng() * 0.6;
    const len = 38 + rng() * 12;
    const segs = 3;
    let path = `M${cx.toFixed(2)},${cy.toFixed(2)}`;
    for (let s = 1; s <= segs; s++) {
      const tt = s / segs;
      const wobble = (rng() - 0.5) * 4;
      const x = cx + Math.cos(a + wobble * 0.04) * len * tt;
      const y = cy + Math.sin(a + wobble * 0.04) * len * tt * 1.05 + wobble * 0.4;
      path += ` L${x.toFixed(2)},${y.toFixed(2)}`;
    }
    cracks.push(path);
  }

  return { outline, rings, cracks, cx, cy };
}

const SLICES = [buildSlice(7), buildSlice(31), buildSlice(53)];

/**
 * Карточка-«срез дерева».
 *
 * SVG целиком: зазубренный контур + ~22 годовых кольца с эксцентричным
 * центром + 4-5 радиальных трещин + шум-текстура (feTurbulence). Над SVG —
 * иконка и подпись золотом. Каждый shape — свой сид: рендер уникален.
 */
export function CategoryPuzzleCard({
  href,
  title,
  icon,
  index = 0,
  aspect = 'normal',
  offsetY = 'none',
  shape = 0,
  className,
  z,
}: Props) {
  const slice = SLICES[shape] ?? SLICES[0]!;
  const rotate = ROTATE_MAP[shape] ?? '0deg';
  const filterId = `wood-grain-${shape}`;
  const clipId = `wood-clip-${shape}`;
  const bgId = `wood-bg-${shape}`;
  const glowId = `wood-glow-${shape}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.1, 0.5), duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn('relative', OFFSET_MAP[offsetY], className)}
      style={{ transform: `rotate(${rotate})`, zIndex: z }}
    >
      <Link
        href={href}
        className={cn(
          'group relative block h-full w-full transition cursor-pointer focus:outline-none',
          ASPECT_MAP[aspect],
        )}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden
        >
          <defs>
            <radialGradient id={bgId} cx="48%" cy="52%" r="60%">
              <stop offset="0%" stopColor="#3B2A20" />
              <stop offset="60%" stopColor="#2A1B11" />
              <stop offset="100%" stopColor="#1B110A" />
            </radialGradient>
            <filter id={filterId}>
              <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed={shape} />
              <feColorMatrix
                values="0 0 0 0 0.78
                        0 0 0 0 0.6
                        0 0 0 0 0.32
                        0 0 0 0.55 0"
              />
            </filter>
            <radialGradient id={glowId} cx="50%" cy="48%" r="55%">
              <stop offset="0%" stopColor="rgba(229,196,144,0.22)" />
              <stop offset="60%" stopColor="rgba(229,196,144,0)" />
            </radialGradient>
            <clipPath id={clipId}>
              <path d={slice.outline} />
            </clipPath>
          </defs>

          {/* всё рисуется внутри обрезанного контура среза */}
          <g clipPath={`url(#${clipId})`}>
            <rect width="100" height="100" fill={`url(#${bgId})`} />

            {/* годовые кольца — концентрические эллипсы */}
            {slice.rings.map((r, i) => (
              <ellipse
                key={i}
                cx={r.cx}
                cy={r.cy}
                rx={r.rx}
                ry={r.ry}
                transform={`rotate(${r.rot} ${r.cx} ${r.cy})`}
                fill="none"
                stroke="#E5C490"
                strokeWidth={0.25}
                opacity={r.opacity}
              />
            ))}

            {/* шум-текстура поверх (древесная шероховатость) */}
            <rect width="100" height="100" filter={`url(#${filterId})`} opacity="0.45" />

            {/* мягкий glow к центру */}
            <rect width="100" height="100" fill={`url(#${glowId})`} />
          </g>

          {/* тонкая золотая обводка контура — подсвечивается на hover */}
          <path
            d={slice.outline}
            fill="none"
            stroke="rgba(196,146,98,0.45)"
            strokeWidth={0.4}
            className="transition-[stroke,stroke-width] duration-300 group-hover:stroke-[rgba(229,196,144,0.9)] group-hover:[stroke-width:0.6]"
          />
        </svg>

        {/* Контент — отвёрнут обратно чтобы стоял ровно */}
        <div
          className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-3 px-4 py-5"
          style={{ transform: `rotate(calc(${rotate} * -1))` }}
        >
          <div
            className="text-[#E5C490] transition group-hover:scale-110"
            style={{ filter: 'drop-shadow(0 0 8px rgba(229,196,144,0.45))' }}
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
