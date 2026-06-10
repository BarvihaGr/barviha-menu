'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';

/**
 * Три отдельных «спила бревна» — реалистичные 3D-срезы дерева.
 *
 * Не пазл: каждый срез самостоятельный, со своей корой по краю
 * (бревно не ошкурено), полной структурой годовых колец, смещённой
 * сердцевиной и радиальными трещинами. Форма природно-неровная
 * (не идеальный круг). Видна толщина спила и контактная тень —
 * срез «лежит» в пространстве. Иконок нет: только подпись снизу.
 *
 * Всё процедурно и детерминировано от (locationSlug + индекс) →
 * SSR-стабильно, у каждой локации свои спилы, но из «одного бревна».
 */
export interface WoodSliceItem {
  href: string;
  title: string;
}

interface Props {
  items: WoodSliceItem[];
  locationSlug?: string;
}

// геометрия одного спила (общий viewBox для всех трёх)
const W = 240;
const H = 268;
const CX = 120;
const CY = 102;
const R = 92;
const KY = 0.93; // лёгкий наклон взгляда → эллипс вместо круга
const DEPTH = 40; // толщина спила (видимый бок бревна)
const STEPS = 200;

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

interface Round {
  bark: string;
  barkInner: string;
  side: string;
  rimSeam: string;
  rings: Array<{ d: string; stroke: string; w: number; o: number }>;
  cracks: string[];
  fissures: string[];
  pith: [number, number];
}

function path(pts: Array<[number, number]>, close = true): string {
  let d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
  if (close) d += ' Z';
  return d;
}

function buildRound(seed: number): Round {
  const rng = mulberry32(seed);
  const p1 = rng() * 6.283;
  const p2 = rng() * 6.283;
  const p3 = rng() * 6.283;
  const p4 = rng() * 6.283;
  // амплитуды гармоник контура — «горбатость» бревна (никогда не круг)
  const a1 = 0.1 + rng() * 0.055;
  const a2 = 0.05 + rng() * 0.045;
  const a3 = 0.03 + rng() * 0.03;
  const a4 = 0.015 + rng() * 0.022;

  // сердцевина смещена эксцентрично (как у настоящего дерева)
  const pa = rng() * 6.283;
  const pr = R * (0.1 + rng() * 0.16);
  const P: [number, number] = [CX + Math.cos(pa) * pr, CY + Math.sin(pa) * pr * KY];

  const Rout = (a: number) =>
    R *
    (1 +
      a1 * Math.sin(a + p1) +
      a2 * Math.sin(2 * a + p2) +
      a3 * Math.sin(3 * a + p3) +
      a4 * Math.sin(5 * a + p4));

  const outer: Array<[number, number]> = [];
  const inner: Array<[number, number]> = [];
  for (let i = 0; i < STEPS; i++) {
    const a = (i / STEPS) * 6.283;
    const ro = Rout(a);
    const ox = CX + Math.cos(a) * ro;
    const oy = CY + Math.sin(a) * ro * KY;
    outer.push([ox, oy]);
    // толщина коры варьируется по периметру
    const bw = R * (0.06 + 0.05 * (0.5 + 0.5 * Math.sin(a * 3 + p2)) + 0.025 * rng());
    const dx = CX - ox;
    const dy = CY - oy;
    const dl = Math.hypot(dx, dy) || 1;
    inner.push([ox + (dx / dl) * bw, oy + (dy / dl) * bw]);
  }

  const bark = path(outer);
  const barkInner = path(inner);

  // бок бревна: нижняя дуга (a ∈ [0, π]) выдавлена вниз на DEPTH
  const half = Math.floor(STEPS / 2);
  const bottom = outer.slice(0, half + 1);
  let side = path(bottom, false);
  for (let i = bottom.length - 1; i >= 0; i--) {
    side += ` L${bottom[i]![0].toFixed(2)},${(bottom[i]![1] + DEPTH).toFixed(2)}`;
  }
  side += ' Z';
  const rimSeam = path(bottom, false);

  // годовые кольца: от сердцевины к коре, сходятся в pith
  const rings: Round['rings'] = [];
  const ringCount = 48 + Math.floor(rng() * 24);
  let acc = 0;
  for (let k = 1; k <= ringCount; k++) {
    // ширина годичного слоя плавает: ранняя древесина шире, поздняя уже
    const grow = 0.7 + 0.6 * (0.5 + 0.5 * Math.sin(k * 0.5 + seed));
    acc += grow + (rng() - 0.5) * 0.25;
    const f = acc / (ringCount + 2);
    if (f >= 0.99) break;
    const rngK = mulberry32(seed * 131 + k);
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= STEPS; i++) {
      const idx = i % STEPS;
      const a = (i / STEPS) * 6.283;
      const wob = 0.012 * Math.sin(a * 3 + k * 0.6 + seed) + (rngK() - 0.5) * 0.01;
      const bx = inner[idx]![0];
      const by = inner[idx]![1];
      const rr = Math.min(0.995, f + wob);
      pts.push([P[0] + (bx - P[0]) * rr, P[1] + (by - P[1]) * rr]);
    }
    const late = k % 6 === 0; // тёмная полоса поздней древесины
    const veryLate = k % 11 === 0;
    rings.push({
      d: path(pts, false),
      stroke: veryLate ? '#5e3d20' : late ? '#7c5230' : k % 2 === 0 ? '#c39a5e' : '#b78a50',
      w: late ? 0.95 : 0.5,
      o: Math.min(0.85, 0.45 + 0.3 * (1 - Math.abs(f - 0.5)) + (late ? 0.12 : 0)),
    });
  }

  // радиальные трещины усушки — не от самого центра, разной длины,
  // с заметным изломом, чтобы не выглядели как симметричные «спицы»
  const cracks: string[] = [];
  const crackN = 1 + Math.floor(rng() * 2);
  for (let c = 0; c < crackN; c++) {
    const a = rng() * 6.283;
    const idx = ((Math.round((a / 6.283) * STEPS) % STEPS) + STEPS) % STEPS;
    const ex = inner[idx]![0];
    const ey = inner[idx]![1];
    const seg = 6;
    const start = 0.14 + rng() * 0.12;
    const span = 0.38 + rng() * 0.34;
    const nx = -(ey - P[1]);
    const ny = ex - P[0];
    const nl = Math.hypot(nx, ny) || 1;
    const sx = P[0] + (ex - P[0]) * start;
    const sy = P[1] + (ey - P[1]) * start;
    let d = `M${sx.toFixed(2)},${sy.toFixed(2)}`;
    for (let s = 1; s <= seg; s++) {
      const tt = start + (s / seg) * span;
      const wob = (rng() - 0.5) * 4.2 * (s / seg);
      const x = P[0] + (ex - P[0]) * tt + (nx / nl) * wob;
      const y = P[1] + (ey - P[1]) * tt + (ny / nl) * wob;
      d += ` L${x.toFixed(2)},${y.toFixed(2)}`;
    }
    cracks.push(d);
  }

  // продольные борозды коры
  const fissures: string[] = [];
  const fisN = 10 + Math.floor(rng() * 8);
  for (let i = 0; i < fisN; i++) {
    const idx = Math.floor(rng() * STEPS);
    const ox = outer[idx]![0];
    const oy = outer[idx]![1];
    const ix = inner[idx]![0];
    const iy = inner[idx]![1];
    fissures.push(
      `M${(ox * 0.92 + ix * 0.08).toFixed(2)},${(oy * 0.92 + iy * 0.08).toFixed(2)} L${(ox * 0.12 + ix * 0.88).toFixed(2)},${(oy * 0.12 + iy * 0.88).toFixed(2)}`,
    );
  }

  return { bark, barkInner, side, rimSeam, rings, cracks, fissures, pith: P };
}

function Slice({
  round,
  i,
  hovered,
}: {
  round: Round;
  i: number;
  hovered: boolean;
}) {
  const u = `ws${i}`;
  const [px, py] = round.pith;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" aria-hidden>
      <defs>
        <radialGradient id={`${u}-wood`} cx={px} cy={py} r={R} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#b07a40" />
          <stop offset="38%" stopColor="#c89a5d" />
          <stop offset="72%" stopColor="#d9bd87" />
          <stop offset="100%" stopColor="#e7d6ab" />
        </radialGradient>
        <linearGradient id={`${u}-side`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3c2a19" />
          <stop offset="45%" stopColor="#2a1c10" />
          <stop offset="100%" stopColor="#140d07" />
        </linearGradient>
        <radialGradient id={`${u}-bark`} cx={CX} cy={CY} r={R} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4c3722" />
          <stop offset="100%" stopColor="#241809" />
        </radialGradient>
        <radialGradient id={`${u}-hi`} cx="40%" cy="32%" r="70%">
          <stop offset="0%" stopColor="rgba(255,242,214,0.28)" />
          <stop offset="55%" stopColor="rgba(255,242,214,0)" />
        </radialGradient>
        <filter id={`${u}-barkTex`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.45" numOctaves="3" seed={i * 7 + 3} />
          <feColorMatrix values="0 0 0 0 0.16  0 0 0 0 0.11  0 0 0 0 0.06  0 0 0 0.9 0" />
        </filter>
        <filter id={`${u}-sideTex`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.95 0.06" numOctaves="3" seed={i * 5 + 1} />
          <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.07  0 0 0 0 0.04  0 0 0 0.8 0" />
        </filter>
        <filter id={`${u}-woodTex`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.85" numOctaves="3" seed={i * 9 + 5} />
          <feColorMatrix values="0 0 0 0 0.72  0 0 0 0 0.54  0 0 0 0 0.3  0 0 0 0.5 0" />
        </filter>
        <filter id={`${u}-shadow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id={`${u}-clipInner`}>
          <path d={round.barkInner} />
        </clipPath>
        <clipPath id={`${u}-clipBark`}>
          <path d={round.bark} />
        </clipPath>
        <clipPath id={`${u}-clipSide`}>
          <path d={round.side} />
        </clipPath>
      </defs>

      {/* контактная тень под спилом */}
      <ellipse
        cx={CX}
        cy={CY + DEPTH + 26}
        rx={R * 0.86}
        ry={16}
        fill="rgba(0,0,0,0.5)"
        filter={`url(#${u}-shadow)`}
      />

      {/* бок бревна (толщина спила) */}
      <g>
        <path d={round.side} fill={`url(#${u}-side)`} />
        <g clipPath={`url(#${u}-clipSide)`}>
          <rect x="0" y="0" width={W} height={H} filter={`url(#${u}-sideTex)`} opacity="0.5" />
        </g>
        <path d={round.side} fill="none" stroke="#0e0904" strokeWidth="1" opacity="0.7" />
        {/* блик на верхней кромке бока — ловит свет, усиливает объём */}
        <path d={round.rimSeam} fill="none" stroke="#6a4c2c" strokeWidth="2.4" opacity="0.55" />
      </g>

      {/* верхняя плоскость спила */}
      <g clipPath={`url(#${u}-clipBark)`}>
        <path d={round.bark} fill={`url(#${u}-wood)`} />
        <rect x="0" y="0" width={W} height={H} filter={`url(#${u}-woodTex)`} opacity="0.18" />

        {/* годовые кольца (внутри сапвуда, не залезают в кору) */}
        <g clipPath={`url(#${u}-clipInner)`}>
          {round.rings.map((r, k) => (
            <path
              key={k}
              d={r.d}
              fill="none"
              stroke={r.stroke}
              strokeWidth={r.w}
              opacity={r.o}
              strokeLinejoin="round"
            />
          ))}
          {round.cracks.map((d, k) => (
            <path
              key={`c${k}`}
              d={d}
              fill="none"
              stroke="#1c1206"
              strokeWidth="1.1"
              opacity="0.78"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>

        {/* кора по краю (бревно не ошкурено) */}
        <path d={`${round.bark} ${round.barkInner}`} fillRule="evenodd" fill={`url(#${u}-bark)`} />
        <g clipPath={`url(#${u}-clipBark)`}>
          <path d={`${round.bark} ${round.barkInner}`} fillRule="evenodd" fill="none" />
          <rect
            x="0"
            y="0"
            width={W}
            height={H}
            filter={`url(#${u}-barkTex)`}
            opacity="0.55"
            clipPath={`url(#${u}-clipBark)`}
          />
        </g>
        {/* борозды коры */}
        {round.fissures.map((d, k) => (
          <path key={`f${k}`} d={d} stroke="#170f06" strokeWidth="0.8" opacity="0.5" fill="none" />
        ))}
        {/* камбий: светлая линия на границе коры и заболони */}
        <path d={round.barkInner} fill="none" stroke="rgba(231,214,171,0.45)" strokeWidth="0.7" />
        {/* мягкое затемнение у коры (объём) */}
        <path d={round.barkInner} fill="none" stroke="rgba(20,12,5,0.35)" strokeWidth="4" opacity="0.5" />

        {/* верхний свет */}
        <rect x="0" y="0" width={W} height={H} fill={`url(#${u}-hi)`} />
      </g>

      {/* тёмный шов между плоскостью и боком */}
      <path d={round.rimSeam} fill="none" stroke="#100a04" strokeWidth="1.4" opacity="0.55" />

      {/* золотая подсветка контура при наведении */}
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
    return [0, 1, 2].map((i) => buildRound(base * 2654435761 + (i + 1) * 40503));
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
