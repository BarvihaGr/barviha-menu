/**
 * См. apps/menu/src/lib/safe-next.ts — тот же класс уязвимости (open
 * redirect через ?next=) применительно к экрану входа в бэк-офис.
 */
const ALLOWED_PREFIXES = ['/locations', '/accounts'];

// Раньше проверялось только «относительный путь» — этого хватало против
// open redirect, но пропускало пути на давно удалённые роуты (например
// старый /gate), из-за чего вход по такой ссылке заканчивался 404 после
// успешного логина. Теперь next обязан указывать на реально существующий
// раздел бэк-офиса.
export function safeNextPath(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback;
  if (raw === '/') return raw;
  if (ALLOWED_PREFIXES.some((prefix) => raw === prefix || raw.startsWith(`${prefix}/`))) return raw;
  return fallback;
}
