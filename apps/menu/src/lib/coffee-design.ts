import { getMetroColor } from './location-theme';

/**
 * Локации, у которых меню рендерится в светлом дизайне Coffeemania
 * (левый сайдбар категорий + воздушная сетка карточек). Блюда — наши.
 */
export const COFFEE_DESIGN_SLUGS = new Set(['baumanskaia', 'domodedovo']);

export function isCoffeeDesign(slug: string): boolean {
  return COFFEE_DESIGN_SLUGS.has(slug);
}

/**
 * Ручные переопределения акцента Coffeemania: slug → откуда брать цвет.
 * Домодедовская вне метро (по умолчанию была бы золотом) — используем
 * фирменный цвет «Арки» (циан Филёвской линии).
 */
const COFFEE_ACCENT_FROM: Record<string, string> = {
  domodedovo: 'arka',
};

/**
 * Акцентный цвет светлого дизайна Coffeemania = фирменный цвет локации
 * (цвет ветки метро её станции). Прокидывается в CSS-переменную `--cm-accent`
 * на корне страницы и подхватывается всеми coffee-компонентами.
 */
export function getCoffeeAccent(slug: string): string {
  return getMetroColor(COFFEE_ACCENT_FROM[slug] ?? slug);
}

/**
 * Инлайн-стиль для корня coffee-страниц: выставляет акцент локации и
 * переопределяет шрифтовые переменные на брендовые (Montserrat для
 * заголовков, Manrope для текста). Переопределение каскадно действует на всё
 * поддерево — все coffee-компоненты, использующие var(--font-display) и
 * var(--font-sans), автоматически получают брендовую типографику, не задевая
 * остальные локации.
 */
export function coffeeAccentStyle(slug: string): React.CSSProperties {
  return {
    ['--cm-accent']: getCoffeeAccent(slug),
    ['--font-display']: 'var(--cm-font-display)',
    ['--font-sans']: 'var(--cm-font-body)',
    // Базовый шрифт всего поддерева — чтобы наследуемый текст (без явного
    // font-family) тоже стал брендовым Manrope, а не унаследовал Inter от body.
    fontFamily: 'var(--cm-font-body)',
  } as React.CSSProperties;
}
