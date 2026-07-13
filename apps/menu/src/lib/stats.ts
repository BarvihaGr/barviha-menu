/**
 * Заготовка счётчиков "просмотры / добавления в корзину" — вся инфраструктура
 * (API, серверная запись на item-странице, вкладка «Статистика» в бэк-офисе)
 * уже подключена и рабочая. Единый выключатель — STATS_ENABLED в
 * @barviha/db/stats-flag (общий для apps/menu и apps/hub); чтобы включить —
 * см. project memory, больше никаких правок тут не требуется.
 */
export { STATS_ENABLED } from '@barviha/db/stats-flag';
import { STATS_ENABLED } from '@barviha/db/stats-flag';

/** Одна добавка в корзину — только на переходе 0→1 там, где есть степпер
 * (не на каждый +1), чтобы считать «сколько раз позицию вообще клали в
 * корзину», а не общее число кликов. */
export function trackAdd(locationSlug: string, itemId: string): void {
  if (!STATS_ENABLED) return;
  fetch(`/api/stats/${locationSlug}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId }),
    keepalive: true,
  }).catch(() => {});
}
