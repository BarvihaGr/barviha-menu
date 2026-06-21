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
