/**
 * Динамические сегменты роута в этой версии Next.js (16.2.6, Turbopack)
 * приходят НЕ раскодированными для не-ASCII значений — например
 * itemId='кит...%D1%81%D0%BE%D1%83%D1%81%D1%8B...' долетает как есть,
 * percent-encoded строкой, а не 'соусы'. Часть исторических id позиций
 * меню — кириллица без транслитерации (см. project memory), так что без
 * явного decode сравнение с id из content-store всегда мимо — карточка
 * товара отдавала 404 для доброй половины позиций Кухни/Бара Арки.
 * decodeURIComponent на уже раскодированной ASCII-строке — no-op, безопасно
 * звать всегда, не только когда заведомо знаешь про проблему.
 */
export function decodeRouteParam(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
