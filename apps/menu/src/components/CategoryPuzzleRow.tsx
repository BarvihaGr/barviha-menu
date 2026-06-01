'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';
import {
  DEFAULT_LAYOUT,
  getPuzzleLayout,
  type PuzzleLayout,
  type Seam,
  type BlobConfig,
} from '@/lib/puzzle-layout';

export interface PuzzleItem {
  href: string;
  title: string;
  icon: React.ReactNode;
}

interface Props {
  /** Ровно 3 элемента, порядок слева-направо: Кальяны | Кухня | Бар. */
  items: PuzzleItem[];
  /**
   * Slug локации — определяет уникальную посадку пазла.
   * Если не передан, используется DEFAULT_LAYOUT (как Арка).
   */
  locationSlug?: string;
}

// ───────────────────── система координат ─────────────────────
const VB_W = 300;
const VB_H = 156;
const GAP = 5;

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

// ───────────────────── рез между соседями ─────────────────────
function makeCutFn(seam: Seam) {
  return (y: number): number => {
    const wave = 6 * Math.sin(y * 0.05 + seam.phase) + 2.5 * Math.sin(y * 0.13 + seam.phase * 1.7);
    const knob = seam.dir * 14 * Math.exp(-((y - seam.knobY) ** 2) / (2 * 16 ** 2));
    return seam.x + wave + knob;
  };
}

const YS: number[] = [];
for (let y = -8; y <= VB_H + 8; y += 3) YS.push(y);

function stripLeft(rightFn: (y: number) => number): string {
  let d = `M ${-40},${-8} `;
  for (const y of YS) d += `L ${rightFn(y).toFixed(2)},${y} `;
  d += `L ${-40},${VB_H + 8} Z`;
  return d;
}
function stripRight(leftFn: (y: number) => number): string {
  let d = `M ${VB_W + 40},${-8} `;
  for (const y of YS) d += `L ${leftFn(y).toFixed(2)},${y} `;
  d += `L ${VB_W + 40},${VB_H + 8} Z`;
  return d;
}
function stripMiddle(leftFn: (y: number) => number, rightFn: (y: number) => number): string {
  let d = '';
  YS.forEach((y, i) => (d += `${i === 0 ? 'M' : 'L'} ${leftFn(y).toFixed(2)},${y} `));
  for (let i = YS.length - 1; i >= 0; i--) d += `L ${rightFn(YS[i]!).toFixed(2)},${YS[i]} `;
  return d + 'Z';
}

// ───────────────────── реалистичный срез дерева ─────────────────────
interface Blob {
  outline: string;
  pts: Array<[number, number]>;
  rings: Array<{ d: string; opacity: number; width: number; tone: string }>;
  cracks: string[];
}

function buildBlob(seed: number, cfg: BlobConfig): Blob {
  const rng = mulberry32(seed);
  const ph1 = seed * 0.7;
  const ph2 = seed * 1.3;
  const ph3 = seed * 2.1;
  const [ox, oy] = cfg.O;
  const [px, py] = cfg.P;
  const Rb = cfg.Rb;

  const Rout = (a: number) =>
    Rb *
    (1 +
      0.13 * Math.sin(a + ph1) +
      0.07 * Math.sin(a * 2 + ph2) +
      0.035 * Math.sin(a * 3 + ph3));

  const STEPS = 120;
  const B: Array<[number, number]> = [];
  for (let i = 0; i < STEPS; i++) {
    const a = (i / STEPS) * Math.PI * 2;
    const r = Rout(a);
    B.push([ox + Math.cos(a) * r, oy + Math.sin(a) * r * 1.02]);
  }
  const outline =
    B.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ') + ' Z';

  const rings: Blob['rings'] = [];
  let f = 0.03;
  for (let k = 1; k <= 96 && f < 0.985; k++) {
    const step = 0.0065 + 0.0125 * (1 - f) + (rng() - 0.5) * 0.0016;
    f = Math.min(0.985, f + step);
    const rngK = mulberry32(seed * 131 + k);
    let d = '';
    for (let i = 0; i <= STEPS; i++) {
      const idx = i % STEPS;
      const a = (i / STEPS) * Math.PI * 2;
      const bx = B[idx]![0];
      const by = B[idx]![1];
      const wob = 0.28 * Math.sin(a * 3 + k * 0.6 + seed) + (rngK() - 0.5) * 0.16;
      const dirx = bx - px;
      const diry = by - py;
      const len = Math.hypot(dirx, diry) || 1;
      const rr = f + wob / len;
      d += `${i === 0 ? 'M' : 'L'}${(px + dirx * rr).toFixed(2)},${(py + diry * rr).toFixed(2)} `;
    }
    const late = k % 8 === 0;
    rings.push({
      d: d.trim(),
      opacity: Math.min(0.8, 0.32 + 0.34 * (1 - Math.abs(f - 0.5)) + (late ? 0.12 : 0)),
      width: 0.2 + (late ? 0.18 : 0),
      tone: late ? '#C79E63' : k % 2 === 0 ? '#E7C994' : '#DDBE85',
    });
  }

  const cracks: string[] = [];
  const crackCount = 2 + Math.floor(rng() * 2);
  for (let c = 0; c < crackCount; c++) {
    const a = (c / crackCount) * Math.PI * 2 + (rng() - 0.5) * 0.9;
    const idx = ((Math.round((a / (Math.PI * 2)) * STEPS) % STEPS) + STEPS) % STEPS;
    const bx = B[idx]![0];
    const by = B[idx]![1];
    const seg = 6;
    let d = `M${px.toFixed(2)},${py.toFixed(2)}`;
    for (let s = 1; s <= seg; s++) {
      const tt = (s / seg) * (0.8 + rng() * 0.18);
      const nx = -(by - py);
      const ny = bx - px;
      const nl = Math.hypot(nx, ny) || 1;
      const wob = (rng() - 0.5) * 2.6 * tt;
      const x = px + (bx - px) * tt + (nx / nl) * wob;
      const y = py + (by - py) * tt + (ny / nl) * wob;
      d += ` L${x.toFixed(2)},${y.toFixed(2)}`;
    }
    cracks.push(d);
  }

  return { outline, pts: B, rings, cracks };
}

interface BuiltLayout {
  layout: PuzzleLayout;
  blobs: [Blob, Blob, Blob];
  strips: [string, string, string];
  silhouettes: [string, string, string];
  pith: ReadonlyArray<readonly [number, number]>;
  zones: Array<{ left: number; width: number }>;
}

function buildLayout(layout: PuzzleLayout): BuiltLayout {
  const cut0 = makeCutFn(layout.seams[0]);
  const cut1 = makeCutFn(layout.seams[1]);

  const blobs: [Blob, Blob, Blob] = [
    buildBlob(7, layout.blobs[0]),
    buildBlob(23, layout.blobs[1]),
    buildBlob(51, layout.blobs[2]),
  ];

  const strips: [string, string, string] = [
    stripLeft((y) => cut0(y) - GAP / 2),
    stripMiddle(
      (y) => cut0(y) + GAP / 2,
      (y) => cut1(y) - GAP / 2,
    ),
    stripRight((y) => cut1(y) + GAP / 2),
  ];

  const clamps: ((x: number, y: number) => number)[] = [
    (x, y) => Math.min(x, cut0(y) - GAP / 2),
    (x, y) => Math.min(Math.max(x, cut0(y) + GAP / 2), cut1(y) - GAP / 2),
    (x, y) => Math.max(x, cut1(y) + GAP / 2),
  ];

  const silhouettes = [0, 1, 2].map((i) => {
    const clamp = clamps[i]!;
    const pts = blobs[i]!.pts;
    return (
      pts
        .map(([x, y], j) => `${j === 0 ? 'M' : 'L'}${clamp(x, y).toFixed(2)},${y.toFixed(2)}`)
        .join(' ') + ' Z'
    );
  }) as [string, string, string];

  // сердцевина = pith из cfg (визуально это центр иконки/подписи)
  const pith = layout.blobs.map((b) => b.P as readonly [number, number]);

  const zones = [
    { left: 0, width: (layout.seams[0].x / VB_W) * 100 },
    {
      left: (layout.seams[0].x / VB_W) * 100,
      width: ((layout.seams[1].x - layout.seams[0].x) / VB_W) * 100,
    },
    {
      left: (layout.seams[1].x / VB_W) * 100,
      width: ((VB_W - layout.seams[1].x) / VB_W) * 100,
    },
  ];

  return { layout, blobs, strips, silhouettes, pith, zones };
}

/**
 * Три реалистичных «среза дерева», сложенных в пазл.
 *
 * Каждая локация получает уникальную композицию: швы, центры и размеры
 * срезов рандомизируются детерминированно от `locationSlug`. У одной точки
 * Кухня крупнее, у другой Бар наклонён иначе, у третьей бугры пазла идут
 * наоборот — общий «фирменный стиль» сохраняется, но 27 вариаций.
 */
export function CategoryPuzzleRow({ items, locationSlug }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  const built = useMemo(
    () => buildLayout(locationSlug ? getPuzzleLayout(locationSlug) : DEFAULT_LAYOUT),
    [locationSlug],
  );

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="block h-auto w-full overflow-visible"
          style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))' }}
          aria-hidden
        >
          <defs>
            <radialGradient id="pz-bg" cx="50%" cy="48%" r="62%">
              <stop offset="0%" stopColor="#402E21" />
              <stop offset="55%" stopColor="#2A1B11" />
              <stop offset="100%" stopColor="#180E07" />
            </radialGradient>
            <radialGradient id="pz-glow" cx="50%" cy="46%" r="52%">
              <stop offset="0%" stopColor="rgba(231,201,148,0.18)" />
              <stop offset="65%" stopColor="rgba(231,201,148,0)" />
            </radialGradient>
            <filter id="pz-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.9" numOctaves="3" seed="11" />
              <feColorMatrix
                values="0 0 0 0 0.72
                        0 0 0 0 0.54
                        0 0 0 0 0.30
                        0 0 0 0.5 0"
              />
            </filter>
            {built.blobs.map((b, i) => (
              <clipPath id={`pz-blob-${i}`} key={`b${i}`}>
                <path d={b.outline} />
              </clipPath>
            ))}
            {built.strips.map((s, i) => (
              <clipPath id={`pz-strip-${i}`} key={`s${i}`}>
                <path d={s} />
              </clipPath>
            ))}
          </defs>

          {built.blobs.map((b, i) => (
            <g key={i} clipPath={`url(#pz-strip-${i})`}>
              <g clipPath={`url(#pz-blob-${i})`}>
                <rect width={VB_W} height={VB_H} fill="url(#pz-bg)" />
                <rect width={VB_W} height={VB_H} filter="url(#pz-grain)" opacity="0.22" />

                {b.rings.map((r, k) => (
                  <path
                    key={k}
                    d={r.d}
                    fill="none"
                    stroke={r.tone}
                    strokeWidth={r.width}
                    opacity={r.opacity}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}

                {b.cracks.map((d, k) => (
                  <path
                    key={`c${k}`}
                    d={d}
                    fill="none"
                    stroke="#140B05"
                    strokeWidth={0.8}
                    opacity={0.75}
                    strokeLinecap="round"
                  />
                ))}

                <rect width={VB_W} height={VB_H} fill="url(#pz-glow)" />

                <path d={b.outline} fill="none" stroke="#130B05" strokeWidth={5} opacity={0.6} />
                <path d={b.outline} fill="none" stroke="rgba(196,146,98,0.5)" strokeWidth={0.5} />
              </g>
            </g>
          ))}

          {built.silhouettes.map((d, i) => (
            <motion.path
              key={`glow${i}`}
              d={d}
              fill="none"
              stroke="#F2D69E"
              strokeWidth={1.4}
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={false}
              animate={hovered === i ? { opacity: 1, pathLength: 1 } : { opacity: 0, pathLength: 0 }}
              transition={{
                pathLength: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.18 },
              }}
              style={{
                pointerEvents: 'none',
                filter:
                  'drop-shadow(0 0 3px rgba(242,214,158,0.95)) drop-shadow(0 0 7px rgba(231,201,148,0.6))',
              }}
            />
          ))}
        </svg>

        {items.slice(0, 3).map((it, i) => (
          <div
            key={`v${i}`}
            className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
            style={{
              left: `${(built.pith[i]![0] / VB_W) * 100}%`,
              top: `${(built.pith[i]![1] / VB_H) * 100}%`,
            }}
          >
            <span
              className="text-[#E7C994] transition-transform duration-300"
              style={{
                transform: hovered === i ? 'scale(1.12)' : 'scale(1)',
                filter: 'drop-shadow(0 0 8px rgba(231,201,148,0.5))',
              }}
            >
              {it.icon}
            </span>
            <span
              className="text-center text-[11px] uppercase tracking-[0.25em] font-medium sm:text-sm"
              style={{ color: '#E7C994', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}
            >
              {it.title}
            </span>
          </div>
        ))}

        {items.slice(0, 3).map((it, i) => (
          <Link
            key={it.href}
            href={it.href}
            prefetch
            aria-label={it.title}
            className="absolute bottom-0 top-0 block focus:outline-none"
            style={{ left: `${built.zones[i]!.left}%`, width: `${built.zones[i]!.width}%` }}
            onPointerEnter={() => setHovered(i)}
            onPointerDown={() => setHovered(i)}
            onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered((h) => (h === i ? null : h))}
          />
        ))}
      </motion.div>
    </div>
  );
}
