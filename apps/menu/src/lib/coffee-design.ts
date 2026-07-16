import { ARKA_STYLE_SLUGS, WORKING_SLUGS } from '@barviha/db/onboarding';
import { getMetroColor } from './location-theme';

const WORKING_SLUG_SET = new Set(WORKING_SLUGS);

/**
 * Локации, у которых меню рендерится в дизайне Coffeemania
 * (левый сайдбар категорий + воздушная сетка карточек). Блюда — наши.
 * Единый стиль цвета и шрифтов у обеих Аркиных ссылок (ARKA_STYLE_SLUGS —
 * 'arka' и 'arka-network', см. @barviha/db onboarding) и всех рабочих
 * клонов сети — ARKA_PALETTE ниже. Киевская — единственное исключение,
 * свой отдельный эталон (KIEV_PALETTE), не трогаем.
 */
export const COFFEE_DESIGN_SLUGS = new Set([...ARKA_STYLE_SLUGS, 'kievskaia']);

export function isCoffeeDesign(slug: string): boolean {
  return COFFEE_DESIGN_SLUGS.has(slug) || WORKING_SLUG_SET.has(slug);
}

/**
 * Вариант главной для coffee-локации:
 *  - 'lux'     — дорогой тёмный минимализм (hero c деревом, бронь, «Lounge
 *                Restaurant & Bar»). Арка, Киевская и все 25 рабочих клонов.
 *  - 'default' — воздушные плитки-категории. Сейчас не используется —
 *                весь единый стиль сети идёт через 'lux'.
 */
const LUX_HOME_SLUGS = new Set([...ARKA_STYLE_SLUGS, 'kievskaia']);

export function coffeeHomeVariant(slug: string): 'lux' | 'default' {
  return LUX_HOME_SLUGS.has(slug) || WORKING_SLUG_SET.has(slug) ? 'lux' : 'default';
}

/**
 * Ручные переопределения акцента Coffeemania: slug → откуда брать цвет ветки.
 * Сейчас пусто (берётся собственная ветка метро, если не задан COFFEE_ACCENT).
 */
const COFFEE_ACCENT_FROM: Record<string, string> = {};

/** Прямой цвет акцента для отдельных coffee-локаций (перебивает ветку метро). */
const COFFEE_ACCENT: Record<string, string> = {
  arka: '#C5A880', // как у Киевской — Арка временно 1:1 копия для теста
  'arka-network': '#C5A880', // та же Арка, вторая ссылка (см. ARKA_STYLE_SLUGS)
  kievskaia: '#C5A880', // брендбук: матовое золото / шампань (приглушённый люкс)
};

/**
 * Акцентный цвет дизайна Coffeemania. Обе Аркины ссылки и все рабочие клоны
 * сети — единый акцент Арки (COFFEE_ACCENT.arka). Киевская — свой эталон.
 */
export function getCoffeeAccent(slug: string): string {
  if (COFFEE_ACCENT[slug]) return COFFEE_ACCENT[slug];
  if (WORKING_SLUG_SET.has(slug)) return COFFEE_ACCENT.arka!;
  return getMetroColor(COFFEE_ACCENT_FROM[slug] ?? slug);
}

/** Токены палитры Coffeemania (фон/поверхности/текст/границы). */
type CoffeePalette = Record<string, string>;

/** Светлая палитра — запасной вариант, сейчас ничем не используется. */
const LIGHT_PALETTE: CoffeePalette = {
  '--cm-bg': '#fbfbfa',
  '--cm-surface': '#f3f2ef',
  '--cm-surface-2': '#ffffff',
  '--cm-text': '#1a1a1a',
  '--cm-text-soft': '#3a3a3a',
  '--cm-muted': '#6b6b6b',
  '--cm-muted-dim': '#9b9b9b',
  '--cm-border': '#ececec',
  // Текст на заливке --cm-accent (активный таб/пилюля). Здесь акцент — цвет
  // ветки метро (обычно тёмный/насыщенный), поэтому светлый текст читается.
  '--cm-accent-text': '#fbfbfa',
  // Тёмный вордмарк-лого (logo.png) на светлом фоне — без инверсии.
  '--cm-logo-invert': '0',
  // Единый цветокор фото блюд: лёгкая нормализация, без вуали (светлый фон).
  '--cm-photo': 'contrast(1.03) saturate(1.03)',
  '--cm-photo-veil': 'transparent',
};

/**
 * Светлый люкс «Киевская»: слоновая кость + тёплый брауни.
 * Фон #F2EAE0, поверхности #EAE0D4, текст тёмно-коричневый, золото #9B7A50.
 */
const KIEV_PALETTE: CoffeePalette = {
  '--cm-bg': '#D8CEC0',
  '--cm-surface': '#CABEAC',
  '--cm-surface-2': '#BEAE98',
  '--cm-text': '#3C2210',
  '--cm-text-soft': '#6B4A28',
  '--cm-muted': 'rgba(60, 34, 16, 0.52)',
  '--cm-muted-dim': 'rgba(60, 34, 16, 0.36)',
  '--cm-border': 'rgba(140, 101, 64, 0.18)',
  '--cm-logo-invert': '0',
  '--cm-photo': 'contrast(1.03) saturate(1.05)',
  '--cm-photo-veil': 'transparent',
  // Акцент здесь светлое золото (#9B7A50-#C5A880) — светлый cm-bg на нём
  // почти не читается (контраст ~1.9:1). Тёмный текст держит контраст ~6.5:1.
  '--cm-accent-text': '#3C2210',
  // Цена (текст цвета акцента поверх cm-bg, не наоборот) — тот же светлый
  // акцент на светлом cm-bg тоже почти не читается (~1.9:1), нужен тёмный.
  '--cm-accent-on-bg': '#3C2210',
};

/**
 * Палитра «Арки» — сейчас намеренно 1:1 копия KIEV_PALETTE (план изменился:
 * Арка временно используется как тестовый полигон с виду идентичный
 * Киевской, сама Киевская остаётся чистовиком и не трогается). Значения
 * продублированы (а не переиспользован объект KIEV_PALETTE), чтобы поправки
 * тут никогда не могли задеть Киевскую и наоборот.
 */
const ARKA_PALETTE: CoffeePalette = {
  '--cm-bg': '#D8CEC0',
  '--cm-surface': '#CABEAC',
  '--cm-surface-2': '#BEAE98',
  '--cm-text': '#3C2210',
  '--cm-text-soft': '#6B4A28',
  '--cm-muted': 'rgba(60, 34, 16, 0.52)',
  '--cm-muted-dim': 'rgba(60, 34, 16, 0.36)',
  '--cm-border': 'rgba(140, 101, 64, 0.18)',
  '--cm-logo-invert': '0',
  '--cm-photo': 'contrast(1.03) saturate(1.05)',
  '--cm-photo-veil': 'transparent',
  '--cm-accent-text': '#3C2210',
  '--cm-accent-on-bg': '#3C2210',
};

/** slug → палитра. Нет в карте (в т.ч. все рабочие клоны) → ARKA_PALETTE. */
const COFFEE_PALETTE: Record<string, CoffeePalette> = {
  arka: ARKA_PALETTE,
  'arka-network': ARKA_PALETTE,
  kievskaia: KIEV_PALETTE,
};

/**
 * Инлайн-стиль для корня coffee-страниц: выставляет палитру и акцент локации,
 * а также переопределяет шрифтовые переменные на брендовые (Montserrat для
 * заголовков, Manrope для текста). Всё каскадно действует на поддерево — все
 * coffee-компоненты получают палитру/типографику, не задевая остальные локации.
 */
export function coffeeAccentStyle(slug: string): React.CSSProperties {
  const palette = COFFEE_PALETTE[slug] ?? (WORKING_SLUG_SET.has(slug) ? ARKA_PALETTE : LIGHT_PALETTE);
  // Lux-локации (Ереван, Киевская) — заголовки на Cormorant SC (аналог Canela,
  // как у «Арки»); остальные coffee-точки сохраняют брендовый --cm-font-display.
  const displayFont =
    coffeeHomeVariant(slug) === 'lux'
      ? "'Cormorant SC', 'Cormorant Garamond', var(--cm-font-display)"
      : 'var(--cm-font-display)';
  return {
    ['--cm-accent']: getCoffeeAccent(slug),
    ...palette,
    ['--font-display']: displayFont,
    ['--font-sans']: 'var(--cm-font-body)',
    // Базовый шрифт всего поддерева — чтобы наследуемый текст (без явного
    // font-family) тоже стал брендовым Manrope, а не унаследовал Inter от body.
    fontFamily: 'var(--cm-font-body)',
  } as React.CSSProperties;
}
