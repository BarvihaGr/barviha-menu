/**
 * Визуальное различие локаций.
 *
 * Каждой локации присваивается свой акцентный цвет — чтобы 27 точек
 * различались с первого взгляда (удобнее работать). Цвета — тёплые/
 * драгоценные тона, согласованные с базовой палитрой (#2A1B11 + золото).
 *
 * Назначение детерминированное (хэш slug → индекс палитры), поэтому
 * у локации всегда один и тот же акцент. Если у локации задан brand_color
 * в данных — он имеет приоритет.
 */
import type { Locale } from '@/i18n/routing';

/** Минимальная форма, которой достаточно для выбора названия — под неё
 * структурно подходит и Location, и урезанные локальные типы (например
 * NearbyLocationPrompt.LocPoint), без явного приведения на стороне вызова. */
interface NamedLocation {
  name: string;
  name_en?: string | null;
  name_zh?: string | null;
  name_hy?: string | null;
}

/**
 * Единственное место, которое решает, как называется локация на выбранном
 * языке — раньше этот же ru/en/zh-тернарник был продублирован в 7 местах
 * (LocationSwitcher, HamburgerMenu, LocationInfoModal, [locationSlug]/page.tsx,
 * layout.tsx ×2, api/manifest/**), и ни в одном из них не было ветки `hy` —
 * армянский всегда молча падал на русское название (i18n-audit).
 */
export function pickLocationName(l: NamedLocation, locale: Locale): string {
  if (locale === 'en' && l.name_en) return l.name_en;
  if (locale === 'zh' && l.name_zh) return l.name_zh;
  if (locale === 'hy' && l.name_hy) return l.name_hy;
  return l.name;
}

/** Переводы города — `Location.city` хранит один русский текст (не per-locale
 * поле в схеме), поэтому переводим по словарю, как категории бара/подкатегории. */
const CITY_TR: Record<string, { en: string; zh: string; hy: string }> = {
  Москва: { en: 'Moscow', zh: '莫斯科', hy: 'Մոսկվա' },
  Тула: { en: 'Tula', zh: '图拉', hy: 'Տուլա' },
  Домодедово: { en: 'Domodedovo', zh: '多莫杰多沃', hy: 'Դոմոդեդովո' },
  Ереван: { en: 'Yerevan', zh: '埃里温', hy: 'Երևան' },
  Махачкала: { en: 'Makhachkala', zh: '马哈奇卡拉', hy: 'Մախաչկալա' },
  'Санкт-Петербург': { en: 'Saint Petersburg', zh: '圣彼得堡', hy: 'Սանկտ Պետերբուրգ' },
  'Нижний Новгород': { en: 'Nizhny Novgorod', zh: '下诺夫哥罗德', hy: 'Նիժնի Նովգորոդ' },
  Пенза: { en: 'Penza', zh: '奔萨', hy: 'Պենզա' },
  'Московская область': { en: 'Moscow Region', zh: '莫斯科州', hy: 'Մոսկվայի մարզ' },
  Саратов: { en: 'Saratov', zh: '萨拉托夫', hy: 'Սարատով' },
  Ташкент: { en: 'Tashkent', zh: '塔什干', hy: 'Տաշքենդ' },
};

export function pickLocationCity(city: string | null | undefined, locale: Locale): string | null | undefined {
  if (!city || locale === 'ru') return city;
  const tr = CITY_TR[city];
  if (!tr) return city;
  return locale === 'en' ? tr.en : locale === 'zh' ? tr.zh : locale === 'hy' ? tr.hy : city;
}

/** Курируемая палитра акцентов (на тон с брендом, достаточно различимы). */
const ACCENTS: string[] = [
  '#C9A227', // золото
  '#B5651D', // охра
  '#8C3B2B', // терракота
  '#1B110A', // изумруд
  '#2E5E4E', // нефрит
  '#7A4E2D', // карамель
  '#9C2B2B', // бордо
  '#3B6E8F', // петроль-синий
  '#6B4E9E', // аметист
  '#A6792E', // бронза
  '#557A46', // оливковый
  '#B07A52', // мокко
  '#8E2D55', // марсала
  '#2F6E6E', // тиал
  '#A85C2E', // медь
];

function hashSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = (h << 5) - h + slug.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getLocationAccent(slug: string, brandColor?: string | null): string {
  if (brandColor && brandColor.toLowerCase() !== '#2a1b11') return brandColor;
  return ACCENTS[hashSlug(slug) % ACCENTS.length]!;
}

/**
 * Цвет ветки метро для маркера локации в переключателе.
 *
 * Локации Москвы/Петербурга получают официальный цвет своей линии метро,
 * чтобы с первого взгляда читалось «какая ветка». Локации вне МСК/СПб
 * (другие города и страны) и точки без привязки к станции — золотом (GOLD).
 *
 * Привязка ручная (по slug). Спорные точки помечены — поправь при необходимости.
 */
const METRO_GOLD = '#C9A227';

/** Официальные цвета линий метро (Москва, + Петербург). */
const METRO_LINES = {
  red: '#DA2128', // Сокольническая (1)
  green: '#48B85E', // Замоскворецкая (2)
  blue: '#0072BA', // Арбатско-Покровская (3)
  cyan: '#19C1F3', // Филёвская (4)
  brown: '#925F33', // Кольцевая (5)
  orange: '#ED9121', // Калужско-Рижская (6)
  purple: '#943D8E', // Таганско-Краснопресненская (7)
  yellow: '#FFD400', // Калининско-Солнцевская (8)
  grey: '#A1A2A3', // Серпуховско-Тимирязевская (9)
  lime: '#B3D335', // Люблинско-Дмитровская (10)
  turquoise: '#79CDCD', // Большая кольцевая, БКЛ (11)
  spbBlue: '#0078C1', // СПб — Московско-Петроградская (2)
} as const;

/** slug → цвет ветки. Нет в карте → GOLD (вне МСК/СПб или без станции). */
const METRO_BY_SLUG: Record<string, string> = {
  arka: METRO_LINES.cyan, // Москва, Воздвиженка — Александровский сад (Филёвская)
  baumanskaia: METRO_LINES.blue, // Бауманская (Арбатско-Покровская)
  kievskaia: METRO_LINES.blue, // Киевская (Арбатско-Покровская / Кольцевая / Филёвская)
  kolomenskaia: METRO_LINES.green, // Коломенская (Замоскворецкая)
  'krasnaia-ploshchad': METRO_LINES.red, // Охотный Ряд (Сокольническая)
  'barvixa-lounge-krylatskoe': METRO_LINES.blue, // Крылатское (Арбатско-Покровская)
  marino: METRO_LINES.lime, // Марьино (Люблинско-Дмитровская)
  mendeleevskaia: METRO_LINES.grey, // Менделеевская (Серпуховско-Тимирязевская)
  mitino: METRO_LINES.blue, // Митино (Арбатско-Покровская)
  'moskva-siti': METRO_LINES.cyan, // Выставочная (Филёвская)
  otradnoe: METRO_LINES.grey, // Отрадное (Серпуховско-Тимирязевская)
  paveletskaia: METRO_LINES.green, // Павелецкая (Замоскворецкая / Кольцевая)
  ramenki: METRO_LINES.yellow, // Раменки (Калининско-Солнцевская)
  seligerskaia: METRO_LINES.lime, // Селигерская (Люблинско-Дмитровская)
  'tepliy-stan': METRO_LINES.orange, // Тёплый Стан (Калужско-Рижская)
  cska: METRO_LINES.turquoise, // ЦСКА (БКЛ)
  'iugo-zapadnaia': METRO_LINES.red, // Юго-Западная (Сокольническая)
  nevskii: METRO_LINES.spbBlue, // Невский проспект (СПб)
  domodedovo: METRO_LINES.cyan, // перекрашено под «Арку» (Филёвская, циан)
  // Золотом (вне МСК/СПб или без станции):
  //   erevan, likerka, maxackala, niznii-novgorod,
  //   penza, rublevka, barvixa-lounge-saratov, taskent
};

/** Цвет маркера ветки метро для локации. GOLD для точек вне МСК/СПб. */
export function getMetroColor(slug: string): string {
  return METRO_BY_SLUG[slug] ?? METRO_GOLD;
}

export interface LocationGroupDef {
  label: string;
  label_en?: string;
  label_zh?: string;
  label_hy?: string;
  /** true — заголовок кликабельный (стрелочка, сворачивается);
   * false — группа из одной локации, рендерится сразу списком без заголовка. */
  collapsible: boolean;
  /** Листовая группа — slug'и локаций строго в этом порядке (не по алфавиту). */
  slugs?: string[];
  /** Вложенная группа — дерево может уходить на любую глубину (страна → город → точки). */
  children?: LocationGroupDef[];
}

/** Локализованный заголовок группы/страны — `key` в ResolvedLocationNode
 * остаётся на русском (используется только как ID для open/closed-состояния,
 * не для показа), поэтому переключение языка не сбрасывает раскрытые ветки. */
function pickGroupLabel(def: LocationGroupDef, locale: Locale): string {
  if (locale === 'en' && def.label_en) return def.label_en;
  if (locale === 'zh' && def.label_zh) return def.label_zh;
  if (locale === 'hy' && def.label_hy) return def.label_hy;
  return def.label;
}

/**
 * Дерево групп в переключателе локации (HamburgerMenu/LocationSwitcher) —
 * страна → (для РФ ещё и «Города РФ») → город → точки. Порядок фиксированный,
 * задан вручную (не выводится из данных локации и не сортируется по алфавиту).
 */
export const LOCATION_GROUPS: LocationGroupDef[] = [
  {
    label: 'Россия',
    label_en: 'Russia',
    label_zh: '俄罗斯',
    label_hy: 'Ռուսաստան',
    collapsible: true,
    children: [
      {
        label: 'Москва',
        label_en: 'Moscow',
        label_zh: '莫斯科',
        label_hy: 'Մոսկվա',
        collapsible: true,
        slugs: [
          'krasnaia-ploshchad',
          'kievskaia',
          'moskva-siti',
          'paveletskaia',
          'mendeleevskaia',
          'baumanskaia',
          'mitino',
          'kolomenskaia',
          'seligerskaia',
          'ramenki',
          'iugo-zapadnaia',
          'cska',
          'marino',
          'tepliy-stan',
          'otradnoe',
          'barvixa-lounge-krylatskoe',
        ],
      },
      {
        label: 'Тула',
        label_en: 'Tula',
        label_zh: '图拉',
        label_hy: 'Տուլա',
        collapsible: true,
        slugs: ['arka', 'likerka'],
      },
      {
        label: 'Санкт-Петербург',
        label_en: 'Saint Petersburg',
        label_zh: '圣彼得堡',
        label_hy: 'Սանկտ Պետերբուրգ',
        collapsible: true,
        slugs: ['nevskii'],
      },
      {
        label: 'Домодедово',
        label_en: 'Domodedovo',
        label_zh: '多莫杰多沃',
        label_hy: 'Դոմոդեդովո',
        collapsible: false,
        slugs: ['domodedovo'],
      },
      {
        label: 'Рублёвка',
        label_en: 'Rublevka',
        label_zh: '鲁布廖夫卡',
        label_hy: 'Ռուբլյովկա',
        collapsible: false,
        slugs: ['rublevka'],
      },
      {
        label: 'Пенза',
        label_en: 'Penza',
        label_zh: '奔萨',
        label_hy: 'Պենզա',
        collapsible: false,
        slugs: ['penza'],
      },
      {
        label: 'Нижний Новгород',
        label_en: 'Nizhny Novgorod',
        label_zh: '下诺夫哥罗德',
        label_hy: 'Նիժնի Նովգորոդ',
        collapsible: false,
        slugs: ['niznii-novgorod'],
      },
      {
        label: 'Махачкала',
        label_en: 'Makhachkala',
        label_zh: '马哈奇卡拉',
        label_hy: 'Մախաչկալա',
        collapsible: false,
        slugs: ['maxackala'],
      },
      {
        label: 'Саратов',
        label_en: 'Saratov',
        label_zh: '萨拉托夫',
        label_hy: 'Սարատով',
        collapsible: false,
        slugs: ['barvixa-lounge-saratov'],
      },
    ],
  },
  {
    label: 'Армения',
    label_en: 'Armenia',
    label_zh: '亚美尼亚',
    label_hy: 'Հայաստան',
    collapsible: true,
    children: [
      {
        label: 'Ереван',
        label_en: 'Yerevan',
        label_zh: '埃里温',
        label_hy: 'Երևան',
        collapsible: false,
        slugs: ['erevan'],
      },
    ],
  },
  {
    label: 'Узбекистан',
    label_en: 'Uzbekistan',
    label_zh: '乌兹别克斯坦',
    label_hy: 'Ուզբեկստան',
    collapsible: true,
    children: [
      {
        label: 'Ташкент',
        label_en: 'Tashkent',
        label_zh: '塔什干',
        label_hy: 'Տաշքենդ',
        collapsible: false,
        slugs: ['taskent'],
      },
    ],
  },
];

/** Отфильтрованное и разрешённое (slug → Location) дерево групп — то, что реально рендерится. */
export interface ResolvedLocationNode<L> {
  key: string;
  label: string;
  collapsible: boolean;
  locs?: L[];
  children?: ResolvedLocationNode<L>[];
}

/**
 * Строит дерево для рендера: разворачивает slug'и в объекты локаций через `bySlug`,
 * фильтрует листья через `matches` (поиск), убирает опустевшие ветки и подставляет
 * заголовок группы на нужном языке (`locale`) — ключ (`key`) всегда на русском,
 * это только ID для open/closed-состояния, не показывается пользователю.
 */
export function buildLocationTree<L>(
  defs: LocationGroupDef[],
  bySlug: Map<string, L>,
  matches: (l: L) => boolean,
  locale: Locale,
  parentKey = '',
): ResolvedLocationNode<L>[] {
  const out: ResolvedLocationNode<L>[] = [];
  for (const def of defs) {
    const key = parentKey ? `${parentKey}>${def.label}` : def.label;
    const label = pickGroupLabel(def, locale);
    if (def.slugs) {
      const locs = def.slugs.map((slug) => bySlug.get(slug)).filter((l): l is L => Boolean(l)).filter(matches);
      if (locs.length > 0) out.push({ key, label, collapsible: def.collapsible, locs });
    } else if (def.children) {
      const children = buildLocationTree(def.children, bySlug, matches, locale, key);
      if (children.length > 0) out.push({ key, label, collapsible: def.collapsible, children });
    }
  }
  return out;
}

/** Путь ключей (страна → ... → группа), которые надо раскрыть по умолчанию, чтобы была видна текущая локация. */
export function findOpenLocationPath(defs: LocationGroupDef[], slug: string, parentKey = ''): string[] | null {
  for (const def of defs) {
    const key = parentKey ? `${parentKey}>${def.label}` : def.label;
    if (def.slugs?.includes(slug)) {
      return def.collapsible ? [key] : [];
    }
    if (def.children) {
      const childPath = findOpenLocationPath(def.children, slug, key);
      if (childPath !== null) return def.collapsible ? [key, ...childPath] : childPath;
    }
  }
  return null;
}
