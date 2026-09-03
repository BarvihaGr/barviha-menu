// Server-only загрузка Бара (шаблон «Арка») из content-store (fs) — НЕ
// импортировать из клиентских компонентов (см. @/lib/arka-menu-data для
// client-safe типов и getItemVariants). Работает для Арки и для любой из
// 25 рабочих локаций-клонов (см. @barviha/db WORKING_SLUGS) — у каждой своя
// независимая копия контента под тем же slug.
import { getBarSections, getBarGroupPhotos, getItemVariants } from '@barviha/db';
import type { ArkaMenuEntry, ArkaMenuItem, ArkaMenuVariant, PhotoEntry, ResolvedMenuItem } from '@barviha/db';
import { pickVolumeLabel } from './i18n-helpers';

/**
 * Позиции со снятым «актуально» (стоп-лист) и позиции в архиве не должны
 * попадать на живое меню вообще — ни в сетку категории, ни на страницу
 * товара. Бэк-офис читает getBarSections(slug) напрямую (видит всё, включая
 * стоп-лист/архив — там это и редактируется), а меню — только через этот
 * фильтрованный loader.
 */
export function loadArkaBarSections(slug: string): ArkaMenuEntry[] {
  const sections = getBarSections(slug);
  const groupPhotos = getBarGroupPhotos(slug);
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
    // Категория без доступных позиций всё равно показываем, если у неё есть
    // фото-баннер — это вводная картинка раздела (напр. «Безалкогольная
    // продукция» перед Лимонадами/Смузи), без своих собственных позиций.
    if (items.length === 0 && !groupPhotos[entry.category]) continue;
    if (pendingHeader && !headerUsed) {
      result.push(pendingHeader);
      headerUsed = true;
    }
    result.push({ ...entry, items });
  }
  return result;
}

export function loadArkaBarGroupPhotos(slug: string): Record<string, PhotoEntry> {
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
/** Перевод названия варианта: «перевод · переведённый объём». */
function withVolume(
  translated: string | null | undefined,
  baseName: string,
  variant: ArkaMenuVariant,
  locale: 'en' | 'zh' | 'hy',
): string | undefined {
  if (!translated) return undefined;
  // Вариант без суффикса объёма (позиция с одной фасовкой) — имя как есть.
  if (variant.name === baseName || !variant.label) return translated;
  return `${translated} · ${pickVolumeLabel(variant.label, locale)}`;
}

export function toResolvedArkaBarItems(slug: string): ResolvedMenuItem[] {
  const sections = loadArkaBarSections(slug);
  return flattenItems(sections)
    .flatMap((item) =>
      getItemVariants(item).map((v) => ({
        id: v.id,
        name: v.name,
        // У многовариантных позиций (0.3л / 1л) имя варианта — «Название ·
        // объём». Раньше переводы отдавали только название, поэтому в корзине
        // и на карточке две фасовки на en/zh/hy выглядели одинаково, а объём
        // пропадал. Дописываем к переводу переведённую же единицу.
        name_en: withVolume(item.name_en, item.name, v, 'en'),
        name_zh: withVolume(item.name_zh, item.name, v, 'zh'),
        name_hy: withVolume(item.name_hy, item.name, v, 'hy'),
        description: v.description,
        description_en: item.description_en ?? undefined,
        description_zh: item.description_zh ?? undefined,
        description_hy: item.description_hy ?? undefined,
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
