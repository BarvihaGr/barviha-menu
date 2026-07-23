/**
 * Типы Бара «Арки» + чистая логика разбора вариаций объём/цена — БЕЗ fs.
 * Отдельный файл (и отдельный subpath-экспорт @barviha/db/arka-shared),
 * потому что его напрямую импортирует клиентский компонент
 * (apps/menu/src/components/coffee/ArkaCardTypes.tsx, 'use client'):
 * если бы типы жили в arka-content.ts вместе с fs-функциями, любой импорт
 * из @barviha/db в клиентском бандле тянул бы node:fs за собой (бандлер
 * не может утро-шейкнуть barrel `export *`) — сборка падала с ошибкой
 * "the chunking context does not support external modules (node:fs)".
 */

export interface ArkaMenuItem {
  id: string;
  name: string;
  name_en?: string | null;
  name_zh?: string | null;
  name_hy?: string | null;
  type: 1 | 2;
  priceParts: string[];
  volume: string | null;
  description: string | null;
  description_en?: string | null;
  description_zh?: string | null;
  description_hy?: string | null;
  photo: string | null;
  /** Кадрирование фото в квадратной рамке карточки (0–100%, объектная позиция). Null/отсутствует — дефолт. */
  photo_position?: { x: number; y: number } | null;
  /** Зум/поворот/отражение поверх object-position. Null/отсутствует — дефолт (без изменений). */
  photo_transform?: { zoom: number; rotate: number; flipH: boolean; flipV: boolean } | null;
  is_available: boolean;
  /** В архиве (сезонное/неактуальное меню) — не показывается на живом меню независимо от is_available, и скрыто из обычных списков бэк-офиса (см. «Архив»). */
  is_archived?: boolean;
}

export type ArkaMenuEntry =
  | { kind: 'header'; sheet: string; title: string }
  | { kind: 'category'; sheet: string; category: string; items: ArkaMenuItem[] };

export interface ArkaMenuVariant {
  id: string;
  label: string | null;
  price: number;
  name: string;
  description: string | null;
}

function parseNum(raw: string): number {
  const n = Number(raw.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Единый разбор вариаций объём/цена — используется и карточками (сетка/список),
 * и toResolvedArkaBarItems(), чтобы id/цены нигде не разъезжались.
 */
export function getItemVariants(item: ArkaMenuItem): ArkaMenuVariant[] {
  const volumeParts = item.volume ? item.volume.split('/').map((v) => v.trim()) : [];
  if (item.priceParts.length > 1 && volumeParts.length === item.priceParts.length) {
    return item.priceParts.map((p, i) => ({
      id: `${item.id}-v${i}`,
      label: volumeParts[i] ?? null,
      price: parseNum(p),
      name: `${item.name} · ${volumeParts[i]}`,
      description: item.description,
    }));
  }
  return [
    {
      id: item.id,
      label: item.volume,
      price: parseNum(item.priceParts.join('')),
      name: item.name,
      description: [item.volume, item.description].filter(Boolean).join('. ') || null,
    },
  ];
}
