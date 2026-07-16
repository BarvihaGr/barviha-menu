/**
 * Кто на content-store, кто нет.
 *  - TEMPLATE_SLUGS — 'arka-network' и 'kievskaia-network': «Тест лок» в
 *    панели, оба готовых макета-эталона. НЕ трогаем правками для сети — это
 *    застывший образец дизайна (см. project memory). Обе на content-store
 *    (полный доступ на редактирование из бэк-офиса) — но у Киевской своя
 *    вёрстка Бара (обычная, как Кухня/Кальяны), а не шаблон ArkaMenuSections
 *    (см. usesArkaBarTemplate).
 *
 *    2026-07-16/17: слоты 'arka'/'arka-network' и 'kievskaia'/'kievskaia-
 *    network' переставлены местами по просьбе пользователя — боевая
 *    («живая») копия сети должна открываться на короткой ссылке (/arka,
 *    /kievskaia), а не на страшной /arka-network, /kievskaia-network.
 *    Раньше было наоборот (тест жил на короткой ссылке). Содержимое
 *    content-store папок физически переименовано (arka ⇄ arka-network,
 *    kievskaia ⇄ kievskaia-network) на VDS и локально, здесь просто
 *    отражена новая раскладка.
 *  - WORKING_SLUGS — реальные локации сети: 25 рабочих клонов Арки (включая
 *    саму 'arka') + 'kievskaia' (теперь тоже рабочая). Оформление 1:1 как у
 *    Арки, включая шаблон Бара — кроме Киевских ссылок (см. usesArkaBarTemplate).
 *  - ARKA_STYLE_SLUGS / KIEVSKAIA_STYLE_SLUGS — обе ссылки каждой из двух пар
 *    должны выглядеть одинаково (та же вёрстка Бара, тот же дизайн-акцент),
 *    даже если по TEMPLATE_SLUGS/WORKING_SLUGS они в разных группах.
 */
import { MOCK_LOCATIONS } from './mock-data';

export const TEMPLATE_SLUGS = ['arka-network', 'kievskaia-network'] as const;

/** Обе Аркины ссылки — один и тот же дизайн, независимо от группы. */
export const ARKA_STYLE_SLUGS = ['arka', 'arka-network'] as const;

/** Обе Киевские ссылки — один и тот же дизайн (свой Бар, не шаблон Арки). */
export const KIEVSKAIA_STYLE_SLUGS = ['kievskaia', 'kievskaia-network'] as const;

export const WORKING_SLUGS: string[] = MOCK_LOCATIONS.map((l) => l.slug).filter(
  (slug) => !(TEMPLATE_SLUGS as readonly string[]).includes(slug),
);

/** Локации на файловом content-store (Арка×2, Киевская×2, все рабочие клоны). */
export function isContentStoreSlug(slug: string): boolean {
  return (
    (ARKA_STYLE_SLUGS as readonly string[]).includes(slug) ||
    (KIEVSKAIA_STYLE_SLUGS as readonly string[]).includes(slug) ||
    WORKING_SLUGS.includes(slug)
  );
}

/**
 * Бар рендерится своей вёрсткой-шаблоном (секции + type1/type2 карточки,
 * см. ArkaMenuSections) у обеих Аркиных ссылок и всех рабочих клонов сети.
 * У обеих Киевских ссылок — обычные позиции (как Кухня/Кальяны), своя
 * вёрстка не задета.
 */
export function usesArkaBarTemplate(slug: string): boolean {
  if ((KIEVSKAIA_STYLE_SLUGS as readonly string[]).includes(slug)) return false;
  return (ARKA_STYLE_SLUGS as readonly string[]).includes(slug) || WORKING_SLUGS.includes(slug);
}
