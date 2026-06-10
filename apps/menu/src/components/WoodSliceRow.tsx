'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';

/**
 * Три отдельных «спила бревна» — максимально реалистичные срезы дерева
 * в тёплой медовой палитре дуба/ясеня (рефы: фото реальных спилов).
 *
 * Не пазл: каждый срез самостоятельный. Неошкуренное бревно — толстая
 * грубая бугристая кора по краю. Полная структура настоящего среза:
 *  • годовые кольца с НЕРАВНОМЕРНЫМ шагом (годы быстрого/медленного роста,
 *    тёмная поздняя древесина в конце каждого цикла);
 *  • сердцевинные лучи — тонкие светлые радиальные линии от центра к коре
 *    (ключевой признак дуба — их раньше не было);
 *  • смещённая сердцевина, звезда трещин усушки из центра;
 *  • органичное «поведение» колец через feDisplacementMap — настоящая
 *    древесина никогда не идёт идеально ровными окружностями.
 * Виден торец спила (толщина) и контактная тень — объём куска дерева.
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

const TAU = Math.PI * 2;
const W = 240;
const H = 280;
const CX = 120;
const CY = 110;
const R = 96;
const KY = 0.95;
const DEPTH = 34;
const STEPS = 160; // точки контура
const RING_STRIDE = 2; // кольца семплируем реже контура — экономим payload

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

interface Ring {
  d: string;
  w: number;
  o: number;
  dark: boolean;
}

interface Round {
  bark: string;
  barkInner: string;
  band: string;
  side: string;
  rimSeam: string;
  rings: Ring[];
  rays: Array<{ d: string; o: number }>;
  cracks: string[];
  pith: [number, number];
}

function buildRound(seed: number): Round {
  const rng = mulberry32(seed);
  const ph = Array.from({ length: 8 }, () => rng() * TAU);
  const A2 = 0.045 + rng() * 0.035;
  const A3 = 0.038 + rng() * 0.03;
  const A5 = 0.028 + rng() * 0.02;
  const A7 = 0.02 + rng() * 0.015;
  const A11 = 0.015 + rng() * 0.012;
  const pa = rng() * TAU;
  const pr = R * (0.16 + rng() * 0.18);
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
      0.016 * jitter[i]! +
      0.012 * Math.sin(a * 17 + ph[5]!) +
      0.01 * Math.sin(a * 31 + ph[6]!) +
      0.008 * Math.sin(a * 47 + ph[7]!) +
      0.006 * Math.sin(a * 71 + ph[0]!));

  const outer: Array<[number, number]> = [];
  const inner: Array<[number, number]> = [];
  for (let i = 0; i < STEPS; i++) {
    const a = (i / STEPS) * TAU;
    const ro = Rout(a, i);
    const ox = CX + Math.cos(a) * ro;
    const oy = CY + Math.sin(a) * ro * KY;
    outer.push([ox, oy]);
    // кора заметно толще и неравномернее (неошкуренное бревно)
    const bw = R * (0.075 + 0.06 * (0.5 + 0.5 * Math.sin(a * 4 + ph[1]!)) + 0.04 * Math.abs(jitter[i]!));
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

  // годовые кольца с НЕРАВНОМЕРНЫМ шагом (циклы быстрого/медленного роста)
  const radii: number[] = [];
  const spacing: number[] = [];
  {
    const tmp: number[] = [];
    let acc = 0;
    const M = 104 + Math.floor(rng() * 30);
    for (let k = 0; k < M; k++) {
      // низкочастотная «история роста» + локальный шум
      const grow = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(k * 0.4 + ph[2]!));
      const d = grow * (0.55 + rng() * 0.75);
      acc += d;
      tmp.push(acc);
    }
    const max = acc || 1;
    let prev = 0;
    for (const t of tmp) {
      const f = 0.045 + 0.945 * (t / max);
      radii.push(f);
      spacing.push(f - prev);
      prev = f;
    }
  }
  const avgSpace = (radii[radii.length - 1]! - radii[0]!) / Math.max(1, radii.length - 1);

  const rings: Ring[] = radii.map((f, k) => {
    const rk = mulberry32(seed * 131 + k);
    const damp = Math.min(1, f * 2.0);
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= STEPS; i += RING_STRIDE) {
      const idx = i % STEPS;
      const a = (i / STEPS) * TAU;
      const wob = (0.004 * Math.sin(a * 4 + k * 0.5 + seed) + (rk() - 0.5) * 0.005) * damp;
      const bx = inner[idx]![0];
      const by = inner[idx]![1];
      const rr = Math.min(0.997, f + wob);
      pts.push([pith[0] + (bx - pith[0]) * rr, pith[1] + (by - pith[1]) * rr]);
    }
    pts.push(pts[0]!);
    // плотный шаг = поздняя (тёмная) древесина в конце годового цикла
    const dark = spacing[k]! < avgSpace * 0.85;
    return {
      d: pathOf(pts, false, 1),
      w: dark ? 0.8 : 0.46,
      o: dark ? 0.88 : 0.55 + 0.2 * f,
      dark,
    };
  });

  // сердцевинные лучи — тонкие светлые радиальные линии центр → кора
  const rays: Round['rays'] = [];
  const rN = 120 + Math.floor(rng() * 70);
  const ra0 = rng() * TAU;
  for (let r = 0; r < rN; r++) {
    const a = ra0 + (r / rN) * TAU + (rng() - 0.5) * 0.04;
    const idx = ((Math.round((a / TAU) * STEPS) % STEPS) + STEPS) % STEPS;
    const bx = inner[idx]![0];
    const by = inner[idx]![1];
    const r0 = 0.14 + rng() * 0.17;
    const r1 = 0.8 + rng() * 0.17;
    const x0 = pith[0] + (bx - pith[0]) * r0;
    const y0 = pith[1] + (by - pith[1]) * r0;
    const x1 = pith[0] + (bx - pith[0]) * r1;
    const y1 = pith[1] + (by - pith[1]) * r1;
    rays.push({
      d: `M${x0.toFixed(1)},${y0.toFixed(1)}L${x1.toFixed(1)},${y1.toFixed(1)}`,
      o: 0.1 + rng() * 0.16,
    });
  }

  // звезда радиальных трещин усушки из сердцевины
  const cracks: string[] = [];
  const cN = 2 + Math.floor(rng() * 2);
  const baseAng = rng() * TAU;
  for (let c = 0; c < cN; c++) {
    const a = baseAng + (c / cN) * TAU + (rng() - 0.5) * 1.1;
    const idx = ((Math.round((a / TAU) * STEPS) % STEPS) + STEPS) % STEPS;
    const ex = inner[idx]![0];
    const ey = inner[idx]![1];
    const seg = 8;
    const nx = -(ey - pith[1]);
    const ny = ex - pith[0];
    const nl = Math.hypot(nx, ny) || 1;
    const reach = 0.55 + rng() * 0.4;
    const cs = 0.06 + rng() * 0.06;
    let d = `M${(pith[0] + (ex - pith[0]) * cs).toFixed(2)},${(pith[1] + (ey - pith[1]) * cs).toFixed(2)}`;
    for (let s = 1; s <= seg; s++) {
      const tt = cs + (s / seg) * (reach - cs);
      const wob = (rng() - 0.5) * 2.4 * tt;
      const x = pith[0] + (ex - pith[0]) * tt + (nx / nl) * wob;
      const y = pith[1] + (ey - pith[1]) * tt + (ny / nl) * wob;
      d += `L${x.toFixed(1)},${y.toFixed(1)}`;
    }
    cracks.push(d);
  }

  return { bark, barkInner, band, side, rimSeam, rings, rays, cracks, pith };
}

function Slice({ round, i, hovered }: { round: Round; i: number; hovered: boolean }) {
  const u = `ws${i}`;
  const [px, py] = round.pith;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" aria-hidden>
      <defs>
        {/* тело древесины — тёплый медовый, светлее заболонь у края */}
        <radialGradient id={`${u}-f`} cx={px} cy={py} r={R} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9c6a38" />
          <stop offset="38%" stopColor="#b78146" />
          <stop offset="72%" stopColor="#cc9d61" />
          <stop offset="100%" stopColor="#e2c485" />
        </radialGradient>
        <linearGradient id={`${u}-s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2611" />
          <stop offset="100%" stopColor="#140c05" />
        </linearGradient>
        {/* кора — тёмная, бугристая */}
        <radialGradient id={`${u}-b`} cx={CX} cy={CY} r={R} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3c2613" />
          <stop offset="100%" stopColor="#1d1106" />
        </radialGradient>
        {/* тёмное ядро/сучок в сердцевине */}
        <radialGradient id={`${u}-hw`} cx={px} cy={py} r={22} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="rgba(20,10,4,0.85)" />
          <stop offset="60%" stopColor="rgba(30,16,6,0.4)" />
          <stop offset="100%" stopColor="rgba(30,16,6,0)" />
        </radialGradient>
        <radialGradient id={`${u}-hi`} cx="40%" cy="28%" r="74%">
          <stop offset="0%" stopColor="rgba(255,246,220,0.2)" />
          <stop offset="55%" stopColor="rgba(255,246,220,0)" />
        </radialGradient>
        {/* органичное искажение колец/лучей — древесина «гуляет» */}
        <filter id={`${u}-warp`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.013 0.011"
            numOctaves="2"
            seed={i * 9 + 5}
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* грейн коры */}
        <filter id={`${u}-bt`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.95 0.55" numOctaves="3" seed={i * 7 + 3} />
          <feColorMatrix values="0 0 0 0 0.09  0 0 0 0 0.06  0 0 0 0 0.03  0 0 0 0.95 0" />
        </filter>
        {/* волокно/грейн торца */}
        <filter id={`${u}-st`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.06" numOctaves="3" seed={i * 5 + 1} />
          <feColorMatrix values="0 0 0 0 0.08  0 0 0 0 0.05  0 0 0 0 0.03  0 0 0 0.8 0" />
        </filter>
        {/* лёгкий цветовой шум на теле спила */}
        <filter id={`${u}-ft`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.16 0.16" numOctaves="2" seed={i * 11 + 2} />
          <feColorMatrix values="0 0 0 0 0.32  0 0 0 0 0.2  0 0 0 0 0.08  0 0 0 0.5 0" />
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
        {/* цветовой шум тела */}
        <g clipPath={`url(#${u}-ci)`}>
          <rect width={W} height={H} filter={`url(#${u}-ft)`} opacity="0.22" />
        </g>

        {/* кольца + лучи + трещины — органично искажены */}
        <g clipPath={`url(#${u}-ci)`}>
          <g filter={`url(#${u}-warp)`}>
            {/* сердцевинные лучи (под кольцами) */}
            {round.rays.map((r, k) => (
              <path key={`y${k}`} d={r.d} fill="none" stroke="#efe1bf" strokeWidth="0.4" opacity={r.o} />
            ))}
            {/* годовые кольца */}
            {round.rings.map((r, k) => (
              <path
                key={k}
                d={r.d}
                fill="none"
                stroke={r.dark ? '#3a2410' : '#6b4521'}
                strokeWidth={r.w}
                opacity={r.o}
              />
            ))}
            {/* трещины усушки */}
            {round.cracks.map((d, k) => (
              <path
                key={`c${k}`}
                d={d}
                fill="none"
                stroke="#160d05"
                strokeWidth="1.1"
                opacity="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {/* сердцевина */}
            <ellipse cx={px} cy={py} rx={2.6} ry={2.6 * KY} fill="#1a0e05" opacity="0.9" />
          </g>
        </g>
        {/* тёмное ядро/сучок поверх колец */}
        <g clipPath={`url(#${u}-ci)`}>
          <rect width={W} height={H} fill={`url(#${u}-hw)`} />
        </g>

        {/* кора (грейн только в пределах коры) */}
        <path d={round.band} fillRule="evenodd" fill={`url(#${u}-b)`} />
        <g clipPath={`url(#${u}-cband)`}>
          <rect width={W} height={H} filter={`url(#${u}-bt)`} opacity="0.6" />
        </g>
        {/* камбий — светлая полоска заболони под корой */}
        <path d={round.barkInner} fill="none" stroke="rgba(240,214,160,0.45)" strokeWidth="0.7" />
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
