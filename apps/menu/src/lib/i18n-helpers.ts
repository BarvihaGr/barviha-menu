import type { Category, HookahMood, ItemLabel, ResolvedMenuItem } from '@barviha/db';
import type { Locale } from '@/i18n/routing';
import { ITEM_TRANSLATIONS } from './item-translations';

export function pickItemName(item: ResolvedMenuItem, locale: Locale): string {
  const tr = ITEM_TRANSLATIONS[item.id];
  if (locale === 'en') return item.name_en ?? tr?.name_en ?? item.name;
  if (locale === 'zh') return item.name_zh ?? tr?.name_zh ?? item.name;
  if (locale === 'hy') return item.name_hy ?? tr?.name_hy ?? item.name;
  return item.name;
}

export function pickItemDescription(item: ResolvedMenuItem, locale: Locale): string | null {
  const tr = ITEM_TRANSLATIONS[item.id];
  if (locale === 'en') return item.description_en ?? tr?.description_en ?? item.description;
  if (locale === 'zh') return item.description_zh ?? tr?.description_zh ?? item.description;
  if (locale === 'hy') return item.description_hy ?? tr?.description_hy ?? item.description;
  return item.description;
}

export function pickItemComposition(item: ResolvedMenuItem, locale: Locale): string | null {
  const tr = ITEM_TRANSLATIONS[item.id];
  if (locale === 'en') return item.composition_en ?? tr?.composition_en ?? item.composition;
  if (locale === 'zh') return item.composition_zh ?? tr?.composition_zh ?? item.composition;
  if (locale === 'hy') return item.composition_hy ?? tr?.composition_hy ?? item.composition;
  return item.composition;
}

export function pickMoodName(mood: HookahMood, locale: Locale): string {
  if (locale === 'en' && mood.name_en) return mood.name_en;
  if (locale === 'zh' && mood.name_zh) return mood.name_zh;
  if (locale === 'hy' && mood.name_hy) return mood.name_hy;
  return mood.name;
}

export function pickMoodDescription(mood: HookahMood, locale: Locale): string {
  if (locale === 'en' && mood.description_en) return mood.description_en;
  if (locale === 'zh' && mood.description_zh) return mood.description_zh;
  if (locale === 'hy' && mood.description_hy) return mood.description_hy;
  return mood.description;
}

const CATEGORY_FALLBACK: Record<string, { en: string; zh: string; hy: string }> = {
  hookah: { en: 'Hookah', zh: '水煙', hy: 'Կալյաններ' },
  bar: { en: 'Bar', zh: '酒吧', hy: 'Բար' },
  kitchen: { en: 'Kitchen', zh: '廚房', hy: 'Խոհանոց' },
  rolls: { en: 'Rolls', zh: '壽司捲', hy: 'Ռոլլեր' },
  desserts: { en: 'Desserts', zh: '甜點', hy: 'Աղանդեր' },
};

export function pickCategoryName(cat: Category, locale: Locale): string {
  if (locale === 'en') return cat.name_en ?? CATEGORY_FALLBACK[cat.slug]?.en ?? cat.name;
  if (locale === 'zh') return cat.name_zh ?? CATEGORY_FALLBACK[cat.slug]?.zh ?? cat.name;
  if (locale === 'hy') return cat.name_hy ?? CATEGORY_FALLBACK[cat.slug]?.hy ?? cat.name;
  return cat.name;
}

export function labelKey(label: ItemLabel): string {
  return label;
}

/**
 * Переводы названий подкатегорий (sub-разделов меню).
 * Ключ — `sub`-slug из GEN_CATEGORIES (см. packages/db/src/menu-generated.ts).
 * Русский лейбл приходит в `item.subLabel`; здесь — его перевод.
 */
const SUB_LABEL_TR: Record<string, { en: string; zh: string; hy: string }> = {
  breakfast: { en: 'Breakfast', zh: '早餐', hy: 'Նախաճաշեր' },
  salads: { en: 'Salads', zh: '沙拉', hy: 'Աղցաններ' },
  'cold-app': { en: 'Appetizers', zh: '開胃菜', hy: 'Նախուտեստներ' },
  'hot-app': { en: 'Hot Appetizers', zh: '熱開胃菜', hy: 'Տաք նախուտեստներ' },
  soups: { en: 'Soups', zh: '湯品', hy: 'Ապուրներ' },
  pasta: { en: 'Pasta', zh: '意大利麵', hy: 'Պաստա' },
  pizza: { en: 'Roman Pizza', zh: '羅馬披薩', hy: 'Հռոմեական պիցցա' },
  hot: { en: 'Main Course', zh: '主菜', hy: 'Տաք ուտեստներ' },
  steaks: { en: 'Steaks', zh: '牛排', hy: 'Սթեյքեր' },
  burgers: { en: 'Burgers', zh: '漢堡', hy: 'Բուրգերներ' },
  rolls: { en: 'Rolls & Sushi', zh: '壽司捲', hy: 'Ռոլլեր և սուշի' },
  poke: { en: 'Poke', zh: '夏威夷蓋飯', hy: 'Պոկե' },
  sides: { en: 'Sides', zh: '配菜', hy: 'Կողմնակի ուտեստներ' },
  desserts: { en: 'Desserts', zh: '甜點', hy: 'Աղանդեր' },
  snacks: { en: 'Snacks & Sweets', zh: '零食與甜食', hy: 'Խորտիկներ և քաղցրավենիք' },
  healthy: { en: 'Healthy Eating', zh: '健康飲食', hy: 'Առողջ սնունդ' },
  lenten: { en: 'Lenten Menu', zh: '齋戒菜單', hy: 'Պահքի ճաշացանկ' },
  seasonal: { en: 'Seasonal Offer', zh: '季節限定', hy: 'Սեզոնային առաջարկ' },
  teas: { en: 'Teas', zh: '茶', hy: 'Թեյեր' },
  'teas-flower': { en: 'Flower Teas', zh: '花茶', hy: 'Ծաղկային թեյեր' },
  'teas-bodriye': { en: 'Energizing Teas', zh: '提神茶', hy: '«Աշխույժ» թեյեր' },
  'teas-relax': { en: 'Relaxing Teas', zh: '舒緩茶', hy: '«Հանգստացնող» թեյեր' },
  'teas-cold': { en: 'Iced Teas', zh: '冰茶', hy: 'Սառը թեյեր' },
  coffee: { en: 'Coffee', zh: '咖啡', hy: 'Սուրճ' },
  lemonades: { en: 'Lemonades', zh: '檸檬水', hy: 'Լիմոնադներ' },
  smoothie: { en: 'Smoothies', zh: '冰沙', hy: 'Սմուզի' },
  milkshake: { en: 'Milkshakes', zh: '奶昔', hy: 'Կաթնային կոկտեյլներ' },
  juice: { en: 'Juices', zh: '果汁', hy: 'Հյութեր' },
  water: { en: 'Water', zh: '水', hy: 'Ջուր' },
  wine: { en: 'Wine & Sparkling', zh: '葡萄酒與氣泡酒', hy: 'Գինի և փրփրուն' },
  cocktails: { en: 'Cocktails', zh: '雞尾酒', hy: 'Կոկտեյլներ' },
  strong: { en: 'Spirits', zh: '烈酒', hy: 'Ուժեղ ալկոհոլ' },
  beer: { en: 'Beer & Cider', zh: '啤酒與蘋果酒', hy: 'Գարեջուր և սիդր' },
  hookah: { en: 'Hookah Menu', zh: '水煙菜單', hy: 'Կալյանի քարտ' },
};

/** Перевод названия подкатегории. `sub` — slug, `fallback` — русский subLabel. */
export function pickSubLabel(sub: string, fallback: string, locale: Locale): string {
  const tr = SUB_LABEL_TR[sub];
  if (!tr || locale === 'ru') return fallback;
  return tr[locale] ?? fallback;
}
