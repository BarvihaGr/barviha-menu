/**
 * Подсекции внутри категории меню.
 *
 * Каждый раздел (kitchen / bar / rolls / desserts) разбит на подсекции:
 * Салаты / Закуски / Горячее / Авторские коктейли / Классика / Безалкогольные / Чай и т.д.
 *
 * Зачем: длинный плоский список — это плохо. Гость скроллит вечность.
 * С подсекциями сверху появляются скроллируемые табы: «Салаты | Закуски | Горячее»,
 * по тапу — мгновенный переход к нужному блоку.
 *
 * Как это работает:
 *  - Каждая подсекция = список item.id, в неё входящих.
 *  - Items без подсекции попадают в «Прочее» (если такое включено) или просто
 *    не показываются под табами, но видны при «Все».
 *  - Изначально активна вкладка «Все» — старое поведение.
 */
import type { ResolvedMenuItem } from '@barviha/db';

export interface MenuSection {
  /** Внутренний id для управления состоянием. */
  id: string;
  /** Ключ перевода под `sections.*` в i18n-файлах. */
  i18nKey: string;
  /** item.id блюд, относящихся к этой подсекции. */
  itemIds: readonly string[];
}

/** Кухня — салаты / закуски / горячее. */
const KITCHEN_SECTIONS: MenuSection[] = [
  {
    id: 'salads',
    i18nKey: 'salads',
    itemIds: ['itm-kitchen-caesar-shrimp', 'itm-kitchen-greek-salad'],
  },
  {
    id: 'cold_apps',
    i18nKey: 'coldApps',
    itemIds: [
      'itm-kitchen-tartare-beef',
      'itm-kitchen-tartare-salmon',
      'itm-kitchen-bruschetta-salmon',
      'itm-kitchen-bruschetta-roastbeef',
    ],
  },
  {
    id: 'platters',
    i18nKey: 'platters',
    itemIds: ['itm-kitchen-cheese-plate', 'itm-kitchen-meat-plate', 'itm-kitchen-veggie-set'],
  },
  {
    id: 'soups',
    i18nKey: 'soups',
    itemIds: ['itm-kitchen-tom-yum'],
  },
  {
    id: 'mains',
    i18nKey: 'mains',
    itemIds: ['itm-kitchen-ribeye', 'itm-kitchen-burger-barviha'],
  },
];

/** Бар — авторские / классика / безалкогольные / чай. */
const BAR_SECTIONS: MenuSection[] = [
  {
    id: 'author',
    i18nKey: 'authorCocktails',
    itemIds: [
      'itm-bar-french',
      'itm-bar-rose-glasses',
      'itm-bar-up-your-cool',
      'itm-bar-dominant',
      'itm-bar-last-word',
      'itm-bar-pina-colada-author',
    ],
  },
  {
    id: 'classics',
    i18nKey: 'classics',
    itemIds: [
      'itm-bar-aperol-spritz',
      'itm-bar-negroni',
      'itm-bar-old-fashioned',
      'itm-bar-margarita',
      'itm-bar-gin-tonic',
      'itm-bar-mojito',
    ],
  },
  {
    id: 'no_alcohol',
    i18nKey: 'noAlcoholDrinks',
    itemIds: ['itm-bar-virgin-mojito', 'itm-bar-lemonade-berry'],
  },
  {
    id: 'tea',
    i18nKey: 'tea',
    itemIds: ['itm-bar-tea-dahongpao'],
  },
];

/** Роллы — обычные / сеты. */
const ROLLS_SECTIONS: MenuSection[] = [
  {
    id: 'classic_rolls',
    i18nKey: 'classicRolls',
    itemIds: [
      'itm-roll-philadelphia',
      'itm-roll-california',
      'itm-roll-unagi-maki',
      'itm-roll-spicy-tuna',
      'itm-roll-salmon-tempura',
      'itm-roll-baked-salmon',
      'itm-roll-rainbow',
      'itm-roll-sake-maki',
    ],
  },
  {
    id: 'sets',
    i18nKey: 'sets',
    itemIds: ['itm-roll-set-barvikha', 'itm-roll-set-premium'],
  },
];

const DESSERTS_SECTIONS: MenuSection[] = [
  {
    id: 'desserts',
    i18nKey: 'desserts',
    itemIds: ['itm-dessert-cheesecake', 'itm-dessert-tiramisu', 'itm-dessert-honey-cake'],
  },
];

/** Маппинг по slug категории. */
export const SECTIONS_BY_CATEGORY: Record<string, MenuSection[]> = {
  kitchen: KITCHEN_SECTIONS,
  bar: BAR_SECTIONS,
  rolls: ROLLS_SECTIONS,
  desserts: DESSERTS_SECTIONS,
};

/** Доступны ли подсекции для категории. */
export function hasSections(categorySlug: string): boolean {
  return (SECTIONS_BY_CATEGORY[categorySlug]?.length ?? 0) > 0;
}

/** Список подсекций категории, в которых есть хотя бы одно из переданных блюд. */
export function activeSectionsFor(
  categorySlug: string,
  items: ResolvedMenuItem[],
): MenuSection[] {
  const all = SECTIONS_BY_CATEGORY[categorySlug] ?? [];
  const ids = new Set(items.map((i) => i.id));
  return all.filter((s) => s.itemIds.some((id) => ids.has(id)));
}

/** Отфильтровать блюда по подсекции. null = все. */
export function filterBySection(
  items: ResolvedMenuItem[],
  section: MenuSection | null,
): ResolvedMenuItem[] {
  if (!section) return items;
  const set = new Set(section.itemIds);
  return items.filter((i) => set.has(i.id));
}
