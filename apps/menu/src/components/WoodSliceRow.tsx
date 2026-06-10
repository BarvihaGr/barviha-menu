'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';

/**
 * Три отдельных «спила бревна» — реалистичные срезы дерева в духе
 * релиф-принтов годовых колец (стиль Bryan Nash Gill), в тёплой
 * палитре Барвихи.
 *
 * Не пазл: каждый срез самостоятельный. Неошкуренное бревно — грубая
 * рваная кора по краю. Полная структура: сотни тончайших годовых колец,
 * повторяющих органичный контур, смещённая сердцевина, звезда трещин
 * усушки из центра. Видна толщина спила и контактная тень — объём, как
 * у настоящего куска дерева.
 *
 * Всё процедурно и детерминировано от (locationSlug + индекс) →
 * SSR-стабильно, у каждой локации свои спилы «из одного бревна».
 */
export interface WoodSliceItem {
  href: string;
  title: string;
}

interface Props {
  items: WoodSliceItem[];
  locationSlug?: string;
}

const W = 240;
const H = 276;
const CX = 120;
const CY = 110;
const R = 96;
const KY = 0.95;
const DEPTH = 34;
const STEPS = 160; // точки контура
const RING_STRIDE = 2; // кольца семплируем реже контура (≈80 точек) — экономим payload

function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

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

function pathOf(pts: Array<[number, number]>, close: boolean, prec = 2): string {
  let d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(prec)},${p[1].toFixed(prec)}`).join('');
  if (close) d += 'Z';
  return d;
}

interface Round {
  bark: string;
  barkInner: string;
  band: string;
  side: string;
  rimSeam: string;
  rings: Array<{ d: string; late: boolean; o: number }>;
  cracks: string[];
  pith: [number, number];
}

function buildRound(seed: number): Round {
  const rng = mulberry32(seed);
  const ph = [0, 0, 0, 0, 0, 0, 0].map(() => rng() * 6.283);
  const A2 = 0.1 + rng() * 0.05;
  const A3 = 0.08 + rng() * 0.05;
  const A5 = 0.05 + rng() * 0.03;
  const A7 = 0.03 + rng() * 0.025;
  const A11 = 0.02 + rng() * 0.02;
  const pa = rng() * 6.283;
  const pr = R * (0.18 + rng() * 0.16);
  const pith: [number, number] = [CX + Math.cos(pa) * pr, CY + Math.sin(pa) * pr * KY];
  const jitter: number[] = [];
  for (let i = 0; i < STEPS; i++) jitter.push(rng() - 0.5);

  const Rout = (a: number, i: number) =>
    R *
    (1 +
      A2 * Math.sin(2 * a + ph[0]!) +
      A3 * Math.sin(3 * a + ph[1]!) +
      A5 * Math.sin(5 * a + ph[2]!) +
      A7 * Math.sin(7 * a + ph[3]!) +
      A11 * Math.sin(11 * a + ph[4]!) +
      0.018 * jitter[i]! +
      0.012 * Math.sin(a * 23 + ph[5]!));

  const outer: Array<[number, number]> = [];
  const inner: Array<[number, number]> = [];
  for (let i = 0; i < STEPS; i++) {
    const a = (i / STEPS) * 6.283;
    const ro = Rout(a, i);
    const ox = CX + Math.cos(a) * ro;
    const oy = CY + Math.sin(a) * ro * KY;
    outer.push([ox, oy]);
    const bw = R * (0.06 + 0.055 * (0.5 + 0.5 * Math.sin(a * 4 + ph[1]!)) + 0.03 * Math.abs(jitter[i]!));
    const dx = CX - ox;
    const dy = CY - oy;
    const dl = Math.hypot(dx, dy) || 1;
    inner.push([ox + (dx / dl) * bw, oy + (dy / dl) * bw]);
  }

  const bark = pathOf(outer, true);
  const barkInner = pathOf(inner, true);
  const band = `${bark}${barkInner}`;

  const half = Math.floor(STEPS / 2);
  const bottom = outer.slice(0, half + 1);
  let side = pathOf(bottom, false);
  for (let i = bottom.length - 1; i >= 0; i--) {
    side += `L${bottom[i]![0].toFixed(2)},${(bottom[i]![1] + DEPTH).toFixed(2)}`;
  }
  side += 'Z';
  const rimSeam = pathOf(bottom, false);

  // плотные тонкие кольца, повторяющие контур, сходятся к сердцевине
  const rings: Round['rings'] = [];
  const N = 120 + Math.floor(rng() * 45);
  for (let k = 1; k <= N; k++) {
    const base = 0.055 + (0.94 * k) / (N + 1);
    const f = Math.min(0.99, base + 0.01 * Math.sin(k * 0.6 + seed) + (mulberry32(seed * 7 + k)() - 0.5) * 0.003);
    const rk = mulberry32(seed * 131 + k);
    const damp = Math.min(1, f * 2.2);
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= STEPS; i += RING_STRIDE) {
      const idx = i % STEPS;
      const a = (i / STEPS) * 6.283;
      const wob = (0.005 * Math.sin(a * 4 + k * 0.5 + seed) + (rk() - 0.5) * 0.006) * damp;
      const bx = inner[idx]![0];
      const by = inner[idx]![1];
      const rr = Math.min(0.997, f + wob);
      pts.push([pith[0] + (bx - pith[0]) * rr, pith[1] + (by - pith[1]) * rr]);
    }
    pts.push(pts[0]!);
    rings.push({
      d: pathOf(pts, false, 1),
      late: k % 9 === 0,
      o: Math.min(0.92, 0.6 + 0.32 * (1 - Math.abs(f - 0.5))),
    });
  }

  // звезда радиальных трещин усушки из сердцевины
  const cracks: string[] = [];
  const cN = 4 + Math.floor(rng() * 3);
  const baseAng = rng() * 6.283;
  for (let c = 0; c < cN; c++) {
    const a = baseAng + (c / cN) * 6.283 + (rng() - 0.5) * 0.5;
    const idx = ((Math.round((a / 6.283) * STEPS) % STEPS) + STEPS) % STEPS;
    const ex = inner[idx]![0];
    const ey = inner[idx]![1];
    const seg = 8;
    const nx = -(ey - pith[1]);
    const ny = ex - pith[0];
    const nl = Math.hypot(nx, ny) || 1;
    const reach = 0.6 + rng() * 0.38;
    let d = `M${pith[0].toFixed(2)},${pith[1].toFixed(2)}`;
    for (let s = 1; s <= seg; s++) {
      const tt = (s / seg) * reach;
      const wob = (rng() - 0.5) * 2.4 * tt;
      const x = pith[0] + (ex - pith[0]) * tt + (nx / nl) * wob;
      const y = pith[1] + (ey - pith[1]) * tt + (ny / nl) * wob;
      d += `L${x.toFixed(1)},${y.toFixed(1)}`;
    }
    cracks.push(d);
  }

  return { bark, barkInner, band, side, rimSeam, rings, cracks, pith };
}

function Slice({ round, i, hovered }: { round: Round; i: number; hovered: boolean }) {
  const u = `ws${i}`;
  const [px, py] = round.pith;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" aria-hidden>
      <defs>
        <radialGradient id={`${u}-f`} cx={px} cy={py} r={R} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4a2f19" />
          <stop offset="55%" stopColor="#7a5230" />
          <stop offset="100%" stopColor="#9c6a3a" />
        </radialGradient>
        <linearGradient id={`${u}-s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34230f" />
          <stop offset="100%" stopColor="#120b05" />
        </linearGradient>
        <radialGradient id={`${u}-b`} cx={CX} cy={CY} r={R} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2a1b0e" />
          <stop offset="100%" stopColor="#160d06" />
        </radialGradient>
        <radialGradient id={`${u}-hi`} cx="40%" cy="30%" r="72%">
          <stop offset="0%" stopColor="rgba(255,244,214,0.18)" />
          <stop offset="55%" stopColor="rgba(255,244,214,0)" />
        </radialGradient>
        <filter id={`${u}-bt`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.5" numOctaves="3" seed={i * 7 + 3} />
          <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.07  0 0 0 0 0.04  0 0 0 0.9 0" />
        </filter>
        <filter id={`${u}-st`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.95 0.06" numOctaves="3" seed={i * 5 + 1} />
          <feColorMatrix values="0 0 0 0 0.08  0 0 0 0 0.05  0 0 0 0 0.03  0 0 0 0.8 0" />
        </filter>
        <clipPath id={`${u}-ci`}>
          <path d={round.barkInner} />
        </clipPath>
        <clipPath id={`${u}-cb`}>
          <path d={round.bark} />
        </clipPath>
        <clipPath id={`${u}-cs`}>
          <path d={round.side} />
        </clipPath>
        <clipPath id={`${u}-cband`}>
          <path d={round.band} clipRule="evenodd" />
        </clipPath>
      </defs>

      {/* контактная тень */}
      <ellipse cx={CX} cy={CY + DEPTH + 24} rx={R * 0.84} ry={15} fill="rgba(0,0,0,0.55)" />

      {/* бок бревна (толщина) */}
      <g>
        <path d={round.side} fill={`url(#${u}-s)`} />
        <g clipPath={`url(#${u}-cs)`}>
          <rect width={W} height={H} filter={`url(#${u}-st)`} opacity="0.5" />
        </g>
        <path d={round.side} fill="none" stroke="#0a0602" strokeWidth="1" opacity="0.7" />
        <path d={round.rimSeam} fill="none" stroke="#7a5230" strokeWidth="2.2" opacity="0.5" />
      </g>

      {/* верхняя плоскость */}
      <g clipPath={`url(#${u}-cb)`}>
        <path d={round.bark} fill={`url(#${u}-f)`} />

        <g clipPath={`url(#${u}-ci)`}>
          {round.rings.map((r, k) => (
            <path
              key={k}
              d={r.d}
              fill="none"
              stroke={r.late ? '#2e1c0e' : r.o > 0.8 ? '#ecd9af' : '#d8bd87'}
              strokeWidth={r.late ? 0.6 : 0.38}
              opacity={r.o}
            />
          ))}
          {round.cracks.map((d, k) => (
            <path
              key={`c${k}`}
              d={d}
              fill="none"
              stroke="#160d05"
              strokeWidth="1.4"
              opacity="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>

        {/* кора (грейн только в пределах коры) */}
        <path d={round.band} fillRule="evenodd" fill={`url(#${u}-b)`} />
        <g clipPath={`url(#${u}-cband)`}>
          <rect width={W} height={H} filter={`url(#${u}-bt)`} opacity="0.6" />
        </g>
        {/* камбий */}
        <path d={round.barkInner} fill="none" stroke="rgba(236,217,175,0.4)" strokeWidth="0.6" />
        {/* верхний свет */}
        <rect width={W} height={H} fill={`url(#${u}-hi)`} />
      </g>

      {/* шов плоскость↔бок */}
      <path d={round.rimSeam} fill="none" stroke="#0a0602" strokeWidth="1.3" opacity="0.5" />

      {/* золотая подсветка при наведении */}
      <motion.path
        d={round.bark}
        fill="none"
        stroke="#F2D69E"
        strokeWidth={1.8}
        strokeLinejoin="round"
        initial={false}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.22 }}
        style={{
          pointerEvents: 'none',
          filter:
            'drop-shadow(0 0 1.5px rgba(242,214,158,0.95)) drop-shadow(0 0 5px rgba(231,201,148,0.6))',
        }}
      />
    </svg>
  );
}

export function WoodSliceRow({ items, locationSlug }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const rounds = useMemo(() => {
    const base = hashStr(locationSlug ?? 'default');
    return [0, 1, 2].map((i) => buildRound((base * 2654435761 + (i + 1) * 40503) >>> 0));
  }, [locationSlug]);

  return (
    <div className="mx-auto flex w-full max-w-3xl items-end justify-center gap-2 px-1 sm:gap-6 sm:px-4">
      {items.slice(0, 3).map((it, i) => (
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
            className="w-full"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.05, y: -4 }}
            style={{ filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.45))' }}
          >
            <Slice round={rounds[i]!} i={i} hovered={hovered === i} />
          </motion.div>
          <span
            className="mt-1 text-center text-[11px] uppercase tracking-[0.2em] sm:mt-2 sm:text-sm sm:tracking-[0.28em]"
            style={{
              color: hovered === i ? '#F2D69E' : '#E7C994',
              textShadow: '0 1px 6px rgba(0,0,0,0.6)',
              transition: 'color 0.25s',
            }}
          >
            {it.title}
          </span>
        </Link>
      ))}
    </div>
  );
}
