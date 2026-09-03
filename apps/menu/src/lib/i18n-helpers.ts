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
  'summer-menu': { en: 'Summer Menu', zh: '夏季菜單', hy: 'Ամառային մենյու' },
  // Были без перевода — подпись раздела оставалась русской на всех языках.
  raw: { en: 'Raw', zh: '生食', hy: 'Raw' },
  'bread-sauces': { en: 'Bread', zh: '麵包', hy: 'Հաց' },
  shashlik: { en: 'Shashlik', zh: '烤肉串', hy: 'Խորոված' },
  // Кальяны: подсекция приходит из контента прямо русским словом, а не
  // slug-ом (packages/db/content/<slug>/hookah.json, поле sub), поэтому и
  // ключ здесь — само слово.
  АКЦИИ: { en: 'Specials', zh: '特惠', hy: 'Ակցիաներ' },
  Акции: { en: 'Specials', zh: '特惠', hy: 'Ակցիաներ' },
  Акция: { en: 'Special Offer', zh: '特惠', hy: 'Ակցիա' },
};

/**
 * Адреса заведений. В контенте (packages/db/content/<slug>/location.json,
 * редактируется из бэк-офиса) они лежат только по-русски и раньше так и
 * показывались на всех языках — китайскому или армянскому гостю кириллица
 * бесполезна. Ключ — сам русский адрес, а не slug: если адрес поменяют в
 * бэк-офисе, перевод просто не найдётся и покажется русский оригинал, а не
 * устаревшая улица. Улицы даём латиницей (как в загранпаспорте и картах),
 * города — на языке страницы.
 */
const ADDRESS_TR: Record<string, { en: string; zh: string; hy: string }> = {
  'г. Москва, ул. Киевская, 2': {
    en: 'Moscow, Kievskaya St., 2',
    zh: '莫斯科, Kievskaya St., 2',
    hy: 'Մոսկվա, Kievskaya St., 2',
  },
  'Москва, площадь Киевского Вокзала, 2': {
    en: 'Moscow, Kievskogo Vokzala Sq., 2',
    zh: '莫斯科, Kievskogo Vokzala Sq., 2',
    hy: 'Մոսկվա, Kievskogo Vokzala Sq., 2',
  },
  'Москва, улица Киевская, 2': {
    en: 'Moscow, Kievskaya St., 2',
    zh: '莫斯科, Kievskaya St., 2',
    hy: 'Մոսկվա, Kievskaya St., 2',
  },
  'г. Тула Советская, д. 54Б': {
    en: 'Tula, Sovetskaya St., 54B',
    zh: '图拉, Sovetskaya St., 54B',
    hy: 'Տուլա, Sovetskaya St., 54B',
  },
  'Осенний бульвар, д. 7, корп. 1': {
    en: 'Moscow, Osenniy Blvd., 7, bldg. 1',
    zh: '莫斯科, Osenniy Blvd., 7, bldg. 1',
    hy: 'Մոսկվա, Osenniy Blvd., 7, bldg. 1',
  },
  'Саратов, улица Большая Горная, 203': {
    en: 'Saratov, Bolshaya Gornaya St., 203',
    zh: '萨拉托夫, Bolshaya Gornaya St., 203',
    hy: 'Սարատով, Bolshaya Gornaya St., 203',
  },
  'Нижняя красносельская, 35 стр. 59': {
    en: 'Moscow, Nizhnyaya Krasnoselskaya St., 35 bldg. 59',
    zh: '莫斯科, Nizhnyaya Krasnoselskaya St., 35 bldg. 59',
    hy: 'Մոսկվա, Nizhnyaya Krasnoselskaya St., 35 bldg. 59',
  },
  'Москва, улица Полины Осипенко, 14А': {
    en: 'Moscow, Poliny Osipenko St., 14A',
    zh: '莫斯科, Poliny Osipenko St., 14A',
    hy: 'Մոսկվա, Poliny Osipenko St., 14A',
  },
  'Комсомольская ул. 1А, стр 1.': {
    en: 'Domodedovo, Komsomolskaya St., 1A bldg. 1',
    zh: '多莫杰多沃, Komsomolskaya St., 1A bldg. 1',
    hy: 'Դոմոդեդովո, Komsomolskaya St., 1A bldg. 1',
  },
  'Ереван ул Арама, 76': {
    en: 'Yerevan, Aram St., 76',
    zh: '埃里温, Aram St., 76',
    hy: 'Երևան, Արամի փող., 76',
  },
  'Москва, Ленинский проспект, 146': {
    en: 'Moscow, Leninsky Ave., 146',
    zh: '莫斯科, Leninsky Ave., 146',
    hy: 'Մոսկվա, Leninsky Ave., 146',
  },
  'Москва, проспект Андропова, 22': {
    en: 'Moscow, Andropova Ave., 22',
    zh: '莫斯科, Andropova Ave., 22',
    hy: 'Մոսկվա, Andropova Ave., 22',
  },
  'Ветошный переулок, 13': {
    en: 'Moscow, Vetoshny Lane, 13',
    zh: '莫斯科, Vetoshny Lane, 13',
    hy: 'Մոսկվա, Vetoshny Lane, 13',
  },
  'Тула, Проспект Ленина, 85к1': {
    en: 'Tula, Lenina Ave., 85 bldg. 1',
    zh: '图拉, Lenina Ave., 85 bldg. 1',
    hy: 'Տուլա, Lenina Ave., 85 bldg. 1',
  },
  'Москва, улица Люблинская, 92к2': {
    en: 'Moscow, Lyublinskaya St., 92 bldg. 2',
    zh: '莫斯科, Lyublinskaya St., 92 bldg. 2',
    hy: 'Մոսկվա, Lyublinskaya St., 92 bldg. 2',
  },
  'Махачкала, улица Ирчи Казака, 20': {
    en: 'Makhachkala, Irchi Kazaka St., 20',
    zh: '马哈奇卡拉, Irchi Kazaka St., 20',
    hy: 'Մախաչկալա, Irchi Kazaka St., 20',
  },
  'Москва, Тихвинская 2': {
    en: 'Moscow, Tikhvinskaya St., 2',
    zh: '莫斯科, Tikhvinskaya St., 2',
    hy: 'Մոսկվա, Tikhvinskaya St., 2',
  },
  'Москва, Пятницкое шоссе, 3': {
    en: 'Moscow, Pyatnitskoye Hwy., 3',
    zh: '莫斯科, Pyatnitskoye Hwy., 3',
    hy: 'Մոսկվա, Pyatnitskoye Hwy., 3',
  },
  'Москва, Пресненская набережная, 4 с. 1': {
    en: 'Moscow, Presnenskaya Emb., 4 bldg. 1',
    zh: '莫斯科, Presnenskaya Emb., 4 bldg. 1',
    hy: 'Մոսկվա, Presnenskaya Emb., 4 bldg. 1',
  },
  'Санкт-Петербург, Невский проспект, 26': {
    en: 'Saint Petersburg, Nevsky Ave., 26',
    zh: '圣彼得堡, Nevsky Ave., 26',
    hy: 'Սանկտ Պետերբուրգ, Nevsky Ave., 26',
  },
  'Нижний Новгород, улица Алексеевская, 10/16': {
    en: 'Nizhny Novgorod, Alekseevskaya St., 10/16',
    zh: '下诺夫哥罗德, Alekseevskaya St., 10/16',
    hy: 'Նիժնի Նովգորոդ, Alekseevskaya St., 10/16',
  },
  'Москва, Алтуфьевское шоссе, 24к1': {
    en: 'Moscow, Altufyevskoye Hwy., 24 bldg. 1',
    zh: '莫斯科, Altufyevskoye Hwy., 24 bldg. 1',
    hy: 'Մոսկվա, Altufyevskoye Hwy., 24 bldg. 1',
  },
  'Москва, Дербеневская набережная, 7 с. 7': {
    en: 'Moscow, Derbenevskaya Emb., 7 bldg. 7',
    zh: '莫斯科, Derbenevskaya Emb., 7 bldg. 7',
    hy: 'Մոսկվա, Derbenevskaya Emb., 7 bldg. 7',
  },
  'Пенза, улица Мира, 60': {
    en: 'Penza, Mira St., 60',
    zh: '奔萨, Mira St., 60',
    hy: 'Պենզա, Mira St., 60',
  },
  'Москва, Мичуринский проспект, 9 к.5': {
    en: 'Moscow, Michurinsky Ave., 9 bldg. 5',
    zh: '莫斯科, Michurinsky Ave., 9 bldg. 5',
    hy: 'Մոսկվա, Michurinsky Ave., 9 bldg. 5',
  },
  'Рублёво-Успенское шоссе, Борки, 19': {
    en: 'Rublyovo-Uspenskoye Hwy., Borki, 19',
    zh: 'Rublyovo-Uspenskoye Hwy., Borki, 19',
    hy: 'Rublyovo-Uspenskoye Hwy., Borki, 19',
  },
  'Москва, Дмитровское шоссе, 85': {
    en: 'Moscow, Dmitrovskoye Hwy., 85',
    zh: '莫斯科, Dmitrovskoye Hwy., 85',
    hy: 'Մոսկվա, Dmitrovskoye Hwy., 85',
  },
  'г. Ташкент, Мирзо-Улугбекский район. Ул. Шахрисабз 31г': {
    en: 'Tashkent, Mirzo-Ulugbek District, Shakhrisabz St., 31G',
    zh: '塔什干, Mirzo-Ulugbek District, Shakhrisabz St., 31G',
    hy: 'Տաշքենդ, Mirzo-Ulugbek District, Shakhrisabz St., 31G',
  },
  'Москва, Новоясеневский проспект, 1': {
    en: 'Moscow, Novoyasenevsky Ave., 1',
    zh: '莫斯科, Novoyasenevsky Ave., 1',
    hy: 'Մոսկվա, Novoyasenevsky Ave., 1',
  },
};

/** Адрес заведения на языке страницы (не нашли перевод — отдаём как есть). */
export function pickLocationAddress(address: string | null, locale: Locale): string | null {
  if (!address || locale === 'ru') return address;
  return ADDRESS_TR[address.trim()]?.[locale] ?? address;
}

/**
 * Часы работы. В контенте это свободная строка вида «Вс-Чт 12:00-03:00»,
 * поэтому переводим не строку целиком, а сокращения дней недели внутри неё —
 * цифры, тире и переносы остаются как есть.
 */
const WEEKDAY_TR: Record<string, { en: string; zh: string; hy: string }> = {
  Пн: { en: 'Mon', zh: '週一', hy: 'Երկ' },
  Вт: { en: 'Tue', zh: '週二', hy: 'Երք' },
  Ср: { en: 'Wed', zh: '週三', hy: 'Չրք' },
  Чт: { en: 'Thu', zh: '週四', hy: 'Հնգ' },
  Пт: { en: 'Fri', zh: '週五', hy: 'Ուր' },
  Сб: { en: 'Sat', zh: '週六', hy: 'Շբթ' },
  Вс: { en: 'Sun', zh: '週日', hy: 'Կիր' },
};

/** Часы работы на языке страницы. */
export function pickLocationHours(hours: string | null, locale: Locale): string | null {
  if (!hours || locale === 'ru') return hours;
  return hours.replace(/Пн|Вт|Ср|Чт|Пт|Сб|Вс/g, (day) => WEEKDAY_TR[day]?.[locale] ?? day);
}

/**
 * Единицы объёма и веса в подписях позиций Бара («0.3л», «100мл», «50гр»,
 * «150мл / 750мл», «4*50мл»). Они лежат в контенте одной строкой на русском
 * и раньше так и показывались на всех языках. Переводим только сами единицы,
 * числа и разделители остаются как есть.
 */
const UNIT_TR: Record<string, { en: string; zh: string; hy: string }> = {
  мл: { en: 'ml', zh: '毫升', hy: 'մլ' },
  л: { en: 'L', zh: '升', hy: 'լ' },
  гр: { en: 'g', zh: '克', hy: 'գ' },
  г: { en: 'g', zh: '克', hy: 'գ' },
  кг: { en: 'kg', zh: '公斤', hy: 'կգ' },
  шт: { en: 'pcs', zh: '件', hy: 'հատ' },
};

/** Подпись объёма/веса позиции Бара на языке страницы. */
export function pickVolumeLabel(label: string | null, locale: Locale): string | null {
  if (!label || locale === 'ru') return label;
  return label.replace(/(мл|кг|гр|шт|л|г)\.?/g, (match, unit: string) => {
    const tr = UNIT_TR[unit];
    return tr ? tr[locale] : match;
  });
}

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
