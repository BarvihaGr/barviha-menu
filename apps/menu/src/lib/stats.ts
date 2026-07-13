/**
 * Заготовка счётчиков "просмотры / добавления в корзину" — вся инфраструктура
 * (это API, серверная запись на item-странице, вкладка «Статистика» в
 * бэк-офисе) уже подключена и рабочая, но выключена этим флагом, поэтому
 * реальный трафик пока ничего не пишет. Включить: STATS_ENABLED = true —
 * больше никаких правок не требуется.
 *
 * Файл БЕЗ fs — безопасен и для клиентских компонентов ('use client'), и для
 * серверных (item/[itemId]/page.tsx проверяет этот же флаг перед recordView).
 */
export const STATS_ENABLED = false;

/** Одна добавка в корзину — только на переходе 0→1 (не на каждый +1), чтобы
 * считать «сколько раз позицию вообще клали в корзину», а не общее число кликов. */
export function trackAdd(locationSlug: string, itemId: string): void {
  if (!STATS_ENABLED) return;
  fetch(`/api/stats/${locationSlug}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId }),
    keepalive: true,
  }).catch(() => {});
}
