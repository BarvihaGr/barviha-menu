/**
 * Ссылки на построение маршрута в трёх картах. Форматы проверены вручную
 * (curl со мобильным User-Agent, смотрели на реальный редирект/200):
 *  - Google: официальный Directions API (api=1), без origin — строит от
 *    текущей геопозиции.
 *  - 2ГИС: /directions/points/{lon},{lat} — 2ГИС сам определяет город и
 *    редиректит на страницу маршрута.
 *  - Яндекс: /maps/?rtext=~{lat},{lon} — координаты вместо текста адреса,
 *    чтобы не зависеть от клиентского геокодинга (см. старый комментарий в
 *    LocationInfoModal/CoffeeLuxContacts про молчаливый провал геокодинга).
 *
 * Координаты (latitude/longitude) сейчас заполнены не у всех локаций — тогда
 * откатываемся на текстовый адрес (хуже для Яндекса, но лучше, чем ничего).
 */
export interface DirectionsTarget {
  address: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

function hasCoords(t: DirectionsTarget): t is DirectionsTarget & { latitude: number; longitude: number } {
  return t.latitude != null && t.longitude != null;
}

export function yandexMapsUrl(t: DirectionsTarget): string {
  const dest = hasCoords(t) ? `${t.latitude},${t.longitude}` : (t.address ?? '');
  return `https://yandex.ru/maps/?rtext=~${encodeURIComponent(dest)}&rtt=auto`;
}

export function twoGisUrl(t: DirectionsTarget): string {
  if (hasCoords(t)) return `https://2gis.ru/directions/points/${t.longitude},${t.latitude}`;
  return `https://2gis.ru/search/${encodeURIComponent(t.address ?? '')}`;
}

export function googleMapsUrl(t: DirectionsTarget): string {
  const dest = hasCoords(t) ? `${t.latitude},${t.longitude}` : (t.address ?? '');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=driving`;
}
