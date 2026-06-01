/**
 * Уникальная «посадка» пазла из трёх деревяшек для каждой локации.
 *
 * Внешний вид среза дерева (форма колец, цвет, кора) общий для всех 27 точек.
 * Различается — композиция: где идут швы, какие у них «бугры», насколько
 * крупные/смещённые сами срезы. Это и есть «изюминка» каждой локации.
 *
 * Параметры детерминированы по slug'у (mulberry32 от FNV-хэша) —
 * SSR-стабильно, одна локация → один и тот же layout всегда.
 *
 * Все значения в координатах SVG viewBox 300×156.
 */

function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
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

export interface Seam {
  /** X-координата шва в VB (база ~106 / 194). */
  x: number;
  /** Фаза волны — меняет рисунок «пилы» шва. */
  phase: number;
  /** Y на котором у шва выступ (бугор пазла). */
  knobY: number;
  /** Направление выступа: +1 → бугор вправо, −1 → влево. */
  dir: 1 | -1;
}

export interface BlobConfig {
  /** Центр среза (X, Y). */
  O: [number, number];
  /** Сердцевина (P) — где сходятся кольца. Часто чуть сдвинута от центра. */
  P: [number, number];
  /** Базовый радиус среза. */
  Rb: number;
}

export interface PuzzleLayout {
  /** Швы между деталями: 0 — Кальяны↔Кухня, 1 — Кухня↔Бар. */
  seams: [Seam, Seam];
  /** Конфигурация трёх «срезов»: 0 — Кальяны, 1 — Кухня, 2 — Бар. */
  blobs: [BlobConfig, BlobConfig, BlobConfig];
}

/** Layout по умолчанию (как сейчас на Арке) — fallback. */
export const DEFAULT_LAYOUT: PuzzleLayout = {
  seams: [
    { x: 106, phase: 0.6, knobY: 70, dir: 1 },
    { x: 194, phase: 2.1, knobY: 86, dir: 1 },
  ],
  blobs: [
    { O: [72, 80], P: [62, 86], Rb: 62 },
    { O: [150, 74], P: [158, 66], Rb: 70 },
    { O: [230, 80], P: [240, 86], Rb: 60 },
  ],
};

/**
 * Возвращает уникальный layout для конкретной локации.
 *
 * Что меняется (детерминированно от slug):
 *  - X швов: ±6px (внутри ±20% базы — швы не уезжают)
 *  - Фаза и knobY/dir каждого шва: рисунок «зацепления» совсем другой
 *  - Y центров срезов: ±8px — кто-то приподнят, кто-то посажен ниже
 *  - Радиус каждого среза: ±5px — иногда Кухня крупнее Бара, иногда наоборот
 *  - Сердцевина (pith): сдвинута внутри среза эксцентрично, по-разному
 */
export function getPuzzleLayout(slug: string): PuzzleLayout {
  const rng = mulberry32(hashStr(slug));
  const D = DEFAULT_LAYOUT;

  // швы
  const seam0: Seam = {
    x: D.seams[0].x + Math.round((rng() - 0.5) * 12),
    phase: rng() * Math.PI * 2,
    knobY: 38 + Math.round(rng() * 80), // 38..118 — внутри VB_H=156
    dir: rng() > 0.5 ? 1 : -1,
  };
  const seam1: Seam = {
    x: D.seams[1].x + Math.round((rng() - 0.5) * 12),
    phase: rng() * Math.PI * 2,
    knobY: 38 + Math.round(rng() * 80),
    dir: rng() > 0.5 ? 1 : -1,
  };

  // срезы — по очереди, каждый со своим сдвигом/размером
  const blobs: PuzzleLayout['blobs'] = [
    blobFromBase(D.blobs[0], rng),
    blobFromBase(D.blobs[1], rng),
    blobFromBase(D.blobs[2], rng),
  ];

  return { seams: [seam0, seam1], blobs };
}

function blobFromBase(base: BlobConfig, rng: () => number): BlobConfig {
  const dy = Math.round((rng() - 0.5) * 16); // -8..+8
  const dR = Math.round((rng() - 0.5) * 10); // -5..+5
  // сердцевина: эксцентрично смещена от центра, по-разному у каждой локации
  const pdx = Math.round((rng() - 0.5) * 22);
  const pdy = Math.round((rng() - 0.5) * 18);
  return {
    O: [base.O[0], clamp(base.O[1] + dy, 56, 96)],
    P: [
      clamp(base.O[0] + pdx, base.O[0] - 18, base.O[0] + 18),
      clamp(base.O[1] + pdy, 46, 110),
    ],
    Rb: clamp(base.Rb + dR, 55, 76),
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
