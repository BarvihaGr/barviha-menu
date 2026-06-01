'use client';

import { useState } from 'react';
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

// ───────────────────── система координат ─────────────────────
const VB_W = 300;
const VB_H = 156;
const GAP = 5; // тонкий шов между деталями

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

// ───────────────────── общий рез между соседями ─────────────────────
// Одна и та же кривая для пары деталей → их края совпадают идеально (пазл).
function cutX(seamX: number, y: number, phase: number, knobY: number, knobDir: number): number {
  const wave = 6 * Math.sin(y * 0.05 + phase) + 2.5 * Math.sin(y * 0.13 + phase * 1.7);
  const knob = knobDir * 14 * Math.exp(-((y - knobY) ** 2) / (2 * 16 ** 2));
  return seamX + wave + knob;
}

const SEAM0 = { x: 106, phase: 0.6, knobY: 70, dir: 1 }; // Кальяны ↔ Кухня
const SEAM1 = { x: 194, phase: 2.1, knobY: 86, dir: 1 }; // Кухня ↔ Бар
const cut0 = (y: number) => cutX(SEAM0.x, y, SEAM0.phase, SEAM0.knobY, SEAM0.dir);
const cut1 = (y: number) => cutX(SEAM1.x, y, SEAM1.phase, SEAM1.knobY, SEAM1.dir);

// область детали (полигон-маска): пересекается с органическим контуром → виден рез
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

const STRIPS = [
  stripLeft((y) => cut0(y) - GAP / 2),
  stripMiddle((y) => cut0(y) + GAP / 2, (y) => cut1(y) - GAP / 2),
  stripRight((y) => cut1(y) + GAP / 2),
];

// ───────────────────── реалистичный срез дерева ─────────────────────
interface Blob {
  outline: string;
  pts: Array<[number, number]>;
  rings: Array<{ d: string; opacity: number; width: number; tone: string }>;
  cracks: string[];
}

/**
 * Срез с эксцентричной сердцевиной. Кольца — масштабные копии контура,
 * стянутые к сердцевине P → реально вложены и сгущаются к краю, как у спила.
 * Контур плавный (низкие гармоники), кольца тонкие, чистые, почти параллельные —
 * не «каляки». Контур заведомо больше шва, лишнее обрежет маска.
 */
function buildBlob(seed: number, O: [number, number], P: [number, number], Rb: number): Blob {
  const rng = mulberry32(seed);
  const ph1 = seed * 0.7;
  const ph2 = seed * 1.3;
  const ph3 = seed * 2.1;
  const [ox, oy] = O;
  const [px, py] = P;

  // плавный округлый контур (без высокочастотной зазубренности)
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

  // годовые кольца — копии контура, стянутые к сердцевине; к краю гуще
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
      // микро-неровность кольца — маленькая и гладкая (не «каляки»)
      const wob = 0.28 * Math.sin(a * 3 + k * 0.6 + seed) + (rngK() - 0.5) * 0.16;
      const dirx = bx - px;
      const diry = by - py;
      const len = Math.hypot(dirx, diry) || 1;
      const rr = f + wob / len;
      d += `${i === 0 ? 'M' : 'L'}${(px + dirx * rr).toFixed(2)},${(py + diry * rr).toFixed(2)} `;
    }
    const late = k % 8 === 0; // имитация «поздней» (тёмной/плотной) древесины года
    rings.push({
      d: d.trim(),
      opacity: Math.min(0.8, 0.32 + 0.34 * (1 - Math.abs(f - 0.5)) + (late ? 0.12 : 0)),
      width: 0.2 + (late ? 0.18 : 0),
      tone: late ? '#C79E63' : k % 2 === 0 ? '#E7C994' : '#DDBE85',
    });
  }

  // радиальные трещины от сердцевины к краю — тонкие, чуть волнистые
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

// хаотичная расстановка: Кухня крупнее и выше, соседи ниже и смещены
const BLOBS: Blob[] = [
  buildBlob(7, [72, 80], [62, 86], 62), // Кальяны
  buildBlob(23, [150, 74], [158, 66], 70), // Кухня
  buildBlob(51, [230, 80], [240, 86], 60), // Бар
];

// сердцевины (для иконок/подписей) и зажимы для кликабельной формы
const PITH: ReadonlyArray<readonly [number, number]> = [
  [62, 86],
  [158, 66],
  [240, 86],
];
const CLAMP: ReadonlyArray<(x: number, y: number) => number> = [
  (x, y) => Math.min(x, cut0(y) - GAP / 2),
  (x, y) => Math.min(Math.max(x, cut0(y) + GAP / 2), cut1(y) - GAP / 2),
  (x, y) => Math.max(x, cut1(y) + GAP / 2),
];

/** clip-path в процентах → кликабельная зона повторяет видимую форму среза и тянется адаптивно. */
function clipFor(i: number): string {
  const clamp = CLAMP[i]!;
  const pts = BLOBS[i]!.pts;
  const out: string[] = [];
  for (let j = 0; j < pts.length; j += 2) {
    const [x, y] = pts[j]!;
    const cx = clamp(x, y);
    out.push(`${((cx / VB_W) * 100).toFixed(2)}% ${((y / VB_H) * 100).toFixed(2)}%`);
  }
  return `polygon(${out.join(', ')})`;
}
const CLIPS = [clipFor(0), clipFor(1), clipFor(2)];

/** Видимый силуэт среза (контур, обрезанный по резу) в координатах SVG — для золотой подсветки на hover. */
function silhouette(i: number): string {
  const clamp = CLAMP[i]!;
  const pts = BLOBS[i]!.pts;
  return (
    pts
      .map(([x, y], j) => `${j === 0 ? 'M' : 'L'}${clamp(x, y).toFixed(2)},${y.toFixed(2)}`)
      .join(' ') + ' Z'
  );
}
const SILHOUETTE = [silhouette(0), silhouette(1), silhouette(2)];

/**
 * Три реалистичных «среза дерева», сложенных в пазл. Вся деталь — кнопка:
 * клик в любое место среза открывает раздел (Link с clip-path по форме).
 */
export function CategoryPuzzleRow({ items }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

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
            {BLOBS.map((b, i) => (
              <clipPath id={`pz-blob-${i}`} key={`b${i}`}>
                <path d={b.outline} />
              </clipPath>
            ))}
            {STRIPS.map((s, i) => (
              <clipPath id={`pz-strip-${i}`} key={`s${i}`}>
                <path d={s} />
              </clipPath>
            ))}
          </defs>

          {BLOBS.map((b, i) => (
            // вложенные клипы = пересечение: органический контур ∩ область реза
            <g key={i} clipPath={`url(#pz-strip-${i})`}>
              <g clipPath={`url(#pz-blob-${i})`}>
                <rect width={VB_W} height={VB_H} fill="url(#pz-bg)" />
                {/* волокна вдоль колец (тонкая древесная текстура) */}
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

                {/* тёмная кора по природному краю (на резе её обрежет strip-клип) */}
                <path d={b.outline} fill="none" stroke="#130B05" strokeWidth={5} opacity={0.6} />
                <path d={b.outline} fill="none" stroke="rgba(196,146,98,0.5)" strokeWidth={0.5} />
              </g>
            </g>
          ))}

          {/* золотой светящийся контур — «прорисовывается» при наведении на деталь */}
          {SILHOUETTE.map((d, i) => (
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
                pathLength: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.25 },
              }}
              style={{
                pointerEvents: 'none',
                filter: 'drop-shadow(0 0 3px rgba(242,214,158,0.95)) drop-shadow(0 0 7px rgba(231,201,148,0.6))',
              }}
            />
          ))}
        </svg>

        {/* Вся деталь — кнопка: clip-path повторяет форму среза */}
        {items.slice(0, 3).map((it, i) => (
          <Link
            key={it.href}
            href={it.href}
            aria-label={it.title}
            className="group absolute inset-0 block transition-[filter] duration-300 hover:brightness-110 focus:outline-none"
            style={{ clipPath: CLIPS[i], WebkitClipPath: CLIPS[i] } as React.CSSProperties}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered((h) => (h === i ? null : h))}
          >
            <span
              className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
              style={{ left: `${(PITH[i]![0] / VB_W) * 100}%`, top: `${(PITH[i]![1] / VB_H) * 100}%` }}
            >
              <span
                className="text-[#E7C994] transition group-hover:scale-110"
                style={{ filter: 'drop-shadow(0 0 8px rgba(231,201,148,0.5))' }}
              >
                {it.icon}
              </span>
              <span
                className="text-center text-[11px] uppercase tracking-[0.25em] font-medium sm:text-sm"
                style={{ color: '#E7C994', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}
              >
                {it.title}
              </span>
            </span>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
