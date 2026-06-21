/**
 * Локации, у которых меню рендерится в светлом дизайне Coffeemania
 * (левый сайдбар категорий + воздушная сетка карточек). Блюда — наши.
 */
export const COFFEE_DESIGN_SLUGS = new Set(['baumanskaia']);

export function isCoffeeDesign(slug: string): boolean {
  return COFFEE_DESIGN_SLUGS.has(slug);
}
