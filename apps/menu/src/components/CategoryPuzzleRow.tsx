'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/navigation';

export interface PuzzleItem {
  href: string;
  title: string;
}

interface Props {
  /** Ровно 3 элемента, порядок слева-направо: Кальяны | Кухня | Бар. */
  items: PuzzleItem[];
  /** Slug локации — уникальная форма каждого спила. */
  locationSlug?: string;
}

// квадратный viewBox на один спил
const VB = 130;
const CX = 65;
const CY = 63;
const RB = 55; // «пожирнее» — спил почти заполняет кадр

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

interface Slice {
  outline: string;
  rings: Array<{ d: string; opacity: number; width: number; tone: string }>;
}

function buildSlice(seed: number): Slice {
  const rng = mulberry32(seed);
  const ph1 = seed * 0.7;
  const ph2 = seed * 1.3;
  const ph3 = seed * 2.1;

  // сердцевина — слегка смещена от центра
  const pa = rng() * Math.PI * 2;
  const pr = RB * (0.08 + rng() * 0.16);
  const px = CX + Math.cos(pa) * pr;
  const py = CY + Math.sin(pa) * pr;

  const Rout = (a: number) =>
    RB *
    (1 +
      0.11 * Math.sin(a + ph1) +
      0.06 * Math.sin(a * 2 + ph2) +
      0.03 * Math.sin(a * 3 + ph3) +
      0.018 * Math.sin(a * 5 + ph1 * 1.7));

  const STEPS = 120;
  const B: Array<[number, number]> = [];
  for (let i = 0; i < STEPS; i++) {
    const a = (i / STEPS) * Math.PI * 2;
    const r = Rout(a);
    B.push([CX + Math.cos(a) * r, CY + Math.sin(a) * r * 1.0]);
  }
  const outline =
    B.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ') + ' Z';

  const rings: Slice['rings'] = [];
  let f = 0.025;
  for (let k = 1; k <= 130 && f < 0.99; k++) {
    const grow = 0.5 + 0.5 * Math.sin(k * 0.4 + ph2);
    const step = 0.004 + 0.011 * (1 - f) * (0.55 + 0.9 * grow) + (rng() - 0.5) * 0.0014;
    f = Math.min(0.99, f + step);
    const rngK = mulberry32(seed * 131 + k);
    let d = '';
    for (let i = 0; i <= STEPS; i++) {
      const idx = i % STEPS;
      const a = (i / STEPS) * Math.PI * 2;
      const bx = B[idx]![0];
      const by = B[idx]![1];
      const wob = 0.22 * Math.sin(a * 3 + k * 0.6 + seed) + (rngK() - 0.5) * 0.12;
      const dirx = bx - px;
      const diry = by - py;
      const len = Math.hypot(dirx, diry) || 1;
      const rr = f + wob / len;
      d += `${i === 0 ? 'M' : 'L'}${(px + dirx * rr).toFixed(2)},${(py + diry * rr).toFixed(2)} `;
    }
    const late = step < 0.006;
    rings.push({
      d: d.trim(),
      opacity: Math.min(0.55, 0.2 + 0.26 * (1 - Math.abs(f - 0.5)) + (late ? 0.12 : 0)),
      width: 0.14 + (late ? 0.2 : 0),
      tone: late ? '#4E331C' : k % 2 === 0 ? '#A87A44' : '#8C6230',
    });
  }

  return { outline, rings };
}

/**
 * Композиция «тройки» — не ровный строй, а живая раскладка:
 * центр (Кухня) приподнят и крупнее как смысловой фокус, боковые
 * чуть опущены и развёрнуты веером наружу. Подписи остаются ровными —
 * вращается только дерево.
 */
const LAYOUT = [
  { y: 12, rot: -5, scale: 1.0 }, // слева
  { y: -18, rot: 1.5, scale: 1.23 }, // центр — герой
  { y: 9, rot: 5, scale: 1.0 }, // справа
] as const;

export function CategoryPuzzleRow({ items, locationSlug }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  const slices = useMemo(() => {
    const base = hashStr(locationSlug ?? 'default');
    return [0, 1, 2].map((i) => buildSlice((base * 2654435761 + (i + 1) * 40503) >>> 0));
  }, [locationSlug]);

  return (
    <div className="mx-auto w-full max-w-3xl px-1 sm:px-4">
      {/* общие фильтры/градиенты — один раз на документ */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <radialGradient id="pz-bg" cx="50%" cy="48%" r="62%">
            <stop offset="0%" stopColor="#4D3622" />
            <stop offset="55%" stopColor="#2E1E12" />
            <stop offset="100%" stopColor="#160C06" />
          </radialGradient>
          <filter id="pz-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.9" numOctaves="3" seed="11" />
            <feColorMatrix values="0 0 0 0 0.72  0 0 0 0 0.54  0 0 0 0 0.30  0 0 0 0.5 0" />
          </filter>
          <filter id="pz-mottle">
            <feTurbulence type="fractalNoise" baseFrequency="0.035 0.05" numOctaves="2" seed="7" />
            <feColorMatrix values="0 0 0 0 0.16  0 0 0 0 0.10  0 0 0 0 0.05  0 0 0 0.6 0" />
          </filter>
          <filter id="pz-rough">
            <feTurbulence type="fractalNoise" baseFrequency="0.5 0.5" numOctaves="2" seed="19" />
            <feColorMatrix values="0 0 0 0 0.62  0 0 0 0 0.46  0 0 0 0 0.26  0 0 0 0.4 0" />
          </filter>
          <radialGradient id="pz-sheen" cx="36%" cy="28%" r="70%">
            <stop offset="0%" stopColor="rgba(255,242,214,0.12)" />
            <stop offset="55%" stopColor="rgba(255,242,214,0)" />
          </radialGradient>
        </defs>
      </svg>

      <div className="flex items-center justify-center gap-2 pt-5 pb-3 sm:gap-5">
        {items.slice(0, 3).map((it, i) => {
          const s = slices[i % slices.length]!;
          const isHover = hovered === i;
          const cfg = LAYOUT[i] ?? LAYOUT[0];
          return (
            <Link
              key={it.href}
              href={it.href}
              prefetch
              aria-label={it.title}
              className="group relative block w-1/3 focus:outline-none"
              onPointerEnter={() => setHovered(i)}
              onPointerDown={() => setHovered(i)}
              onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered((h) => (h === i ? null : h))}
            >
              <motion.div
                className="relative w-full"
                initial={{ opacity: 0, y: cfg.y + 24 }}
                animate={{ opacity: 1, y: cfg.y, scale: cfg.scale }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: cfg.scale * 1.06, y: cfg.y - 7 }}
                style={{
                  filter: 'drop-shadow(0 7px 13px rgba(0,0,0,0.5))',
                  zIndex: isHover ? 5 : i === 1 ? 3 : 1,
                }}
              >
                {/* дерево — вращается (веер); подпись ниже остаётся ровной */}
                <div style={{ transform: `rotate(${cfg.rot}deg)`, transformOrigin: '50% 55%' }}>
                <svg viewBox={`0 0 ${VB} ${VB}`} className="block h-auto w-full overflow-visible" aria-hidden>
                  <clipPath id={`pz-clip-${i}`}>
                    <path d={s.outline} />
                  </clipPath>
                  <g clipPath={`url(#pz-clip-${i})`}>
                    <rect width={VB} height={VB} fill="url(#pz-bg)" />
                    <rect width={VB} height={VB} filter="url(#pz-mottle)" opacity="0.62" />
                    <rect width={VB} height={VB} filter="url(#pz-grain)" opacity="0.36" />
                    {s.rings.map((r, k) => (
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
                    <rect width={VB} height={VB} filter="url(#pz-rough)" opacity="0.12" />
                    <rect width={VB} height={VB} fill="url(#pz-sheen)" />
                  </g>

                  {/* кора — натуральный грубый чешуйчатый край */}
                  <path d={s.outline} fill="none" stroke="#0E0805" strokeWidth={6} opacity={0.96} />
                  <path
                    d={s.outline}
                    fill="none"
                    stroke="#241509"
                    strokeWidth={4.5}
                    strokeDasharray="2.4 1.8"
                    strokeLinecap="round"
                    opacity={0.85}
                  />
                  <path
                    d={s.outline}
                    fill="none"
                    stroke="#3E2812"
                    strokeWidth={2.4}
                    strokeDasharray="1.6 2.6"
                    strokeLinecap="round"
                    opacity={0.6}
                  />

                  {/* золотая подсветка контура при наведении */}
                  <motion.path
                    d={s.outline}
                    fill="none"
                    stroke="#F2D69E"
                    strokeWidth={1.4}
                    strokeLinejoin="round"
                    initial={false}
                    animate={{ opacity: isHover ? 1 : 0 }}
                    transition={{ duration: 0.22 }}
                    style={{
                      pointerEvents: 'none',
                      filter:
                        'drop-shadow(0 0 1.5px rgba(242,214,158,0.9)) drop-shadow(0 0 4px rgba(231,201,148,0.55))',
                    }}
                  />
                </svg>
                </div>

                {/* название — изящные тонкие золотые капсы + деликатный
                    вензель снизу (тонкие линии с ромбиком). Композиция, а
                    не «бумажка на спиле». */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center" style={{ gap: '0.42em' }}>
                    <span
                      className="whitespace-nowrap text-center uppercase"
                      style={{
                        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
                        fontWeight: 300,
                        fontSize: 'clamp(9px, 2.3vw, 14px)',
                        letterSpacing: '0.36em',
                        textIndent: '0.36em',
                        color: isHover ? '#F8E8C2' : '#EAD09C',
                        textShadow: '0 1px 2px rgba(8,4,2,0.7)',
                        transition: 'color 0.25s',
                      }}
                    >
                      {it.title}
                    </span>
                    <span
                      aria-hidden
                      className="flex items-center"
                      style={{
                        gap: '0.45em',
                        opacity: isHover ? 0.95 : 0.65,
                        transition: 'opacity 0.25s',
                      }}
                    >
                      <span
                        style={{
                          display: 'block',
                          width: '1.5em',
                          height: '1px',
                          background: 'linear-gradient(90deg, transparent, #C49262)',
                        }}
                      />
                      <span
                        style={{
                          display: 'block',
                          width: '0.32em',
                          height: '0.32em',
                          transform: 'rotate(45deg)',
                          background: '#E5C490',
                          boxShadow: '0 0 2px rgba(229,196,144,0.6)',
                        }}
                      />
                      <span
                        style={{
                          display: 'block',
                          width: '1.5em',
                          height: '1px',
                          background: 'linear-gradient(90deg, #C49262, transparent)',
                        }}
                      />
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
