'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';

export interface PuzzleItem {
  href: string;
  title: string;
  icon: React.ReactNode;
}

interface Props {
  /** Ровно 3 элемента, порядок слева-направо: Кальяны | Кухня | Бар. */
  items: PuzzleItem[];
}

// ───────────────────── геометрия пазла ─────────────────────
// Все три среза живут в ОДНОЙ системе координат одного SVG —
// поэтому бугор одной детали гарантированно входит во впадину соседней.
const R = 38; // базовый радиус среза
const AMP = 15; // глубина бугра / впадины
const ZONE = 0.62; // угловая ширина зоны стыка (рад)
const CY = 58; // общая вертикальная ось всех срезов (стык всегда на ней)
const CX = [56, 128, 200]; // центры: шаг 72 < 2R=76 → детали слегка перекрываются на стыке
const VB_W = 256;
const VB_H = 116;

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

/** Минимальная разница углов в радианах [0, π]. */
function angleDist(a: number, b: number) {
  let d = Math.abs(a - b) % (Math.PI * 2);
  if (d > Math.PI) d = Math.PI * 2 - d;
  return d;
}

interface SliceData {
  outline: string;
  rings: Array<{ path: string; opacity: number; width: number }>;
}

/**
 * Один «срез» в координатах общего SVG.
 *   bumps   — углы (рад), где радиус растёт (выпуклость = «деталька»)
 *   notches — углы (рад), где радиус падает («срез под детальку»)
 * 0 = направо, π = налево. Органический шум контура у стыков гасится,
 * чтобы сопрягаемые поверхности совпадали.
 */
function buildSlice(seed: number, cx: number, bumps: number[], notches: number[]): SliceData {
  const cy = CY;

  const radiusAt = (a: number, jitter = 0): number => {
    let organic =
      Math.sin(a + seed * 0.7) * 1.8 +
      Math.sin(a * 3 + seed * 1.1) * 1.3 +
      Math.sin(a * 7 + seed * 1.7) * 0.7 +
      Math.sin(a * 15 + seed * 0.5) * 0.35 +
      jitter;

    let joint = 0;
    let nearJoint = 0; // 1 в центре стыка → 0 на краю зоны
    for (const bA of bumps) {
      const d = angleDist(a, bA);
      if (d < ZONE) {
        const w = Math.cos((d / ZONE) * (Math.PI / 2));
        joint += AMP * w;
        nearJoint = Math.max(nearJoint, w);
      }
    }
    for (const nA of notches) {
      const d = angleDist(a, nA);
      if (d < ZONE) {
        const w = Math.cos((d / ZONE) * (Math.PI / 2));
        joint -= AMP * w;
        nearJoint = Math.max(nearJoint, w);
      }
    }
    // у стыка контур почти гладкий → бугор и впадина совпадают
    organic *= 1 - 0.75 * nearJoint;
    return R + organic + joint;
  };

  const rng = mulberry32(seed);
  const N = 72;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = radiusAt(a, (rng() - 0.5) * 1.2);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 1.04]);
  }
  const outline =
    pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ') + ' Z';

  // годовые кольца — «дрожащие» path с шумом
  const rings: SliceData['rings'] = [];
  const RING_PTS = 64;
  for (let k = 1; k <= 46; k++) {
    const t = k / 46;
    const ringR = 2 + t * 34;
    const eccent = 1.0 + Math.sin(k * 0.4 + seed) * 0.08;
    const rng2 = mulberry32(seed * 100 + k);
    let path = '';
    for (let i = 0; i <= RING_PTS; i++) {
      const a = (i / RING_PTS) * Math.PI * 2;
      const wobble =
        Math.sin(a * 5 + k * 1.3 + seed) * 0.35 +
        Math.sin(a * 11 + k * 0.7) * 0.18 +
        (rng2() - 0.5) * 0.45;
      const rk = ringR + wobble;
      path += `${i === 0 ? 'M' : 'L'}${(cx + Math.cos(a) * rk).toFixed(2)},${(cy + Math.sin(a) * rk * eccent).toFixed(2)} `;
    }
    const opacity =
      0.24 + (1 - Math.abs(t - 0.55)) * 0.38 + (k % 4 === 0 ? 0.12 : 0) - (k % 7 === 0 ? 0.06 : 0);
    const width = 0.2 + (k % 5 === 0 ? 0.14 : 0);
    rings.push({ path: path.trim(), opacity: Math.min(0.72, opacity), width });
  }

  return { outline, rings };
}

// Кальяны: бугор справа → Кухня: впадина слева + бугор справа → Бар: впадина слева
const SLICES: SliceData[] = [
  buildSlice(7, CX[0]!, [0], []),
  buildSlice(31, CX[1]!, [0], [Math.PI]),
  buildSlice(53, CX[2]!, [], [Math.PI]),
];

/**
 * Три «среза дерева», сложенные в единый пазл (один SVG → стык точный).
 * Поверх SVG — кликабельный оверлей с иконкой и подписью на каждую деталь.
 */
export function CategoryPuzzleRow({ items }: Props) {
  // левая деталь рисуется ПОВЕРХ правой, чтобы её бугор «входил» во впадину соседа
  const order = [2, 1, 0];

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="block h-auto w-full overflow-visible"
          style={{ filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.55))' }}
          aria-hidden
        >
          <defs>
            <radialGradient id="puzzle-bg" cx="50%" cy="50%" r="62%">
              <stop offset="0%" stopColor="#3B2A20" />
              <stop offset="60%" stopColor="#2A1B11" />
              <stop offset="100%" stopColor="#1B110A" />
            </radialGradient>
            <radialGradient id="puzzle-glow" cx="50%" cy="48%" r="55%">
              <stop offset="0%" stopColor="rgba(229,196,144,0.22)" />
              <stop offset="60%" stopColor="rgba(229,196,144,0)" />
            </radialGradient>
            <filter id="puzzle-grain">
              <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="11" />
              <feColorMatrix
                values="0 0 0 0 0.78
                        0 0 0 0 0.6
                        0 0 0 0 0.32
                        0 0 0 0.5 0"
              />
            </filter>
            {SLICES.map((s, i) => (
              <clipPath id={`puzzle-clip-${i}`} key={i}>
                <path d={s.outline} />
              </clipPath>
            ))}
          </defs>

          {order.map((i) => {
            const s = SLICES[i]!;
            return (
              <g key={i}>
                <g clipPath={`url(#puzzle-clip-${i})`}>
                  <rect width={VB_W} height={VB_H} fill="url(#puzzle-bg)" />
                  {s.rings.map((r, k) => (
                    <path
                      key={k}
                      d={r.path}
                      fill="none"
                      stroke="#E5C490"
                      strokeWidth={r.width}
                      opacity={r.opacity}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                  <rect width={VB_W} height={VB_H} filter="url(#puzzle-grain)" opacity="0.4" />
                  <rect width={VB_W} height={VB_H} fill="url(#puzzle-glow)" />
                  {/* тёмный обод-«кора» по краю — объём + отделение от соседа */}
                  <path d={s.outline} fill="none" stroke="#160D07" strokeWidth={6} opacity={0.6} />
                </g>
                {/* тонкая золотая обводка контура */}
                <path
                  d={s.outline}
                  fill="none"
                  stroke="rgba(196,146,98,0.45)"
                  strokeWidth={0.4}
                />
              </g>
            );
          })}
        </svg>

        {/* кликабельный оверлей: иконка + подпись по центру каждой детали */}
        {items.slice(0, 3).map((it, i) => (
          <Link
            key={it.href}
            href={it.href}
            className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-2 focus:outline-none"
            style={{
              left: `${(CX[i]! / VB_W) * 100}%`,
              top: '50%',
              width: '26%',
            }}
          >
            <span
              className="text-[#E5C490] transition group-hover:scale-110"
              style={{ filter: 'drop-shadow(0 0 8px rgba(229,196,144,0.45))' }}
            >
              {it.icon}
            </span>
            <span
              className="text-center text-[11px] uppercase tracking-[0.25em] font-medium sm:text-sm"
              style={{ color: '#E5C490' }}
            >
              {it.title}
            </span>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
