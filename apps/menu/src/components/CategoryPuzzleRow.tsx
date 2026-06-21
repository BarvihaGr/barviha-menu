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
const RB = 52; // базовый масштаб для длины трещин/фактуры

/**
 * Профиль каждого спила: полуоси кадра (ax,by) задают пропорцию, amp —
 * силу природной неровности края, seed — «рисунок» конкретного среза.
 * Край строится несколькими гармониками со случайными фазами → живой,
 * рваный, но без острых шипов контур настоящего дерева.
 *   0 — Кальяны: круглый живой спил
 *   1 — Кухня:   широкий овал
 *   2 — Бар:     высокий слэб
 */
const PROFILE = [
  { ax: 54, by: 50, amp: 0.13, sharp: 1.0, seed: 0x9e21 }, // Кальяны — круглый
  { ax: 64, by: 39, amp: 0.12, sharp: 1.0, seed: 0x4c77 }, // Кухня — широкий овал
  { ax: 37, by: 60, amp: 0.13, sharp: 1.0, seed: 0x2b05 }, // Бар — высокий слэб
] as const;

const CXR = 65;
const CYR = 63;

/**
 * Живой неровный контур спила из гармоник со случайными фазами.
 * sharp — спад амплитуд по частоте: меньше = острее «углы» по краю.
 */
function organicOutline(
  ax: number,
  by: number,
  amp: number,
  sharp: number,
  seed: number,
): Array<[number, number]> {
  const srng = mulberry32(seed);
  const H = 7;
  const amps: number[] = [];
  const phs: number[] = [];
  for (let k = 0; k < H; k++) {
    amps.push((amp * (0.5 + srng())) / Math.pow(k + 1, sharp));
    phs.push(srng() * Math.PI * 2);
  }
  const N = 220;
  const B: Array<[number, number]> = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    let r = 1;
    for (let k = 0; k < H; k++) r += amps[k]! * Math.sin((k + 2) * a + phs[k]!);
    B.push([CXR + ax * r * Math.cos(a), CYR + by * r * Math.sin(a)]);
  }
  return B;
}

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
  /** радиальные трещины-усушки от сердцевины наружу — как в настоящем спиле */
  cracks: string[];
  /** кольцевой «бубль» коры между внешним и внутренним краем (fill-rule evenodd) */
  barkBand: string;
  /** рваный внешний силуэт коры — бугры/чешуйки торчат наружу */
  barkOuter: string;
  /** внутренняя кромка коры — тонкий тёплый кант на границе с древесиной */
  barkInner: string;
  /** короткие радиальные борозды-чешуйки поперёк коры */
  barkFissures: string[];
}

function buildSlice(seed: number, shape: number): Slice {
  const rng = mulberry32(seed);

  // живой неровный контур спила по профилю
  const cfg = PROFILE[shape] ?? PROFILE[0];
  const B = organicOutline(cfg.ax, cfg.by, cfg.amp, cfg.sharp, cfg.seed);
  const STEPS = B.length;

  // сердцевина — центр масс контура, чуть ниже и в сторону
  let sx = 0;
  let sy = 0;
  for (const [x, y] of B) {
    sx += x;
    sy += y;
  }
  const px = sx / B.length + (shape === 0 ? -4 : shape === 2 ? 3 : 0);
  const py = sy / B.length + 6;

  const outline =
    B.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ') + ' Z';

  const rings: Slice['rings'] = [];
  let f = 0.025;
  for (let k = 1; k <= 130 && f < 0.99; k++) {
    const grow = 0.5 + 0.5 * Math.sin(k * 0.4 + seed * 1.3);
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

  // радиальные трещины-усушки: расходятся лучами от сердцевины, к краю
  // слегка виляют и расширяются — характерная примета настоящего спила.
  const cracks: string[] = [];
  const crackN = 2 + Math.floor(rng() * 3); // 2–4 шт.
  for (let c = 0; c < crackN; c++) {
    const a0 = rng() * Math.PI * 2;
    const r0 = RB * (0.04 + rng() * 0.08);
    const r1 = RB * (0.72 + rng() * 0.2);
    const segs = 7;
    let d = '';
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const rr = r0 + (r1 - r0) * t;
      const aa = a0 + (rng() - 0.5) * 0.22 * t; // виляние растёт к краю
      const x = px + Math.cos(aa) * rr;
      const y = py + Math.sin(aa) * rr;
      d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)} `;
    }
    cracks.push(d.trim());
  }

  // ── кора: неровная тёмная кромка вместо «кольца» ──────────────
  // Внутренний край коры — те же точки контура, сдвинутые к сердцевине
  // на рваную толщину. Между внешним и внутренним краем заливаем кольцо
  // (fill-rule evenodd) → получается живая полоса коры, а не ровный обвод.
  const barkBase = 5.6;
  // сглаживание массива амплитуд → крупные чешуйки коры, а не острые иглы
  const smoothAmt = (arr: number[], passes: number) => {
    let a = arr.slice();
    for (let p = 0; p < passes; p++) {
      a = a.map((_, i) => {
        const prev = a[(i - 1 + a.length) % a.length]!;
        const next = a[(i + 1) % a.length]!;
        return (prev + a[i]! * 2 + next) / 4;
      });
    }
    return a;
  };

  // ВНЕШНИЙ край коры — выталкиваем точки контура НАРУЖУ рваными чешуйками,
  // чтобы силуэт был бугристый, как настоящая кора (а не гладкий обвод).
  const outAmt = smoothAmt(
    B.map(() => rng()),
    2,
  );
  const outer: Array<[number, number]> = B.map(([x, y], i) => {
    const dx = x - px;
    const dy = y - py;
    const len = Math.hypot(dx, dy) || 1;
    const t = barkBase * (0.25 + outAmt[i]! * 1.0);
    return [x + (dx / len) * t, y + (dy / len) * t];
  });
  // ВНУТРЕННИЙ край коры — рваная граница с древесиной
  const inAmt = smoothAmt(
    B.map(() => rng()),
    2,
  );
  const inner: Array<[number, number]> = B.map(([x, y], i) => {
    const dx = px - x;
    const dy = py - y;
    const len = Math.hypot(dx, dy) || 1;
    const t = barkBase * (0.5 + inAmt[i]! * 1.0);
    return [x + (dx / len) * t, y + (dy / len) * t];
  });
  const toPath = (pts: Array<[number, number]>) =>
    pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ') + ' Z';
  const barkOuter = toPath(outer);
  const barkInner = toPath(inner);
  const barkBand = `${barkOuter} ${barkInner}`;

  // борозды-чешуйки поперёк ВСЕЙ толщины коры — от внешнего края к внутреннему,
  // с пропусками → природный неровный ритм
  const barkFissures: string[] = [];
  for (let i = 0; i < B.length; i += 3) {
    if (rng() < 0.18) continue;
    const o = outer[i]!;
    const n = inner[i]!;
    barkFissures.push(`M${o[0].toFixed(2)},${o[1].toFixed(2)} L${n[0].toFixed(2)},${n[1].toFixed(2)}`);
  }

  return { outline, rings, cracks, barkBand, barkOuter, barkInner, barkFissures };
}

/* ───────── резные эмблемы (гравировка по дереву) ─────────
   Каждая фигура — чистая линейная графика в арт-деко стиле.
   Цвет (c) и толщину (w) задаёт обёртка Emblem, чтобы рисовать
   её дважды: светлый кант снизу борозды + тёмная выжженная линия. */

function HookahArt({ c, w }: { c: string; w: number }) {
  return (
    <g fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      {/* дым */}
      <path
        d="M0,-19.5 C-2.4,-22 2,-24 -0.4,-26.5 C-2.4,-28.6 1.4,-30.4 -0.2,-32.6"
        opacity={0.7}
        strokeWidth={w * 0.7}
      />
      {/* навершие + чаша */}
      <path d="M-3.4,-18 L-2.4,-13.4 L2.4,-13.4 L3.4,-18 Z" />
      <path d="M-1.6,-18 L1.6,-18 M0,-18 L0,-19.5" />
      {/* стебель */}
      <path d="M0,-13.4 L0,6" />
      {/* поднос-тарелка */}
      <path d="M-9,-2.4 C-9,-4 9,-4 9,-2.4 C9,-0.8 -9,-0.8 -9,-2.4 Z" />
      {/* колба-основание */}
      <path d="M-2.2,6 C-9.5,7.5 -10.5,16.5 0,17.5 C10.5,16.5 9.5,7.5 2.2,6 Z" />
      <path
        d="M-4.6,11 C-1.6,12.4 1.6,12.4 4.6,11"
        opacity={0.8}
        strokeWidth={w * 0.8}
      />
      {/* шланг с мундштуком */}
      <path d="M1,-5.5 C12,-5 13.5,4 7,8.2 C4,10.2 6.2,12.4 9.2,11.2" />
    </g>
  );
}

function ClocheArt({ c, w }: { c: string; w: number }) {
  return (
    <g fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      {/* тарелка */}
      <path d="M-15.5,11 C-15.5,8 15.5,8 15.5,11 C15.5,14 -15.5,14 -15.5,11 Z" />
      {/* клош-купол + декоративная дуга */}
      <path d="M-12,11 A12,12 0 0 1 12,11" />
      <path d="M-8,7.5 A9,9 0 0 1 8,7.5" opacity={0.7} strokeWidth={w * 0.8} />
      {/* навершие */}
      <path d="M0,-1 L0,-3.6" />
      <circle cx={0} cy={-4.9} r={1.5} />
      {/* вилка слева */}
      <path d="M-18,12.5 L-18,-3" />
      <path d="M-20,-3 L-20,-10 M-18,-3 L-18,-10.6 M-16,-3 L-16,-10" />
      <path d="M-20,-3 C-18,-1.4 -18,-1.4 -16,-3" />
      {/* нож справа */}
      <path d="M18,12.5 L18,-4" />
      <path d="M16.6,-4 C16.6,-7.4 16.6,-11 18,-11 C19.6,-11 19.6,-6.4 19.4,-4 Z" />
    </g>
  );
}

function CocktailArt({ c, w }: { c: string; w: number }) {
  return (
    <g fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      {/* бокал-мартини */}
      <path d="M-14,-12 L6,-12 L-4,0 Z" />
      <path d="M-4,0 L-4,10 M-10,10.5 L2,10.5" />
      {/* поверхность напитка */}
      <path d="M-11.5,-9 L3.5,-9" opacity={0.75} strokeWidth={w * 0.8} />
      {/* кубик льда */}
      <path d="M-7.5,-7.5 L-4,-8.5 L-4,-5 L-7.5,-4 Z" opacity={0.85} strokeWidth={w * 0.85} />
      {/* долька цитруса на ободе */}
      <circle cx={6} cy={-12.5} r={2.6} />
      <path
        d="M6,-12.5 L6,-15.1 M6,-12.5 L8.4,-11.6 M6,-12.5 L3.6,-11.6"
        strokeWidth={w * 0.7}
        opacity={0.85}
      />
      {/* шпажка */}
      <path d="M8,-15 L-2,-6" strokeWidth={w * 0.7} />
      {/* шейкер справа */}
      <g transform="translate(13,0)">
        <path d="M-3,12 L-2.6,-2 L2.6,-2 L3,12 Z" />
        <path d="M-2.6,-2 L-3.2,-5 L3.2,-5 L2.6,-2" />
        <path d="M-2.2,-5 L-2.2,-8 L2.2,-8 L2.2,-5" />
        <path d="M-1,-8 L1,-8" />
        <path d="M-3,4 L3,4" opacity={0.6} strokeWidth={w * 0.7} />
      </g>
    </g>
  );
}

/** Эмблема с эффектом резьбы: светлый кант снизу + тёмная выжженная линия. */
function Emblem({ kind }: { kind: number }) {
  const Art = kind === 0 ? HookahArt : kind === 1 ? ClocheArt : CocktailArt;
  const tx = kind === 2 ? 63.5 : 65;
  const ty = kind === 1 ? 56 : 50; // в широком овале (кухня) гравюра ниже
  return (
    <g transform={`translate(${tx},${ty}) scale(0.9)`}>
      <g transform="translate(0,0.85)" opacity={0.5}>
        <Art c="rgba(255,236,201,0.9)" w={1.5} />
      </g>
      <Art c="#180D04" w={1.3} />
    </g>
  );
}

/**
 * Композиция «тройки» — не ровный строй, а живая раскладка:
 * центр (Кухня) приподнят и крупнее как смысловой фокус, боковые
 * чуть опущены и развёрнуты веером наружу. Подписи остаются ровными —
 * вращается только дерево.
 */
const LAYOUT = [
  { x: 0, y: 0, rot: 0, scale: 1.06 }, // Кальяны — круглый спил (+10%)
  { x: 14, y: -10, rot: 0, scale: 1.23 }, // Кухня — герой, чуть выше и правее
  { x: 0, y: 0, rot: 0, scale: 1.25 }, // Бар — высокий слэб (+10%)
] as const;

export function CategoryPuzzleRow({ items, locationSlug }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  const slices = useMemo(() => {
    const base = hashStr(locationSlug ?? 'default');
    return [0, 1, 2].map((i) => buildSlice((base * 2654435761 + (i + 1) * 40503) >>> 0, i));
  }, [locationSlug]);

  return (
    <div className="mx-auto w-full max-w-5xl px-1 sm:px-2">
      {/* общие фильтры/градиенты — один раз на документ */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          {/* тёмный орех / венге — глубокий тёплый коричневый */}
          <radialGradient id="pz-bg" cx="46%" cy="42%" r="64%">
            <stop offset="0%" stopColor="#503320" />
            <stop offset="52%" stopColor="#301E10" />
            <stop offset="100%" stopColor="#120A05" />
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
          {/* фактура коры: вытянутые радиально грубые волокна + тёмные борозды */}
          <filter id="pz-bark">
            <feTurbulence type="fractalNoise" baseFrequency="0.95 0.22" numOctaves="4" seed="31" />
            <feColorMatrix values="0 0 0 0 0.22  0 0 0 0 0.13  0 0 0 0 0.06  0 0 0 0.7 0" />
          </filter>
          <filter id="pz-bark-lite">
            <feTurbulence type="fractalNoise" baseFrequency="0.85 0.3" numOctaves="3" seed="53" />
            <feColorMatrix values="0 0 0 0 0.58  0 0 0 0 0.42  0 0 0 0 0.24  0 0 0 0.5 0" />
          </filter>
          <radialGradient id="pz-sheen" cx="36%" cy="28%" r="70%">
            <stop offset="0%" stopColor="rgba(255,243,216,0.08)" />
            <stop offset="55%" stopColor="rgba(255,243,216,0)" />
          </radialGradient>
          {/* объём спила: лёгкий блик по верхнему краю + затемнение снизу —
              создаёт ощущение скруглённой кромки и реальной толщины */}
          <linearGradient id="pz-dome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,238,206,0.16)" />
            <stop offset="42%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.42)" />
          </linearGradient>
          {/* лаковый зеркальный блик — узкое яркое пятно сверху-слева,
              как отражение тёплого софита на полированном лаке */}
          <radialGradient id="pz-spec" cx="40%" cy="20%" r="42%">
            <stop offset="0%" stopColor="rgba(255,250,235,0.1)" />
            <stop offset="40%" stopColor="rgba(255,247,226,0.03)" />
            <stop offset="100%" stopColor="rgba(255,247,226,0)" />
          </radialGradient>
        </defs>
      </svg>

      {/* На мобиле весь ряд равномерно крупнее на 20% (origin сверху-центр):
          размер, форма и зазоры между спилами масштабируются вместе →
          ничего не накладывается. На ≥sm возвращаем 1:1. */}
      <div className="flex origin-top scale-[1.2] items-center justify-center gap-0 pt-5 pb-3 sm:scale-100 sm:gap-1">
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
                initial={{ opacity: 0, x: cfg.x, y: cfg.y + 24 }}
                animate={{ opacity: 1, x: cfg.x, y: cfg.y, scale: cfg.scale }}
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

                  {/* торец спила — тёмная копия контура со сдвигом вниз:
                      даёт видимую толщину бревна и опору для тени */}
                  <path d={s.outline} transform="translate(0,3.6)" fill="#160C05" opacity={0.92} />

                  <g clipPath={`url(#pz-clip-${i})`}>
                    <rect width={VB} height={VB} fill="url(#pz-bg)" />
                    <rect width={VB} height={VB} filter="url(#pz-mottle)" opacity="0.74" />
                    <rect width={VB} height={VB} filter="url(#pz-grain)" opacity="0.54" />
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
                    {/* трещины-усушки поверх колец */}
                    {s.cracks.map((d, k) => (
                      <g key={`crk-${k}`}>
                        <path
                          d={d}
                          fill="none"
                          stroke="#0F0703"
                          strokeWidth={1}
                          opacity={0.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d={d}
                          fill="none"
                          stroke="#5C3E20"
                          strokeWidth={0.4}
                          opacity={0.4}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                    ))}
                    <rect width={VB} height={VB} filter="url(#pz-rough)" opacity="0.28" />
                    {/* настоящая 8K-фактура спила поверх процедурной базы */}
                    <image
                      href="/wood/slice-cut.webp"
                      x={-36}
                      y={-38}
                      width={202}
                      height={211}
                      preserveAspectRatio="xMidYMid slice"
                      transform={`rotate(${[0, 134, 248][i] ?? 0} 65 63)`}
                      style={{ mixBlendMode: 'overlay', opacity: 0.62 }}
                    />
                    <rect width={VB} height={VB} fill="url(#pz-dome)" />
                    <rect width={VB} height={VB} fill="url(#pz-sheen)" />
                    <rect width={VB} height={VB} fill="url(#pz-spec)" />
                  </g>

                  {/* чистый край спила — без коры (убрана по просьбе):
                      тонкий тёмный обвод даёт аккуратную кромку, тёплый блик
                      сверху — лёгкий объём полированного дерева */}
                  <path d={s.outline} fill="none" stroke="#1A0E05" strokeWidth={1.6} opacity={0.85} />
                  <path
                    d={s.outline}
                    fill="none"
                    stroke="#7A5230"
                    strokeWidth={0.6}
                    opacity={0.4}
                    transform="translate(0,-0.4)"
                  />

                  {/* резная гравировка + засечная подпись (вырезаны по дереву) */}
                  <g clipPath={`url(#pz-clip-${i})`}>
                    <Emblem kind={i} />
                    <g>
                      <text
                        x={65}
                        y={(i === 1 ? 84 : i === 2 ? 96 : 91.6) + 0.7}
                        textAnchor="middle"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '9.5px',
                          letterSpacing: '1.2px',
                          fontWeight: 600,
                          fill: 'rgba(255,236,201,0.5)',
                        }}
                      >
                        {it.title.toUpperCase()}
                      </text>
                      <text
                        x={65}
                        y={i === 1 ? 84 : i === 2 ? 96 : 91.6}
                        textAnchor="middle"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '9.5px',
                          letterSpacing: '1.2px',
                          fontWeight: 600,
                          fill: '#180D04',
                        }}
                      >
                        {it.title.toUpperCase()}
                      </text>
                    </g>
                  </g>

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
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
