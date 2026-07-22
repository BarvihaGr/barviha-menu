/**
 * Лейблы/порядок подкатегорий каталога (Кухня/Бар-как-каталог/Кальяны) —
 * чистые данные из menu-generated.ts, без fs. Отдельный подпуть экспорта
 * (см. package.json), чтобы клиентские компоненты бэк-офиса (CatalogEditor)
 * могли группировать список позиций, не затягивая content-store.ts в бандл.
 */
import { GEN_CATEGORIES } from './menu-generated';

const SUB_LABEL = new Map(GEN_CATEGORIES.map((c) => [`${c.realm}/${c.sub}`, c.label]));
const SUB_ORDER = new Map(GEN_CATEGORIES.map((c) => [`${c.realm}/${c.sub}`, c.order]));

/**
 * Подразделы Кальянов — раньше вся карта была одной группой "hookah"
 * (см. GEN_CATEGORIES), отсортированной глобально по цене (hookahPriceOrder
 * в client.ts). Локация может разбить свою карту на подразделы прямо в
 * content-store (поле sub каждой позиции) — здесь просто нужен порядок для
 * этих подразделов, иначе все они лягут в одну кучу (subOrder 99) и
 * hookahPriceOrder снова перемешает подразделы между собой по цене.
 * Сортировка по цене внутри каждого подраздела сохраняется.
 */
const HOOKAH_SUB_ORDER = new Map<string, number>([
  ['hookah/Авторские', 1],
  ['hookah/Чаши', 2],
  ['hookah/Фрукты', 3],
  ['hookah/Электро чаши', 4],
]);

export function subLabel(realm: string, sub: string | undefined): string {
  return SUB_LABEL.get(`${realm}/${sub}`) ?? sub ?? '';
}

export function subOrder(realm: string, sub: string | undefined): number {
  const key = `${realm}/${sub}`;
  return HOOKAH_SUB_ORDER.get(key) ?? SUB_ORDER.get(key) ?? 99;
}

/** Полный список категорий реалма из общего справочника (menu-generated.ts) —
 * даже те, для которых у конкретной локации ещё нет ни одной позиции. Нужно
 * для формы «Добавить позицию» в бэк-офисе: без этого категория вроде
 * «Сезонное предложение»/«Правильное питание» не появлялась в списке, пока
 * у локации не было хотя бы одной такой позиции — приходилось вручную
 * набирать название через «+ Новая категория», рискуя разойтись с
 * канонической подписью/сортировкой. */
export function allSubsForRealm(realm: string): { sub: string; label: string }[] {
  return GEN_CATEGORIES.filter((c) => c.realm === realm)
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((c) => ({ sub: c.sub, label: c.label }));
}
