/**
 * Валюта цен локации. В content-store цена — просто число в валюте самой
 * локации (рубли по всей сети, драмы в Ереване, сумы в Ташкенте); здесь —
 * только знак, который показываем рядом. Чистый модуль без fs: импортируется
 * и из клиентских компонентов меню, и из бэк-офиса.
 */
const CURRENCY_BY_SLUG: Record<string, string> = {
  erevan: '֏',
  taskent: 'сум',
};

export function currencySign(locationSlug?: string | null): string {
  return (locationSlug && CURRENCY_BY_SLUG[locationSlug]) || '₽';
}
