import { getMetroColor } from './location-theme';

/**
 * Локации, у которых меню рендерится в дизайне Coffeemania
 * (левый сайдбар категорий + воздушная сетка карточек). Блюда — наши.
 * Палитра у каждой своя (см. COFFEE_PALETTE): Бауманская — светлая,
 * Домодедово — тёмная бронза в цветокоре «Арки».
 */
export const COFFEE_DESIGN_SLUGS = new Set(['baumanskaia', 'domodedovo']);

export function isCoffeeDesign(slug: string): boolean {
  return COFFEE_DESIGN_SLUGS.has(slug);
}

/**
 * Ручные переопределения акцента Coffeemania: slug → откуда брать цвет ветки.
 * Сейчас пусто (берётся собственная ветка метро, если не задан COFFEE_ACCENT).
 */
const COFFEE_ACCENT_FROM: Record<string, string> = {};

/** Прямой цвет акцента для отдельных coffee-локаций (перебивает ветку метро). */
const COFFEE_ACCENT: Record<string, string> = {
  domodedovo: '#C49262', // бронза-золото «Арки» (тёмный цветокор)
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
};

/** slug → палитра. Нет в карте → светлая. */
const COFFEE_PALETTE: Record<string, CoffeePalette> = {
  domodedovo: BRONZE_PALETTE,
};

/**
 * Инлайн-стиль для корня coffee-страниц: выставляет палитру и акцент локации,
 * а также переопределяет шрифтовые переменные на брендовые (Montserrat для
 * заголовков, Manrope для текста). Всё каскадно действует на поддерево — все
 * coffee-компоненты получают палитру/типографику, не задевая остальные локации.
 */
export function coffeeAccentStyle(slug: string): React.CSSProperties {
  const palette = COFFEE_PALETTE[slug] ?? LIGHT_PALETTE;
  return {
    ['--cm-accent']: getCoffeeAccent(slug),
    ...palette,
    ['--font-display']: 'var(--cm-font-display)',
    ['--font-sans']: 'var(--cm-font-body)',
    // Базовый шрифт всего поддерева — чтобы наследуемый текст (без явного
    // font-family) тоже стал брендовым Manrope, а не унаследовал Inter от body.
    fontFamily: 'var(--cm-font-body)',
  } as React.CSSProperties;
}
