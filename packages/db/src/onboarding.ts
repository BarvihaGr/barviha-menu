/**
 * Кто на content-store, кто нет.
 *  - TEMPLATE_SLUGS — Арка и Киевская: «Тест лок» в панели, оба готовых
 *    макета-эталона. НЕ трогаем правками для сети — это застывший образец
 *    дизайна (см. project memory). Обе на content-store (полный доступ на
 *    редактирование из бэк-офиса) — но у Киевской своя вёрстка Бара (обычная,
 *    как Кухня/Кальяны), а не шаблон ArkaMenuSections (см. usesArkaBarTemplate).
 *  - WORKING_SLUGS — реальные локации сети: 25 рабочих клонов Арки +
 *    'arka-network'/'kievskaia-network' — независимые рабочие копии Арки и
 *    Киевской для сети (склонированы один раз от 'arka'/'kievskaia', см.
 *    project memory), правки на них НЕ попадают в тестовые 'arka'/'kievskaia'
 *    и наоборот. Оформление 1:1 как у Арки, включая шаблон Бара — кроме
 *    'kievskaia-network' (см. usesArkaBarTemplate).
 */
import { MOCK_LOCATIONS } from './mock-data';

export const TEMPLATE_SLUGS = ['arka', 'kievskaia'] as const;

/** Клоны Киевской (тест + сетевая копия) — свой Бар, не шаблон Арки. */
const KIEVSKAIA_STYLE_SLUGS = ['kievskaia', 'kievskaia-network'] as const;

export const WORKING_SLUGS: string[] = MOCK_LOCATIONS.map((l) => l.slug).filter(
  (slug) => !(TEMPLATE_SLUGS as readonly string[]).includes(slug),
);

/** Локации на файловом content-store (Арка, Киевская, все рабочие клоны). */
export function isContentStoreSlug(slug: string): boolean {
  return slug === 'arka' || slug === 'kievskaia' || WORKING_SLUGS.includes(slug);
}

/**
 * Бар рендерится своей вёрсткой-шаблоном (секции + type1/type2 карточки,
 * см. ArkaMenuSections) у Арки и всех её рабочих клонов сети. У Киевской и
 * её сетевой копии ('kievskaia-network') — обычные позиции (как Кухня/
 * Кальяны), своя вёрстка не задета.
 */
export function usesArkaBarTemplate(slug: string): boolean {
  if ((KIEVSKAIA_STYLE_SLUGS as readonly string[]).includes(slug)) return false;
  return slug === 'arka' || WORKING_SLUGS.includes(slug);
}
