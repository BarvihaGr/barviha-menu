/**
 * Единый источник basePath (/back-off — бэк-офис размещён под путём на
 * боевом домене, см. next.config.ts). Next.js сам подставляет basePath в
 * <Link>/useRouter, но НЕ в клиентские fetch('/api/...') — их нужно строить
 * через apiPath(), иначе после деплоя под путём все запросы 404-ят (в т.ч.
 * вход по паролю — форма шлёт запрос не туда и всегда получает «неверный код»).
 */
export const BASE_PATH = '/back-off';

export function apiPath(path: string): string {
  return `${BASE_PATH}${path}`;
}
