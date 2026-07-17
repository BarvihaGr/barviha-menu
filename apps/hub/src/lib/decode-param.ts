/**
 * Динамические сегменты роута в этой версии Next.js (16.2.6, Turbopack)
 * приходят НЕ раскодированными для не-ASCII значений — id позиций меню
 * (Кухня/Бар/Кальяны) частично на кириллице без транслитерации (см.
 * project memory), без явного decode PATCH/поиск по id всегда мимо.
 * decodeURIComponent на уже раскодированной ASCII-строке — no-op, безопасно
 * звать всегда. См. apps/menu/src/lib/decode-param.ts — тот же паттерн,
 * продублировано (разные приложения, общий импорт неудобен для такой мелочи).
 */
export function decodeRouteParam(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
