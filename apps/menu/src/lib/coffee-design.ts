import { getMetroColor } from './location-theme';

/**
 * Локации, у которых меню рендерится в светлом дизайне Coffeemania
 * (левый сайдбар категорий + воздушная сетка карточек). Блюда — наши.
 */
export const COFFEE_DESIGN_SLUGS = new Set(['baumanskaia']);

export function isCoffeeDesign(slug: string): boolean {
  return COFFEE_DESIGN_SLUGS.has(slug);
}

/**
 * Акцентный цвет светлого дизайна Coffeemania = фирменный цвет локации
 * (цвет ветки метро её станции). Прокидывается в CSS-переменную `--cm-accent`
 * на корне страницы и подхватывается всеми coffee-компонентами.
 */
export function getCoffeeAccent(slug: string): string {
  return getMetroColor(slug);
}

/** Инлайн-стиль с выставленной переменной акцента (для корня coffee-страниц). */
export function coffeeAccentStyle(slug: string): React.CSSProperties {
  return { ['--cm-accent']: getCoffeeAccent(slug) } as React.CSSProperties;
}
