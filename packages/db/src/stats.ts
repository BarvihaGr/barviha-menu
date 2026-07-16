/**
 * Заготовка аналитики "просмотры / добавления в корзину" по позициям меню —
 * инфраструктура готова и рабочая, но реальный трафик её пока не пишет (см.
 * STATS_ENABLED = false в apps/menu/src/lib/stats.ts). Включить: поставить
 * STATS_ENABLED = true — счётчики начнут копиться сами, без доп. правок.
 *
 * Временное файловое решение (packages/db/content/<slug>/stats.json —
 * простые счётчики views/adds на itemId, без истории по датам). Когда
 * дойдём до Supabase — заменится таблицей событий с реальным time-series;
 * это осознанно временный, но полностью рабочий мост.
 */
import { readContentJson, writeContentJson } from './content-store';
import { getCatalogItems, getBarSections } from './arka-content';
import { getItemVariants } from './arka-shared';
import type { ArkaMenuEntry } from './arka-shared';
import { usesArkaBarTemplate } from './onboarding';

export interface ItemStats {
  views: number;
  adds: number;
}

type StatsFile = Record<string, ItemStats>;

function readStats(slug: string): StatsFile {
  try {
    return readContentJson<StatsFile>(`${slug}/stats.json`);
  } catch {
    return {};
  }
}

/** Инкремент счётчика — не строго атомарно (файл), но при нашем трафике и
 * низкой частоте гонок этого достаточно для «посмотреть цифры», не для
 * точного биллинга. См. заголовок файла про переход на Supabase. */
function bump(slug: string, itemId: string, field: keyof ItemStats): void {
  const stats = readStats(slug);
  const cur = stats[itemId] ?? { views: 0, adds: 0 };
  stats[itemId] = { ...cur, [field]: cur[field] + 1 };
  writeContentJson(`${slug}/stats.json`, stats);
}

export function recordView(slug: string, itemId: string): void {
  bump(slug, itemId, 'views');
}

export function recordAdd(slug: string, itemId: string): void {
  bump(slug, itemId, 'adds');
}

export interface StatsRow {
  id: string;
  realm: 'kitchen' | 'hookah' | 'bar';
  name: string;
  photo: string | null;
  views: number;
  adds: number;
  /** adds/views в % — null, если просмотров ещё не было (не на что делить). */
  conversionPct: number | null;
}

function flattenBarVariants(sections: ArkaMenuEntry[]): { id: string; name: string; photo: string | null }[] {
  return sections
    .flatMap((e) => (e.kind === 'category' ? e.items : []))
    .flatMap((it) => getItemVariants(it).map((v) => ({ id: v.id, name: v.name, photo: it.photo })));
}

/** Сводка по всем разделам локации (Кухня + Кальяны + Бар) — для вкладки
 * «Статистика» в бэк-офисе. Пока трафик не включён, views/adds будут 0 у всех. */
export function getStatsSummary(slug: string): StatsRow[] {
  const stats = readStats(slug);

  const kitchen = getCatalogItems(slug, 'kitchen').map((it) => ({
    id: it.id,
    realm: 'kitchen' as const,
    name: it.name,
    photo: it.photos[0]?.src ?? null,
  }));
  const hookah = getCatalogItems(slug, 'hookah').map((it) => ({
    id: it.id,
    realm: 'hookah' as const,
    name: it.name,
    photo: it.photos[0]?.src ?? null,
  }));
  const bar = usesArkaBarTemplate(slug)
    ? flattenBarVariants(getBarSections(slug)).map((it) => ({ ...it, realm: 'bar' as const }))
    : getCatalogItems(slug, 'bar').map((it) => ({ id: it.id, realm: 'bar' as const, name: it.name, photo: it.photos[0]?.src ?? null }));

  return [...kitchen, ...hookah, ...bar].map((it) => {
    const s = stats[it.id] ?? { views: 0, adds: 0 };
    return {
      id: it.id,
      realm: it.realm,
      name: it.name,
      photo: it.photo,
      views: s.views,
      adds: s.adds,
      conversionPct: s.views > 0 ? Math.round((s.adds / s.views) * 1000) / 10 : null,
    };
  });
}
