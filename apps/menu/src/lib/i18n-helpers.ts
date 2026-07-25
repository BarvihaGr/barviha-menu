import type { Category, HookahMood, ItemLabel, ResolvedMenuItem } from '@barviha/db';
import type { Locale } from '@/i18n/routing';
import { ITEM_TRANSLATIONS } from './item-translations';

/** Минимальная форма, которой достаточно для выбора перевода — под неё
 * структурно подходит и ResolvedMenuItem, и ArkaMenuItem (Бар «Арки»),
 * без явного приведения типов на стороне вызова. */
interface NamedTranslatable {
  id: string;
  name: string;
  name_en?: string | null;
  name_zh?: string | null;
  name_hy?: string | null;
}

interface DescribedTranslatable {
  id: string;
  description: string | null;
  description_en?: string | null;
  description_zh?: string | null;
  description_hy?: string | null;
}

interface ComposedTranslatable {
  id: string;
  composition: string | null;
  composition_en?: string | null;
  composition_zh?: string | null;
  composition_hy?: string | null;
}

export function pickItemName(item: NamedTranslatable, locale: Locale): string {
  const tr = ITEM_TRANSLATIONS[item.id];
  if (locale === 'en') return item.name_en ?? tr?.name_en ?? item.name;
  if (locale === 'zh') return item.name_zh ?? tr?.name_zh ?? item.name;
  if (locale === 'hy') return item.name_hy ?? tr?.name_hy ?? item.name;
  return item.name;
}

export function pickItemDescription(item: DescribedTranslatable, locale: Locale): string | null {
  const tr = ITEM_TRANSLATIONS[item.id];
  if (locale === 'en') return item.description_en ?? tr?.description_en ?? item.description;
  if (locale === 'zh') return item.description_zh ?? tr?.description_zh ?? item.description;
  if (locale === 'hy') return item.description_hy ?? tr?.description_hy ?? item.description;
  return item.description;
}

export function pickItemComposition(item: ComposedTranslatable, locale: Locale): string | null {
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

/**
 * Переводы заголовков секций Бара «Арки» (bar.json `sections[].category` /
 * `.title` — «Безалкогольная продукция», «Лимонады», «Винная карта» и т.п.).
 * Ключ — точный русский текст из контента (в этих файлах нет slug-а на
 * секцию), поэтому маппинг по строке, как и в предыдущих версиях меню.
 */
const BAR_CATEGORY_TR: Record<string, { en: string; zh: string; hy: string }> = {
  'Безалкогольная продукция': { en: 'Non-Alcoholic Beverages', zh: '無酒精飲品', hy: 'Ոչ ալկոհոլային ըմպելիքներ' },
  Лимонады: { en: 'Lemonades', zh: '檸檬水', hy: 'Լիմոնադներ' },
  Смузи: { en: 'Smoothies', zh: '冰沙', hy: 'Սմուզի' },
  Милкшейки: { en: 'Milkshakes', zh: '奶昔', hy: 'Կաթնային կոկտեյլներ' },
  'Молочный коктейль': { en: 'Milkshake', zh: '奶昔', hy: 'Կաթնային կոկտեյլ' },
  Соки: { en: 'Juices', zh: '果汁', hy: 'Հյութեր' },
  Сок: { en: 'Juice', zh: '果汁', hy: 'Հյութ' },
  'Вода с газом / без': { en: 'Still / Sparkling Water', zh: '靜水／氣泡水', hy: 'Հանգիստ / գազավորված ջուր' },
  Чаи: { en: 'Teas', zh: '茶', hy: 'Թեյեր' },
  'Авторские чаи': { en: 'Signature Teas', zh: '招牌茶', hy: 'Հեղինակային թեյեր' },
  'Премиальные чаи': { en: 'Premium Teas', zh: '優質茶', hy: 'Պրեմիում թեյեր' },
  Тизаны: { en: 'Tisanes', zh: '花草茶', hy: 'Դեղաբույսերի թեյեր' },
  'Классические чаи': { en: 'Classic Teas', zh: '經典茶', hy: 'Դասական թեյեր' },
  'Чайные добавки': { en: 'Tea Add-ins', zh: '茶點綴', hy: 'Թեյի հավելումներ' },
  Кофе: { en: 'Coffee', zh: '咖啡', hy: 'Սուրճ' },
  Добавки: { en: 'Add-ins', zh: '添加', hy: 'Հավելումներ' },
  Коктейли: { en: 'Cocktails', zh: '雞尾酒', hy: 'Կոկտեյլներ' },
  'Авторские коктейли': { en: 'Signature Cocktails', zh: '招牌雞尾酒', hy: 'Հեղինակային կոկտեյլներ' },
  'Классические коктейли': { en: 'Classic Cocktails', zh: '經典雞尾酒', hy: 'Դասական կոկտեյլներ' },
  Шоты: { en: 'Shots', zh: '烈酒杯', hy: 'Շոթեր' },
  'Игристые и шампанские вина': {
    en: 'Sparkling & Champagne Wines',
    zh: '氣泡酒與香檳',
    hy: 'Փրփրուն և շամպայն գինիներ',
  },
  'Белые вина': { en: 'White Wines', zh: '白葡萄酒', hy: 'Սպիտակ գինիներ' },
  'Розовые вина': { en: 'Rosé Wines', zh: '桃紅葡萄酒', hy: 'Վարդագույն գինիներ' },
  'Красные вина': { en: 'Red Wines', zh: '紅葡萄酒', hy: 'Կարմիր գինիներ' },
  'Крепкий алкоголь': { en: 'Spirits', zh: '烈酒', hy: 'Ուժեղ ալկոհոլ' },
  Текила: { en: 'Tequila', zh: '龍舌蘭', hy: 'Տեկիլա' },
  Джин: { en: 'Gin', zh: '琴酒', hy: 'Ջին' },
  Ром: { en: 'Rum', zh: '蘭姆酒', hy: 'Ռոմ' },
  Коньяк: { en: 'Cognac', zh: '干邑白蘭地', hy: 'Կոնյակ' },
  'Виски односолодовый': { en: 'Single Malt Whisky', zh: '單一麥芽威士忌', hy: 'Մեկ ածիկի վիսկի' },
  'Виски купажированный': { en: 'Blended Whisky', zh: '調和威士忌', hy: 'Համադրված վիսկի' },
  Водка: { en: 'Vodka', zh: '伏特加', hy: 'Օղի' },
  Пиво: { en: 'Beer', zh: '啤酒', hy: 'Գարեջուր' },
  Настойки: { en: 'House Infusions', zh: '自製利口酒', hy: 'Թրմուկներ' },
  'Аперетивы / Биттеры / Ликёры': {
    en: 'Aperitifs / Bitters / Liqueurs',
    zh: '開胃酒／苦精／利口酒',
    hy: 'Ապերիտիվներ / Բիթերներ / Լիկյորներ',
  },
  Закуски: { en: 'Snacks', zh: '小食', hy: 'Խորտիկներ' },
  Сладости: { en: 'Sweets', zh: '甜食', hy: 'Քաղցրավենիք' },
  'Винная карта': { en: 'Wine List', zh: '酒單', hy: 'Գինու քարտ' },
};

/** Перевод заголовка секции Бара «Арки» — `text` берётся прямо из контента (без slug-а). */
export function pickBarCategoryName(text: string, locale: Locale): string {
  const tr = BAR_CATEGORY_TR[text];
  if (!tr || locale === 'ru') return text;
  return tr[locale] ?? text;
}
