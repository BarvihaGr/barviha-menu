/**
 * См. apps/menu/src/lib/safe-next.ts — тот же класс уязвимости (open
 * redirect через ?next=) применительно к экрану входа в бэк-офис.
 */
export function safeNextPath(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback;
  return raw;
}
