/**
 * Лейблы/порядок подкатегорий каталога (Кухня/Бар-как-каталог/Кальяны) —
 * чистые данные из menu-generated.ts, без fs. Отдельный подпуть экспорта
 * (см. package.json), чтобы клиентские компоненты бэк-офиса (CatalogEditor)
 * могли группировать список позиций, не затягивая content-store.ts в бандл.
 */
import { GEN_CATEGORIES } from './menu-generated';

const SUB_LABEL = new Map(GEN_CATEGORIES.map((c) => [`${c.realm}/${c.sub}`, c.label]));
const SUB_ORDER = new Map(GEN_CATEGORIES.map((c) => [`${c.realm}/${c.sub}`, c.order]));

export function subLabel(realm: string, sub: string | undefined): string {
  return SUB_LABEL.get(`${realm}/${sub}`) ?? sub ?? '';
}

export function subOrder(realm: string, sub: string | undefined): number {
  return SUB_ORDER.get(`${realm}/${sub}`) ?? 99;
}
