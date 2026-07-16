// Server-only загрузка Бара (шаблон «Арка») из content-store (fs) — НЕ
// импортировать из клиентских компонентов (см. @/lib/arka-menu-data для
// client-safe типов и getItemVariants). Работает для Арки и для любой из
// 25 рабочих локаций-клонов (см. @barviha/db WORKING_SLUGS) — у каждой своя
// независимая копия контента под тем же slug.
import { getBarSections, getBarGroupPhotos, getItemVariants } from '@barviha/db';
import type { ArkaMenuEntry, ArkaMenuItem, ResolvedMenuItem } from '@barviha/db';

/**
 * Позиции со снятым «актуально» (стоп-лист) и позиции в архиве не должны
 * попадать на живое меню вообще — ни в сетку категории, ни на страницу
 * товара. Бэк-офис читает getBarSections(slug) напрямую (видит всё, включая
 * стоп-лист/архив — там это и редактируется), а меню — только через этот
 * фильтрованный loader.
 */
export function loadArkaBarSections(slug: string): ArkaMenuEntry[] {
  const sections = getBarSections(slug);
  const result: ArkaMenuEntry[] = [];
  let pendingHeader: ArkaMenuEntry | null = null;
  let headerUsed = false;
  for (const entry of sections) {
    if (entry.kind === 'header') {
      pendingHeader = entry;
      headerUsed = false;
      continue;
    }
    const items = entry.items.filter((it) => it.is_available && !it.is_archived);
    if (items.length === 0) continue;
    if (pendingHeader && !headerUsed) {
      result.push(pendingHeader);
      headerUsed = true;
    }
    result.push({ ...entry, items });
  }
  return result;
}

export function loadArkaBarGroupPhotos(slug: string): Record<string, string> {
  return getBarGroupPhotos(slug);
}

function flattenItems(sections: ArkaMenuEntry[]): ArkaMenuItem[] {
  return sections.flatMap((e) => (e.kind === 'category' ? e.items : []));
}

/**
 * "Фейковые" ResolvedMenuItem для позиций бара — чтобы можно было
 * пользоваться существующей корзиной/страницей товара (/item/[itemId]) без
 * правок схемы @barviha/db. Каждая вариация объёма — отдельная позиция в
 * корзине/на странице товара (см. getItemVariants).
 */
export function toResolvedArkaBarItems(slug: string): ResolvedMenuItem[] {
  const sections = loadArkaBarSections(slug);
  return flattenItems(sections)
    .flatMap((item) =>
      getItemVariants(item).map((v) => ({
        id: v.id,
        name: v.name,
        description: v.description,
        photos: item.photo ? [{ src: item.photo, position: item.photo_position ?? null, transform: item.photo_transform ?? null }] : [],
        photo: item.photo,
        composition: null,
        category_id: 'bar',
        price: v.price,
        weight: null,
        labels: [],
        is_available: true,
        is_premium: false,
        is_alcoholic: false,
        has_3d_model: false,
        spline_url: null,
      })),
    );
}
