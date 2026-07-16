/**
 * Кто на content-store, кто нет.
 *  - TEMPLATE_SLUGS — 'arka-network' и 'kievskaia': «Тест лок» в панели, оба
 *    готовых макета-эталона. НЕ трогаем правками для сети — это застывший
 *    образец дизайна (см. project memory). Обе на content-store (полный
 *    доступ на редактирование из бэк-офиса) — но у Киевской своя вёрстка
 *    Бара (обычная, как Кухня/Кальяны), а не шаблон ArkaMenuSections
 *    (см. usesArkaBarTemplate).
 *
 *    2026-07-16: слоты 'arka'/'arka-network' переставлены местами по
 *    просьбе пользователя — боевая («живая») копия сети должна открываться
 *    на короткой ссылке /arka, а не на /arka-network. Раньше было наоборот
 *    (тест жил на /arka). Содержимое content-store папок физически
 *    переименовано (arka ⇄ arka-network), здесь просто отражена новая
 *    раскладка. Киевская не тронута.
 *  - WORKING_SLUGS — реальные локации сети: 25 рабочих клонов Арки (включая
 *    саму 'arka', теперь тоже рабочая) + 'kievskaia-network' — независимая
 *    рабочая копия Киевской для сети. Оформление 1:1 как у Арки, включая
 *    шаблон Бара — кроме 'kievskaia-network' (см. usesArkaBarTemplate).
 *  - ARKA_STYLE_SLUGS — обе Аркины ссылки ('arka' и 'arka-network') должны
 *    выглядеть одинаково (та же вёрстка Бара, тот же дизайн-акцент), даже
 *    если по TEMPLATE_SLUGS/WORKING_SLUGS они в разных группах.
 */
import { MOCK_LOCATIONS } from './mock-data';

export const TEMPLATE_SLUGS = ['arka-network', 'kievskaia'] as const;

/** Обе Аркины ссылки — один и тот же дизайн, независимо от группы. */
export const ARKA_STYLE_SLUGS = ['arka', 'arka-network'] as const;

/** Клоны Киевской (тест + сетевая копия) — свой Бар, не шаблон Арки. */
const KIEVSKAIA_STYLE_SLUGS = ['kievskaia', 'kievskaia-network'] as const;

export const WORKING_SLUGS: string[] = MOCK_LOCATIONS.map((l) => l.slug).filter(
  (slug) => !(TEMPLATE_SLUGS as readonly string[]).includes(slug),
);

/** Локации на файловом content-store (Арка×2, Киевская, все рабочие клоны). */
export function isContentStoreSlug(slug: string): boolean {
  return (
    (ARKA_STYLE_SLUGS as readonly string[]).includes(slug) ||
    slug === 'kievskaia' ||
    WORKING_SLUGS.includes(slug)
  );
}

/**
 * Бар рендерится своей вёрсткой-шаблоном (секции + type1/type2 карточки,
 * см. ArkaMenuSections) у обеих Аркиных ссылок и всех рабочих клонов сети.
 * У Киевской и её сетевой копии ('kievskaia-network') — обычные позиции
 * (как Кухня/Кальяны), своя вёрстка не задета.
 */
export function usesArkaBarTemplate(slug: string): boolean {
  if ((KIEVSKAIA_STYLE_SLUGS as readonly string[]).includes(slug)) return false;
  return (ARKA_STYLE_SLUGS as readonly string[]).includes(slug) || WORKING_SLUGS.includes(slug);
}
