import type { Category, HookahMood, ItemLabel, ResolvedMenuItem } from '@barviha/db';
import type { Locale } from '@/i18n/routing';
import { ITEM_TRANSLATIONS, type ItemTr } from './item-translations';

/** Минимальная форма, которой достаточно для выбора перевода — под неё
 * структурно подходит и ResolvedMenuItem, и ArkaMenuItem (Бар «Арки»),
 * без явного приведения типов на стороне вызова. */
interface NamedTranslatable {
  id: string;
  name: string;
  name_en?: string | null;
  name_zh?: string | null;
  name_hy?: string | null;
  name_uz?: string | null;
  name_ar?: string | null;
}

interface DescribedTranslatable {
  id: string;
  description: string | null;
  description_en?: string | null;
  description_zh?: string | null;
  description_hy?: string | null;
  description_uz?: string | null;
  description_ar?: string | null;
}

interface ComposedTranslatable {
  id: string;
  composition: string | null;
  composition_en?: string | null;
  composition_zh?: string | null;
  composition_hy?: string | null;
  composition_uz?: string | null;
  composition_ar?: string | null;
}

/** Словарь ITEM_TRANSLATIONS пока заполнен только EN/ZH/HY; поля uz/ar в нём
 * опциональны и появятся по мере наполнения — читаем их через расширенный тип. */
type ItemTrExt = ItemTr & {
  name_uz?: string;
  name_ar?: string;
  description_uz?: string;
  description_ar?: string;
  composition_uz?: string;
  composition_ar?: string;
};

function itemTr(id: string): ItemTrExt | undefined {
  return ITEM_TRANSLATIONS[id] as ItemTrExt | undefined;
}

export function pickItemName(item: NamedTranslatable, locale: Locale): string {
  const tr = itemTr(item.id);
  if (locale === 'en') return item.name_en ?? tr?.name_en ?? item.name;
  if (locale === 'zh') return item.name_zh ?? tr?.name_zh ?? item.name;
  if (locale === 'hy') return item.name_hy ?? tr?.name_hy ?? item.name;
  if (locale === 'uz') return item.name_uz ?? tr?.name_uz ?? item.name;
  if (locale === 'ar') return item.name_ar ?? tr?.name_ar ?? item.name;
  return item.name;
}

export function pickItemDescription(item: DescribedTranslatable, locale: Locale): string | null {
  const tr = itemTr(item.id);
  if (locale === 'en') return item.description_en ?? tr?.description_en ?? item.description;
  if (locale === 'zh') return item.description_zh ?? tr?.description_zh ?? item.description;
  if (locale === 'hy') return item.description_hy ?? tr?.description_hy ?? item.description;
  if (locale === 'uz') return item.description_uz ?? tr?.description_uz ?? item.description;
  if (locale === 'ar') return item.description_ar ?? tr?.description_ar ?? item.description;
  return item.description;
}

export function pickItemComposition(item: ComposedTranslatable, locale: Locale): string | null {
  const tr = itemTr(item.id);
  if (locale === 'en') return item.composition_en ?? tr?.composition_en ?? item.composition;
  if (locale === 'zh') return item.composition_zh ?? tr?.composition_zh ?? item.composition;
  if (locale === 'hy') return item.composition_hy ?? tr?.composition_hy ?? item.composition;
  if (locale === 'uz') return item.composition_uz ?? tr?.composition_uz ?? item.composition;
  if (locale === 'ar') return item.composition_ar ?? tr?.composition_ar ?? item.composition;
  return item.composition;
}

/** Поля uz/ar у HookahMood/Category в схеме @barviha/db опциональны и могут
 * ещё отсутствовать — расширяем тип параметра локально, чтобы не трогать пакет. */
type MoodExt = HookahMood & {
  name_uz?: string | null;
  name_ar?: string | null;
  description_uz?: string | null;
  description_ar?: string | null;
};

export function pickMoodName(mood: MoodExt, locale: Locale): string {
  if (locale === 'en' && mood.name_en) return mood.name_en;
  if (locale === 'zh' && mood.name_zh) return mood.name_zh;
  if (locale === 'hy' && mood.name_hy) return mood.name_hy;
  if (locale === 'uz' && mood.name_uz) return mood.name_uz;
  if (locale === 'ar' && mood.name_ar) return mood.name_ar;
  return mood.name;
}

export function pickMoodDescription(mood: MoodExt, locale: Locale): string {
  if (locale === 'en' && mood.description_en) return mood.description_en;
  if (locale === 'zh' && mood.description_zh) return mood.description_zh;
  if (locale === 'hy' && mood.description_hy) return mood.description_hy;
  if (locale === 'uz' && mood.description_uz) return mood.description_uz;
  if (locale === 'ar' && mood.description_ar) return mood.description_ar;
  return mood.description;
}

/** Набор переводов на все неосновные языки (ru — исходный текст из контента). */
type Tr = { en: string; zh: string; hy: string; uz: string; ar: string };

const CATEGORY_FALLBACK: Record<string, Tr> = {
  hookah: { en: 'Hookah', zh: '水煙', hy: 'Կալյաններ', uz: 'Kalyan', ar: 'شيشة' },
  bar: { en: 'Bar', zh: '酒吧', hy: 'Բար', uz: 'Bar', ar: 'بار' },
  kitchen: { en: 'Kitchen', zh: '廚房', hy: 'Խոհանոց', uz: 'Oshxona', ar: 'المطبخ' },
  rolls: { en: 'Rolls', zh: '壽司捲', hy: 'Ռոլլեր', uz: 'Rollar', ar: 'رولات' },
  desserts: { en: 'Desserts', zh: '甜點', hy: 'Աղանդեր', uz: 'Desertlar', ar: 'حلويات' },
};

type CategoryExt = Category & { name_uz?: string | null; name_ar?: string | null };

export function pickCategoryName(cat: CategoryExt, locale: Locale): string {
  if (locale === 'en') return cat.name_en ?? CATEGORY_FALLBACK[cat.slug]?.en ?? cat.name;
  if (locale === 'zh') return cat.name_zh ?? CATEGORY_FALLBACK[cat.slug]?.zh ?? cat.name;
  if (locale === 'hy') return cat.name_hy ?? CATEGORY_FALLBACK[cat.slug]?.hy ?? cat.name;
  if (locale === 'uz') return cat.name_uz ?? CATEGORY_FALLBACK[cat.slug]?.uz ?? cat.name;
  if (locale === 'ar') return cat.name_ar ?? CATEGORY_FALLBACK[cat.slug]?.ar ?? cat.name;
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
const SUB_LABEL_TR: Record<string, Tr> = {
  breakfast: { en: 'Breakfast', zh: '早餐', hy: 'Նախաճաշեր', uz: 'Nonushta', ar: 'الفطور' },
  salads: { en: 'Salads', zh: '沙拉', hy: 'Աղցաններ', uz: 'Salatlar', ar: 'سلطات' },
  'cold-app': { en: 'Appetizers', zh: '開胃菜', hy: 'Նախուտեստներ', uz: 'Gazaklar', ar: 'مقبلات' },
  'hot-app': { en: 'Hot Appetizers', zh: '熱開胃菜', hy: 'Տաք նախուտեստներ', uz: 'Issiq gazaklar', ar: 'مقبلات ساخنة' },
  soups: { en: 'Soups', zh: '湯品', hy: 'Ապուրներ', uz: 'Shoʻrvalar', ar: 'شوربات' },
  pasta: { en: 'Pasta', zh: '意大利麵', hy: 'Պաստա', uz: 'Pasta', ar: 'باستا' },
  pizza: { en: 'Roman Pizza', zh: '羅馬披薩', hy: 'Հռոմեական պիցցա', uz: 'Rim pitsasi', ar: 'بيتزا رومانية' },
  hot: { en: 'Main Course', zh: '主菜', hy: 'Տաք ուտեստներ', uz: 'Asosiy taomlar', ar: 'الأطباق الرئيسية' },
  steaks: { en: 'Steaks', zh: '牛排', hy: 'Սթեյքեր', uz: 'Steyklar', ar: 'ستيك' },
  burgers: { en: 'Burgers', zh: '漢堡', hy: 'Բուրգերներ', uz: 'Burgerlar', ar: 'برغر' },
  rolls: { en: 'Rolls & Sushi', zh: '壽司捲', hy: 'Ռոլլեր և սուշի', uz: 'Rollar va sushi', ar: 'رولات وسوشي' },
  poke: { en: 'Poke', zh: '夏威夷蓋飯', hy: 'Պոկե', uz: 'Poke', ar: 'بوكيه' },
  sides: { en: 'Sides', zh: '配菜', hy: 'Կողմնակի ուտեստներ', uz: 'Garnirlar', ar: 'أطباق جانبية' },
  desserts: { en: 'Desserts', zh: '甜點', hy: 'Աղանդեր', uz: 'Desertlar', ar: 'حلويات' },
  snacks: { en: 'Snacks & Sweets', zh: '零食與甜食', hy: 'Խորտիկներ և քաղցրավենիք', uz: 'Gazaklar va shirinliklar', ar: 'وجبات خفيفة وحلويات' },
  healthy: { en: 'Healthy Eating', zh: '健康飲食', hy: 'Առողջ սնունդ', uz: 'Sogʻlom ovqatlanish', ar: 'أكل صحي' },
  lenten: { en: 'Lenten Menu', zh: '齋戒菜單', hy: 'Պահքի ճաշացանկ', uz: 'Roʻza menyusi', ar: 'قائمة الصيام' },
  seasonal: { en: 'Seasonal Offer', zh: '季節限定', hy: 'Սեզոնային առաջարկ', uz: 'Mavsumiy taklif', ar: 'عرض موسمي' },
  teas: { en: 'Teas', zh: '茶', hy: 'Թեյեր', uz: 'Choylar', ar: 'شاي' },
  'teas-flower': { en: 'Flower Teas', zh: '花茶', hy: 'Ծաղկային թեյեր', uz: 'Gulli choylar', ar: 'شاي الزهور' },
  'teas-bodriye': { en: 'Energizing Teas', zh: '提神茶', hy: '«Աշխույժ» թեյեր', uz: 'Tetiklashtiruvchi choylar', ar: 'شاي منشّط' },
  'teas-relax': { en: 'Relaxing Teas', zh: '舒緩茶', hy: '«Հանգստացնող» թեյեր', uz: 'Tinchlantiruvchi choylar', ar: 'شاي مهدّئ' },
  'teas-cold': { en: 'Iced Teas', zh: '冰茶', hy: 'Սառը թեյեր', uz: 'Sovuq choylar', ar: 'شاي مثلج' },
  coffee: { en: 'Coffee', zh: '咖啡', hy: 'Սուրճ', uz: 'Qahva', ar: 'قهوة' },
  lemonades: { en: 'Lemonades', zh: '檸檬水', hy: 'Լիմոնադներ', uz: 'Limonadlar', ar: 'ليمونادة' },
  smoothie: { en: 'Smoothies', zh: '冰沙', hy: 'Սմուզի', uz: 'Smuzi', ar: 'سموذي' },
  milkshake: { en: 'Milkshakes', zh: '奶昔', hy: 'Կաթնային կոկտեյլներ', uz: 'Sutli kokteyllar', ar: 'ميلك شيك' },
  juice: { en: 'Juices', zh: '果汁', hy: 'Հյութեր', uz: 'Sharbatlar', ar: 'عصائر' },
  water: { en: 'Water', zh: '水', hy: 'Ջուր', uz: 'Suv', ar: 'مياه' },
  wine: { en: 'Wine & Sparkling', zh: '葡萄酒與氣泡酒', hy: 'Գինի և փրփրուն', uz: 'Vino va koʻpikli vinolar', ar: 'نبيذ ونبيذ فوّار' },
  cocktails: { en: 'Cocktails', zh: '雞尾酒', hy: 'Կոկտեյլներ', uz: 'Kokteyllar', ar: 'كوكتيلات' },
  strong: { en: 'Spirits', zh: '烈酒', hy: 'Ուժեղ ալկոհոլ', uz: 'Kuchli ichimliklar', ar: 'مشروبات روحية' },
  beer: { en: 'Beer & Cider', zh: '啤酒與蘋果酒', hy: 'Գարեջուր և սիդր', uz: 'Pivo va sidr', ar: 'بيرة وسيدر' },
  hookah: { en: 'Hookah Menu', zh: '水煙菜單', hy: 'Կալյանի քարտ', uz: 'Kalyan menyusi', ar: 'قائمة الشيشة' },
  'summer-menu': { en: 'Summer Menu', zh: '夏季菜單', hy: 'Ամառային մենյու', uz: 'Yozgi menyu', ar: 'قائمة الصيف' },
  // Были без перевода — подпись раздела оставалась русской на всех языках.
  raw: { en: 'Raw', zh: '生食', hy: 'Raw', uz: 'Raw', ar: 'أطباق نيئة' },
  'bread-sauces': { en: 'Bread', zh: '麵包', hy: 'Հաց', uz: 'Non', ar: 'خبز' },
  shashlik: { en: 'Shashlik', zh: '烤肉串', hy: 'Խորոված', uz: 'Shashlik', ar: 'شيش كباب' },
  // Кальяны: подсекция приходит из контента прямо русским словом, а не
  // slug-ом (packages/db/content/<slug>/hookah.json, поле sub), поэтому и
  // ключ здесь — само слово.
  АКЦИИ: { en: 'Specials', zh: '特惠', hy: 'Ակցիաներ', uz: 'Aksiyalar', ar: 'عروض' },
  Акции: { en: 'Specials', zh: '特惠', hy: 'Ակցիաներ', uz: 'Aksiyalar', ar: 'عروض' },
  Акция: { en: 'Special Offer', zh: '特惠', hy: 'Ակցիա', uz: 'Aksiya', ar: 'عرض خاص' },
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
const ADDRESS_TR: Record<string, Tr> = {
  'г. Москва, ул. Киевская, 2': {
    en: 'Moscow, Kievskaya St., 2',
    zh: '莫斯科, Kievskaya St., 2',
    hy: 'Մոսկվա, Kievskaya St., 2',
    uz: 'Moskva, Kievskaya St., 2',
    ar: 'موسكو, Kievskaya St., 2',
  },
  'Москва, площадь Киевского Вокзала, 2': {
    en: 'Moscow, Kievskogo Vokzala Sq., 2',
    zh: '莫斯科, Kievskogo Vokzala Sq., 2',
    hy: 'Մոսկվա, Kievskogo Vokzala Sq., 2',
    uz: 'Moskva, Kievskogo Vokzala Sq., 2',
    ar: 'موسكو, Kievskogo Vokzala Sq., 2',
  },
  'Москва, улица Киевская, 2': {
    en: 'Moscow, Kievskaya St., 2',
    zh: '莫斯科, Kievskaya St., 2',
    hy: 'Մոսկվա, Kievskaya St., 2',
    uz: 'Moskva, Kievskaya St., 2',
    ar: 'موسكو, Kievskaya St., 2',
  },
  'г. Тула Советская, д. 54Б': {
    en: 'Tula, Sovetskaya St., 54B',
    zh: '图拉, Sovetskaya St., 54B',
    hy: 'Տուլա, Sovetskaya St., 54B',
    uz: 'Tula, Sovetskaya St., 54B',
    ar: 'تولا, Sovetskaya St., 54B',
  },
  'Осенний бульвар, д. 7, корп. 1': {
    en: 'Moscow, Osenniy Blvd., 7, bldg. 1',
    zh: '莫斯科, Osenniy Blvd., 7, bldg. 1',
    hy: 'Մոսկվա, Osenniy Blvd., 7, bldg. 1',
    uz: 'Moskva, Osenniy Blvd., 7, bldg. 1',
    ar: 'موسكو, Osenniy Blvd., 7, bldg. 1',
  },
  'Саратов, улица Большая Горная, 203': {
    en: 'Saratov, Bolshaya Gornaya St., 203',
    zh: '萨拉托夫, Bolshaya Gornaya St., 203',
    hy: 'Սարատով, Bolshaya Gornaya St., 203',
    uz: 'Saratov, Bolshaya Gornaya St., 203',
    ar: 'ساراتوف, Bolshaya Gornaya St., 203',
  },
  'Нижняя красносельская, 35 стр. 59': {
    en: 'Moscow, Nizhnyaya Krasnoselskaya St., 35 bldg. 59',
    zh: '莫斯科, Nizhnyaya Krasnoselskaya St., 35 bldg. 59',
    hy: 'Մոսկվա, Nizhnyaya Krasnoselskaya St., 35 bldg. 59',
    uz: 'Moskva, Nizhnyaya Krasnoselskaya St., 35 bldg. 59',
    ar: 'موسكو, Nizhnyaya Krasnoselskaya St., 35 bldg. 59',
  },
  'Москва, улица Полины Осипенко, 14А': {
    en: 'Moscow, Poliny Osipenko St., 14A',
    zh: '莫斯科, Poliny Osipenko St., 14A',
    hy: 'Մոսկվա, Poliny Osipenko St., 14A',
    uz: 'Moskva, Poliny Osipenko St., 14A',
    ar: 'موسكو, Poliny Osipenko St., 14A',
  },
  'Комсомольская ул. 1А, стр 1.': {
    en: 'Domodedovo, Komsomolskaya St., 1A bldg. 1',
    zh: '多莫杰多沃, Komsomolskaya St., 1A bldg. 1',
    hy: 'Դոմոդեդովո, Komsomolskaya St., 1A bldg. 1',
    uz: 'Domodedovo, Komsomolskaya St., 1A bldg. 1',
    ar: 'دوموديدوفو, Komsomolskaya St., 1A bldg. 1',
  },
  'Ереван ул Арама, 76': {
    en: 'Yerevan, Aram St., 76',
    zh: '埃里温, Aram St., 76',
    hy: 'Երևան, Արամի փող., 76',
    uz: 'Yerevan, Aram St., 76',
    ar: 'يريفان, Aram St., 76',
  },
  'Москва, Ленинский проспект, 146': {
    en: 'Moscow, Leninsky Ave., 146',
    zh: '莫斯科, Leninsky Ave., 146',
    hy: 'Մոսկվա, Leninsky Ave., 146',
    uz: 'Moskva, Leninsky Ave., 146',
    ar: 'موسكو, Leninsky Ave., 146',
  },
  'Москва, проспект Андропова, 22': {
    en: 'Moscow, Andropova Ave., 22',
    zh: '莫斯科, Andropova Ave., 22',
    hy: 'Մոսկվա, Andropova Ave., 22',
    uz: 'Moskva, Andropova Ave., 22',
    ar: 'موسكو, Andropova Ave., 22',
  },
  'Ветошный переулок, 13': {
    en: 'Moscow, Vetoshny Lane, 13',
    zh: '莫斯科, Vetoshny Lane, 13',
    hy: 'Մոսկվա, Vetoshny Lane, 13',
    uz: 'Moskva, Vetoshny Lane, 13',
    ar: 'موسكو, Vetoshny Lane, 13',
  },
  'Тула, Проспект Ленина, 85к1': {
    en: 'Tula, Lenina Ave., 85 bldg. 1',
    zh: '图拉, Lenina Ave., 85 bldg. 1',
    hy: 'Տուլա, Lenina Ave., 85 bldg. 1',
    uz: 'Tula, Lenina Ave., 85 bldg. 1',
    ar: 'تولا, Lenina Ave., 85 bldg. 1',
  },
  'Москва, улица Люблинская, 92к2': {
    en: 'Moscow, Lyublinskaya St., 92 bldg. 2',
    zh: '莫斯科, Lyublinskaya St., 92 bldg. 2',
    hy: 'Մոսկվա, Lyublinskaya St., 92 bldg. 2',
    uz: 'Moskva, Lyublinskaya St., 92 bldg. 2',
    ar: 'موسكو, Lyublinskaya St., 92 bldg. 2',
  },
  'Махачкала, улица Ирчи Казака, 20': {
    en: 'Makhachkala, Irchi Kazaka St., 20',
    zh: '马哈奇卡拉, Irchi Kazaka St., 20',
    hy: 'Մախաչկալա, Irchi Kazaka St., 20',
    uz: 'Mahachqala, Irchi Kazaka St., 20',
    ar: 'محج قلعة, Irchi Kazaka St., 20',
  },
  'Москва, Тихвинская 2': {
    en: 'Moscow, Tikhvinskaya St., 2',
    zh: '莫斯科, Tikhvinskaya St., 2',
    hy: 'Մոսկվա, Tikhvinskaya St., 2',
    uz: 'Moskva, Tikhvinskaya St., 2',
    ar: 'موسكو, Tikhvinskaya St., 2',
  },
  'Москва, Пятницкое шоссе, 3': {
    en: 'Moscow, Pyatnitskoye Hwy., 3',
    zh: '莫斯科, Pyatnitskoye Hwy., 3',
    hy: 'Մոսկվա, Pyatnitskoye Hwy., 3',
    uz: 'Moskva, Pyatnitskoye Hwy., 3',
    ar: 'موسكو, Pyatnitskoye Hwy., 3',
  },
  'Москва, Пресненская набережная, 4 с. 1': {
    en: 'Moscow, Presnenskaya Emb., 4 bldg. 1',
    zh: '莫斯科, Presnenskaya Emb., 4 bldg. 1',
    hy: 'Մոսկվա, Presnenskaya Emb., 4 bldg. 1',
    uz: 'Moskva, Presnenskaya Emb., 4 bldg. 1',
    ar: 'موسكو, Presnenskaya Emb., 4 bldg. 1',
  },
  'Санкт-Петербург, Невский проспект, 26': {
    en: 'Saint Petersburg, Nevsky Ave., 26',
    zh: '圣彼得堡, Nevsky Ave., 26',
    hy: 'Սանկտ Պետերբուրգ, Nevsky Ave., 26',
    uz: 'Sankt-Peterburg, Nevsky Ave., 26',
    ar: 'سانت بطرسبرغ, Nevsky Ave., 26',
  },
  'Нижний Новгород, улица Алексеевская, 10/16': {
    en: 'Nizhny Novgorod, Alekseevskaya St., 10/16',
    zh: '下诺夫哥罗德, Alekseevskaya St., 10/16',
    hy: 'Նիժնի Նովգորոդ, Alekseevskaya St., 10/16',
    uz: 'Nijniy Novgorod, Alekseevskaya St., 10/16',
    ar: 'نيجني نوفغورود, Alekseevskaya St., 10/16',
  },
  'Москва, Алтуфьевское шоссе, 24к1': {
    en: 'Moscow, Altufyevskoye Hwy., 24 bldg. 1',
    zh: '莫斯科, Altufyevskoye Hwy., 24 bldg. 1',
    hy: 'Մոսկվա, Altufyevskoye Hwy., 24 bldg. 1',
    uz: 'Moskva, Altufyevskoye Hwy., 24 bldg. 1',
    ar: 'موسكو, Altufyevskoye Hwy., 24 bldg. 1',
  },
  'Москва, Дербеневская набережная, 7 с. 7': {
    en: 'Moscow, Derbenevskaya Emb., 7 bldg. 7',
    zh: '莫斯科, Derbenevskaya Emb., 7 bldg. 7',
    hy: 'Մոսկվա, Derbenevskaya Emb., 7 bldg. 7',
    uz: 'Moskva, Derbenevskaya Emb., 7 bldg. 7',
    ar: 'موسكو, Derbenevskaya Emb., 7 bldg. 7',
  },
  'Пенза, улица Мира, 60': {
    en: 'Penza, Mira St., 60',
    zh: '奔萨, Mira St., 60',
    hy: 'Պենզա, Mira St., 60',
    uz: 'Penza, Mira St., 60',
    ar: 'بينزا, Mira St., 60',
  },
  'Москва, Мичуринский проспект, 9 к.5': {
    en: 'Moscow, Michurinsky Ave., 9 bldg. 5',
    zh: '莫斯科, Michurinsky Ave., 9 bldg. 5',
    hy: 'Մոսկվա, Michurinsky Ave., 9 bldg. 5',
    uz: 'Moskva, Michurinsky Ave., 9 bldg. 5',
    ar: 'موسكو, Michurinsky Ave., 9 bldg. 5',
  },
  'Рублёво-Успенское шоссе, Борки, 19': {
    en: 'Rublyovo-Uspenskoye Hwy., Borki, 19',
    zh: 'Rublyovo-Uspenskoye Hwy., Borki, 19',
    hy: 'Rublyovo-Uspenskoye Hwy., Borki, 19',
    uz: 'Rublyovo-Uspenskoye Hwy., Borki, 19',
    ar: 'Rublyovo-Uspenskoye Hwy., Borki, 19',
  },
  'Москва, Дмитровское шоссе, 85': {
    en: 'Moscow, Dmitrovskoye Hwy., 85',
    zh: '莫斯科, Dmitrovskoye Hwy., 85',
    hy: 'Մոսկվա, Dmitrovskoye Hwy., 85',
    uz: 'Moskva, Dmitrovskoye Hwy., 85',
    ar: 'موسكو, Dmitrovskoye Hwy., 85',
  },
  'г. Ташкент, Мирзо-Улугбекский район. Ул. Шахрисабз 31г': {
    en: 'Tashkent, Mirzo-Ulugbek District, Shakhrisabz St., 31G',
    zh: '塔什干, Mirzo-Ulugbek District, Shakhrisabz St., 31G',
    hy: 'Տաշքենդ, Mirzo-Ulugbek District, Shakhrisabz St., 31G',
    uz: 'Toshkent, Mirzo-Ulugbek District, Shakhrisabz St., 31G',
    ar: 'طشقند, Mirzo-Ulugbek District, Shakhrisabz St., 31G',
  },
  'Москва, Новоясеневский проспект, 1': {
    en: 'Moscow, Novoyasenevsky Ave., 1',
    zh: '莫斯科, Novoyasenevsky Ave., 1',
    hy: 'Մոսկվա, Novoyasenevsky Ave., 1',
    uz: 'Moskva, Novoyasenevsky Ave., 1',
    ar: 'موسكو, Novoyasenevsky Ave., 1',
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
const WEEKDAY_TR: Record<string, Tr> = {
  Пн: { en: 'Mon', zh: '週一', hy: 'Երկ', uz: 'Du', ar: 'الاثنين' },
  Вт: { en: 'Tue', zh: '週二', hy: 'Երք', uz: 'Se', ar: 'الثلاثاء' },
  Ср: { en: 'Wed', zh: '週三', hy: 'Չրք', uz: 'Ch', ar: 'الأربعاء' },
  Чт: { en: 'Thu', zh: '週四', hy: 'Հնգ', uz: 'Pa', ar: 'الخميس' },
  Пт: { en: 'Fri', zh: '週五', hy: 'Ուր', uz: 'Ju', ar: 'الجمعة' },
  Сб: { en: 'Sat', zh: '週六', hy: 'Շբթ', uz: 'Sh', ar: 'السبت' },
  Вс: { en: 'Sun', zh: '週日', hy: 'Կիր', uz: 'Ya', ar: 'الأحد' },
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
const UNIT_TR: Record<string, Tr> = {
  мл: { en: 'ml', zh: '毫升', hy: 'մլ', uz: 'ml', ar: 'مل' },
  л: { en: 'L', zh: '升', hy: 'լ', uz: 'l', ar: 'ل' },
  гр: { en: 'g', zh: '克', hy: 'գ', uz: 'g', ar: 'غ' },
  г: { en: 'g', zh: '克', hy: 'գ', uz: 'g', ar: 'غ' },
  кг: { en: 'kg', zh: '公斤', hy: 'կգ', uz: 'kg', ar: 'كغ' },
  шт: { en: 'pcs', zh: '件', hy: 'հատ', uz: 'dona', ar: 'قطعة' },
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
const BAR_CATEGORY_TR: Record<string, Tr> = {
  'Безалкогольная продукция': {
    en: 'Non-Alcoholic Beverages',
    zh: '無酒精飲品',
    hy: 'Ոչ ալկոհոլային ըմպելիքներ',
    uz: 'Alkogolsiz ichimliklar',
    ar: 'مشروبات غير كحولية',
  },
  Лимонады: { en: 'Lemonades', zh: '檸檬水', hy: 'Լիմոնադներ', uz: 'Limonadlar', ar: 'ليمونادة' },
  Смузи: { en: 'Smoothies', zh: '冰沙', hy: 'Սմուզի', uz: 'Smuzi', ar: 'سموذي' },
  Милкшейки: { en: 'Milkshakes', zh: '奶昔', hy: 'Կաթնային կոկտեյլներ', uz: 'Sutli kokteyllar', ar: 'ميلك شيك' },
  'Молочный коктейль': { en: 'Milkshake', zh: '奶昔', hy: 'Կաթնային կոկտեյլ', uz: 'Sutli kokteyl', ar: 'ميلك شيك' },
  Соки: { en: 'Juices', zh: '果汁', hy: 'Հյութեր', uz: 'Sharbatlar', ar: 'عصائر' },
  Сок: { en: 'Juice', zh: '果汁', hy: 'Հյութ', uz: 'Sharbat', ar: 'عصير' },
  'Вода с газом / без': {
    en: 'Still / Sparkling Water',
    zh: '靜水／氣泡水',
    hy: 'Հանգիստ / գազավորված ջուր',
    uz: 'Gazli / gazsiz suv',
    ar: 'مياه غازية / عادية',
  },
  'Вода и напитки': { en: 'Water & Soft Drinks', zh: '水與飲料', hy: 'Ջուր և ըմպելիքներ', uz: 'Suv va ichimliklar', ar: 'مياه ومشروبات' },
  Чаи: { en: 'Teas', zh: '茶', hy: 'Թեյեր', uz: 'Choylar', ar: 'شاي' },
  'Авторские чаи': { en: 'Signature Teas', zh: '招牌茶', hy: 'Հեղինակային թեյեր', uz: 'Mualliflik choylari', ar: 'شاي خاص' },
  'Премиальные чаи': { en: 'Premium Teas', zh: '優質茶', hy: 'Պրեմիում թեյեր', uz: 'Premium choylar', ar: 'شاي فاخر' },
  Тизаны: { en: 'Tisanes', zh: '花草茶', hy: 'Դեղաբույսերի թեյեր', uz: 'Tizanlar', ar: 'شاي أعشاب' },
  'Классические чаи': { en: 'Classic Teas', zh: '經典茶', hy: 'Դասական թեյեր', uz: 'Klassik choylar', ar: 'شاي كلاسيكي' },
  'Чайные добавки': { en: 'Tea Add-ins', zh: '茶點綴', hy: 'Թեյի հավելումներ', uz: 'Choyga qoʻshimchalar', ar: 'إضافات الشاي' },
  Кофе: { en: 'Coffee', zh: '咖啡', hy: 'Սուրճ', uz: 'Qahva', ar: 'قهوة' },
  Добавки: { en: 'Add-ins', zh: '添加', hy: 'Հավելումներ', uz: 'Qoʻshimchalar', ar: 'إضافات' },
  Коктейли: { en: 'Cocktails', zh: '雞尾酒', hy: 'Կոկտեյլներ', uz: 'Kokteyllar', ar: 'كوكتيلات' },
  'Авторские коктейли': {
    en: 'Signature Cocktails',
    zh: '招牌雞尾酒',
    hy: 'Հեղինակային կոկտեյլներ',
    uz: 'Mualliflik kokteyllari',
    ar: 'كوكتيلات خاصة',
  },
  'Классические коктейли': {
    en: 'Classic Cocktails',
    zh: '經典雞尾酒',
    hy: 'Դասական կոկտեյլներ',
    uz: 'Klassik kokteyllar',
    ar: 'كوكتيلات كلاسيكية',
  },
  'Популярные коктейли': {
    en: 'Popular Cocktails',
    zh: '人氣雞尾酒',
    hy: 'Հանրաճանաչ կոկտեյլներ',
    uz: 'Mashhur kokteyllar',
    ar: 'كوكتيلات شائعة',
  },
  Шоты: { en: 'Shots', zh: '烈酒杯', hy: 'Շոթեր', uz: 'Shotlar', ar: 'شوتات' },
  'Игристые и шампанские вина': {
    en: 'Sparkling & Champagne Wines',
    zh: '氣泡酒與香檳',
    hy: 'Փրփրուն և շամպայն գինիներ',
    uz: 'Koʻpikli vinolar va shampan',
    ar: 'نبيذ فوّار وشمبانيا',
  },
  'Белые вина': { en: 'White Wines', zh: '白葡萄酒', hy: 'Սպիտակ գինիներ', uz: 'Oq vinolar', ar: 'نبيذ أبيض' },
  'Розовые вина': { en: 'Rosé Wines', zh: '桃紅葡萄酒', hy: 'Վարդագույն գինիներ', uz: 'Pushti vinolar', ar: 'نبيذ وردي' },
  'Красные вина': { en: 'Red Wines', zh: '紅葡萄酒', hy: 'Կարմիր գինիներ', uz: 'Qizil vinolar', ar: 'نبيذ أحمر' },
  'Крепкий алкоголь': { en: 'Spirits', zh: '烈酒', hy: 'Ուժեղ ալկոհոլ', uz: 'Kuchli ichimliklar', ar: 'مشروبات روحية' },
  Текила: { en: 'Tequila', zh: '龍舌蘭', hy: 'Տեկիլա', uz: 'Tekila', ar: 'تيكيلا' },
  Джин: { en: 'Gin', zh: '琴酒', hy: 'Ջին', uz: 'Jin', ar: 'جن' },
  Ром: { en: 'Rum', zh: '蘭姆酒', hy: 'Ռոմ', uz: 'Rom', ar: 'روم' },
  Коньяк: { en: 'Cognac', zh: '干邑白蘭地', hy: 'Կոնյակ', uz: 'Konyak', ar: 'كونياك' },
  'Виски односолодовый': {
    en: 'Single Malt Whisky',
    zh: '單一麥芽威士忌',
    hy: 'Մեկ ածիկի վիսկի',
    uz: 'Bir solodli viski',
    ar: 'ويسكي سينغل مولت',
  },
  'Виски купажированный': {
    en: 'Blended Whisky',
    zh: '調和威士忌',
    hy: 'Համադրված վիսկի',
    uz: 'Kupajlangan viski',
    ar: 'ويسكي مخلوط',
  },
  Водка: { en: 'Vodka', zh: '伏特加', hy: 'Օղի', uz: 'Aroq', ar: 'فودكا' },
  Пиво: { en: 'Beer', zh: '啤酒', hy: 'Գարեջուր', uz: 'Pivo', ar: 'بيرة' },
  Настойки: { en: 'House Infusions', zh: '自製利口酒', hy: 'Թրմուկներ', uz: 'Nastoykalar', ar: 'منقوعات منزلية' },
  'Аперитивы / Биттеры / Ликёры': {
    en: 'Aperitifs / Bitters / Liqueurs',
    zh: '開胃酒／苦精／利口酒',
    hy: 'Ապերիտիվներ / Բիթերներ / Լիկյորներ',
    uz: 'Aperitivlar / Bitterlar / Likyorlar',
    ar: 'أبيريتيف / بيترز / ليكيور',
  },
  'Аперетивы / Биттеры / Ликёры': {
    en: 'Aperitifs / Bitters / Liqueurs',
    zh: '開胃酒／苦精／利口酒',
    hy: 'Ապերիտիվներ / Բիթերներ / Լիկյորներ',
    uz: 'Aperitivlar / Bitterlar / Likyorlar',
    ar: 'أبيريتيف / بيترز / ليكيور',
  },
  Закуски: { en: 'Snacks', zh: '小食', hy: 'Խորտիկներ', uz: 'Gazaklar', ar: 'وجبات خفيفة' },
  Сладости: { en: 'Sweets', zh: '甜食', hy: 'Քաղցրավենիք', uz: 'Shirinliklar', ar: 'حلويات' },
  'Винная карта': { en: 'Wine List', zh: '酒單', hy: 'Գինու քարտ', uz: 'Vino kartasi', ar: 'قائمة النبيذ' },
  'Осеннее предложение': { en: 'Autumn Offer', zh: '秋季特選', hy: 'Աշնանային առաջարկ', uz: 'Kuzgi taklif', ar: 'عرض الخريف' },
  'Горячие напитки': { en: 'Hot Drinks', zh: '熱飲', hy: 'Տաք ըմպելիքներ', uz: 'Issiq ichimliklar', ar: 'مشروبات ساخنة' },
  'Горячие алкогольные напитки': {
    en: 'Hot Alcoholic Drinks',
    zh: '熱酒精飲品',
    hy: 'Տաք ալկոհոլային ըմպելիքներ',
    uz: 'Issiq alkogolli ichimliklar',
    ar: 'مشروبات كحولية ساخنة',
  },
};

/** Перевод заголовка секции Бара «Арки» — `text` берётся прямо из контента (без slug-а). */
export function pickBarCategoryName(text: string, locale: Locale): string {
  const tr = BAR_CATEGORY_TR[text];
  if (!tr || locale === 'ru') return text;
  return tr[locale] ?? text;
}
