/**
 * Ссылки на бронирование стола (Restoplace) по локациям.
 *
 * У каждой локации — своя ссылка. Заполняйте карту `LOCATION_BOOKING`
 * по slug-у локации по мере получения ссылок Restoplace. Пока ссылки нет —
 * отдаём общий fallback на страницу бронирования группы.
 *
 * Пример значения: 'https://widget.restoplace.cc/?id=XXXXX' либо прямой
 * URL страницы локации с якорем брони.
 */
const BOOKING_FALLBACK = 'https://barvikhagroup.ru/#booking';

const LOCATION_BOOKING: Record<string, string> = {
  // Заполняйте: slug локации → ссылка Restoplace
  // 'mendeleevskaia': 'https://...',
  // 'arka': 'https://...',
};

/** Ссылка бронирования для локации (или общий fallback, если не задана). */
export function getBookingUrl(slug: string): string {
  return LOCATION_BOOKING[slug] ?? BOOKING_FALLBACK;
}
