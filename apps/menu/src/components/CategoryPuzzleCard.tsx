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
  /** Кольца теперь — path с дрожанием (как на отпечатке), не идеальные эллипсы. */
  rings: Array<{ path: string; opacity: number; width: number }>;
  cx: number;
  cy: number;
}

/** Минимальная разница углов в радианах [0, π]. */
function angleDist(a: number, b: number) {
  let d = Math.abs(a - b) % (Math.PI * 2);
  if (d > Math.PI) d = Math.PI * 2 - d;
  return d;
}

/**
 * Генератор «среза» с пазловыми бугорками/впадинами.
 *   bumps:   углы (рад), где радиус увеличивается — выпуклость
 *   notches: углы (рад), где радиус уменьшается — впадина
 * Профиль перехода — плавный (cos easing), ширина зоны ~0.35 рад.
 */
function buildSlice(seed: number, bumps: number[] = [], notches: number[] = []): SliceData {
  const rng = mulberry32(seed);
  const cx = 50 + (rng() - 0.5) * 4;
  const cy = 52 + (rng() - 0.5) * 4;

  const radiusAt = (a: number, base: number, jitter = 0): number => {
    let r = base + Math.sin(a + seed * 0.7) * 2 + Math.sin(a * 3 + seed * 1.1) * 1.6;
    r += Math.sin(a * 7 + seed * 1.7) * 0.9 + Math.sin(a * 15 + seed * 0.5) * 0.45;
    r += jitter;
    // пазловые искажения
    const ZONE = 0.5;
    const AMP = 8;
    for (const bA of bumps) {
      const d = angleDist(a, bA);
      if (d < ZONE) r += AMP * Math.cos((d / ZONE) * (Math.PI / 2));
    }
    for (const nA of notches) {
      const d = angleDist(a, nA);
      if (d < ZONE) r -= AMP * Math.cos((d / ZONE) * (Math.PI / 2));
    }
    return r;
  };

  // Контур: 60 точек со средним радиусом ~40 + пазловые бугры/впадины
  const N = 60;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = radiusAt(a, 40, (rng() - 0.5) * 1.4);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 1.05]);
  }
  const outline =
    pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ') + ' Z';

  // Кольца — 48 штук, каждое сделано как path из 64 точек с шумом,
  // → не идеальные эллипсы, а реально «дрожащие» кольца как на отпечатке.
  const rings: SliceData['rings'] = [];
  const RING_PTS = 64;
  for (let k = 1; k <= 48; k++) {
    const t = k / 48;
    const ringR = 2 + t * 36; // от 2 до 38 — внутри среза
    const eccent = 1.0 + Math.sin(k * 0.4 + seed) * 0.08; // лёгкий эксцентриситет
    const rng2 = mulberry32(seed * 100 + k);
    let path = '';
    for (let i = 0; i <= RING_PTS; i++) {
      const a = (i / RING_PTS) * Math.PI * 2;
      // микро-шум по радиусу — кольцо «дрожит»
      const wobble =
        Math.sin(a * 5 + k * 1.3 + seed) * 0.35 +
        Math.sin(a * 11 + k * 0.7) * 0.18 +
        (rng2() - 0.5) * 0.45;
      const rk = ringR + wobble;
      const x = cx + Math.cos(a) * rk;
      const y = cy + Math.sin(a) * rk * eccent;
      path += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)} `;
    }
    // opacity и толщина варьируются — повторяет неровную плотность отпечатка
    const opacity =
      0.24 + (1 - Math.abs(t - 0.55)) * 0.38 + (k % 4 === 0 ? 0.12 : 0) - (k % 7 === 0 ? 0.06 : 0);
    const width = 0.2 + (k % 5 === 0 ? 0.14 : 0);
    rings.push({ path: path.trim(), opacity: Math.min(0.72, opacity), width });
  }

  return { outline, rings, cx, cy };
}

// 3 слота слева-направо: Кальяны | Кухня | Бар.
// Углы: 0 = справа, π = слева.
// — Кальяны: бугор справа (соединяется с Кухней)
// — Кухня:   впадина слева (принимает Кальяны), бугор справа (соединяется с Баром)
// — Бар:     впадина слева (принимает Кухню)
const SLICES: SliceData[] = [
  buildSlice(7, [0], []),
  buildSlice(31, [0], [Math.PI]),
  buildSlice(53, [], [Math.PI]),
];

/**
 * Карточка-«срез дерева».
 *
 * SVG целиком: контур с пазловыми буграми/впадинами + 48 «дрожащих»
 * годовых колец (path с шумом, как на отпечатке) + шум-текстура
 * (feTurbulence). Над SVG — иконка и подпись золотом. Каждый shape — свой
 * сид: рендер уникален.
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
      className={cn('relative', OFFSET_MAP[offsetY])}
      style={{ transform: `rotate(${rotate})` }}
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
          className="absolute inset-0 h-full w-full overflow-visible transition-[filter] duration-300"
          style={{ filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.55))' }}
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

            {/* годовые кольца — «дрожащие» path с шумом, как на реальном отпечатке */}
            {slice.rings.map((r, i) => (
              <path
                key={i}
                d={r.path}
                fill="none"
                stroke="#E5C490"
                strokeWidth={r.width}
                opacity={r.opacity}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* шум-текстура поверх (древесная шероховатость) */}
            <rect width="100" height="100" filter={`url(#${filterId})`} opacity="0.45" />

            {/* мягкий glow к центру */}
            <rect width="100" height="100" fill={`url(#${glowId})`} />

            {/* тёмный обод-«кора» по краю среза — даёт объём и отделяет от фона */}
            <path
              d={slice.outline}
              fill="none"
              stroke="#160D07"
              strokeWidth={7}
              opacity={0.55}
            />
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
