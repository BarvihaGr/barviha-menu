import { getMetroColor } from './location-theme';

/**
 * Локации, у которых меню рендерится в дизайне Coffeemania
 * (левый сайдбар категорий + воздушная сетка карточек). Блюда — наши.
 * Палитра у каждой своя (см. COFFEE_PALETTE): Бауманская — светлая,
 * Домодедово — тёмная бронза в цветокоре «Арки».
 */
export const COFFEE_DESIGN_SLUGS = new Set(['baumanskaia', 'domodedovo', 'erevan', 'kievskaia']);

export function isCoffeeDesign(slug: string): boolean {
  return COFFEE_DESIGN_SLUGS.has(slug);
}

/**
 * Вариант главной для coffee-локации:
 *  - 'lux'     — дорогой тёмный минимализм (hero c деревом, бронь, «Lounge
 *                Restaurant & Bar»). Ереван.
 *  - 'default' — воздушные плитки-категории. Бауманская, Домодедово.
 */
const LUX_HOME_SLUGS = new Set(['erevan', 'kievskaia']);

export function coffeeHomeVariant(slug: string): 'lux' | 'default' {
  return LUX_HOME_SLUGS.has(slug) ? 'lux' : 'default';
}

/**
 * Ручные переопределения акцента Coffeemania: slug → откуда брать цвет ветки.
 * Сейчас пусто (берётся собственная ветка метро, если не задан COFFEE_ACCENT).
 */
const COFFEE_ACCENT_FROM: Record<string, string> = {};

/** Прямой цвет акцента для отдельных coffee-локаций (перебивает ветку метро). */
const COFFEE_ACCENT: Record<string, string> = {
  domodedovo: '#C49262', // бронза-золото «Арки» (тёмный цветокор)
  erevan: '#B89B6A', // приглушённое золото «дорогого минимализма»
  kievskaia: '#C5A880', // брендбук: матовое золото / шампань (приглушённый люкс)
};

/**
 * Акцентный цвет дизайна Coffeemania. По умолчанию — цвет ветки метро локации;
 * для отдельных точек перебивается фирменным цветом (COFFEE_ACCENT).
 * Прокидывается в CSS-переменную `--cm-accent` и подхватывается компонентами.
 */
export function getCoffeeAccent(slug: string): string {
  return COFFEE_ACCENT[slug] ?? getMetroColor(COFFEE_ACCENT_FROM[slug] ?? slug);
}

/** Токены палитры Coffeemania (фон/поверхности/текст/границы). */
type CoffeePalette = Record<string, string>;

/** Светлая палитра (по умолчанию) — Бауманская. */
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

/** Тёмная бронзовая палитра в цветокоре «Арки» — Домодедово. */
const BRONZE_PALETTE: CoffeePalette = {
  '--cm-bg': '#241710',
  '--cm-surface': '#34251b',
  '--cm-surface-2': '#3f2d20',
  '--cm-text': '#f1d9b0',
  '--cm-text-soft': '#e5c490',
  '--cm-muted': 'rgba(241, 217, 176, 0.66)',
  '--cm-muted-dim': 'rgba(241, 217, 176, 0.45)',
  '--cm-border': 'rgba(196, 146, 98, 0.22)',
  // Тёмный фон — тёмный вордмарк инвертируем в белый.
  '--cm-logo-invert': '1',
  // Единый цветокор: лёгкий тёплый грейд (экспозиция выровнена в самих файлах).
  '--cm-photo': 'contrast(1.04) saturate(1.04)',
  '--cm-photo-veil': 'transparent',
  '--cm-accent-text': '#241710',
};

/**
 * Дорогой тёмный минимализм (≈чёрный #111111 + кремовый текст, золото очень
 * дозированно). Ереван. Концепт: «luxury hospitality first».
 */
const LUX_PALETTE: CoffeePalette = {
  '--cm-bg': '#111111',
  '--cm-surface': '#181818',
  '--cm-surface-2': '#202020',
  '--cm-text': '#f4f0ea',
  '--cm-text-soft': '#cfc9bd',
  '--cm-muted': 'rgba(244, 240, 234, 0.58)',
  '--cm-muted-dim': 'rgba(244, 240, 234, 0.38)',
  '--cm-border': 'rgba(184, 155, 106, 0.18)',
  // Тёмный фон — тёмный вордмарк инвертируем в белый.
  '--cm-logo-invert': '1',
  // Единый «дорогой» цветокор: лёгкий контраст без вуали (экспозиция
  // выровнена в самих файлах — нормализация средней яркости).
  '--cm-photo': 'contrast(1.05) saturate(0.97)',
  '--cm-photo-veil': 'transparent',
  '--cm-accent-text': '#111111',
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

/** slug → палитра. Нет в карте → светлая. */
const COFFEE_PALETTE: Record<string, CoffeePalette> = {
  domodedovo: BRONZE_PALETTE,
  erevan: LUX_PALETTE,
  kievskaia: KIEV_PALETTE,
};

/**
 * Инлайн-стиль для корня coffee-страниц: выставляет палитру и акцент локации,
 * а также переопределяет шрифтовые переменные на брендовые (Montserrat для
 * заголовков, Manrope для текста). Всё каскадно действует на поддерево — все
 * coffee-компоненты получают палитру/типографику, не задевая остальные локации.
 */
export function coffeeAccentStyle(slug: string): React.CSSProperties {
  const palette = COFFEE_PALETTE[slug] ?? LIGHT_PALETTE;
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
