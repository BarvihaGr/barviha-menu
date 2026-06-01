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
 *  - Фаза швов и knobY/dir: рисунок «зацепления» совсем другой
 *  - Y центров срезов: ±6px — кто-то приподнят, кто-то посажен ниже
 *  - Радиус каждого среза: только в плюс (+0..+8) — никогда не меньше базы,
 *    иначе срез не дотянется до шва и появится тёмная щель
 *  - Сердцевина (pith): сдвинута внутри среза эксцентрично, по-разному
 *
 * X швов и X центров срезов жёстко зафиксированы. Это гарантирует, что
 * все три детали всегда уверенно перекрывают свои швы — щелей не будет
 * никогда. Визуальную «изюминку» дают фаза/knob швов и сдвиги/pith,
 * которых вполне достаточно для 27 уникальных композиций.
 */
export function getPuzzleLayout(slug: string): PuzzleLayout {
  const rng = mulberry32(hashStr(slug));
  const D = DEFAULT_LAYOUT;

  const seam0: Seam = {
    x: D.seams[0].x,
    phase: rng() * Math.PI * 2,
    knobY: 38 + Math.round(rng() * 80), // 38..118
    dir: rng() > 0.5 ? 1 : -1,
  };
  const seam1: Seam = {
    x: D.seams[1].x,
    phase: rng() * Math.PI * 2,
    knobY: 38 + Math.round(rng() * 80),
    dir: rng() > 0.5 ? 1 : -1,
  };

  // Минимальные радиусы подобраны так, чтобы блоб ГАРАНТИРОВАННО доставал
  // до своего шва даже при самой неудачной фазе/knob — иначе появляется
  // тёмная щель между деталями.
  const blobs: PuzzleLayout['blobs'] = [
    blobFromBase(D.blobs[0], rng, 70),
    blobFromBase(D.blobs[1], rng, 80),
    blobFromBase(D.blobs[2], rng, 72),
  ];

  return { seams: [seam0, seam1], blobs };
}

function blobFromBase(base: BlobConfig, rng: () => number, minR: number): BlobConfig {
  const dy = Math.round((rng() - 0.5) * 12); // -6..+6
  const dR = Math.round(rng() * 8); // 0..+8 (никогда не уменьшаем)
  // сердцевина: эксцентрично смещена внутри среза, не близко к краю
  const pdx = Math.round((rng() - 0.5) * 18);
  const pdy = Math.round((rng() - 0.5) * 16);
  return {
    O: [base.O[0], clamp(base.O[1] + dy, 60, 92)],
    P: [
      clamp(base.O[0] + pdx, base.O[0] - 14, base.O[0] + 14),
      clamp(base.O[1] + pdy, 50, 106),
    ],
    Rb: Math.max(minR, base.Rb + dR),
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
