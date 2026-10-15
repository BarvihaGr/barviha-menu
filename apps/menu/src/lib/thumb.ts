/**
 * Превью для карточек списка: рядом с каждым фото лежит уменьшенная копия
 * `<файл>.w720.webp` (720px по ширине, ~25–40 КБ вместо 100–170 КБ у
 * оригинала 1600px). Делает её бэк-офис при загрузке (apps/hub api/upload)
 * и скрипт deploy/thumbs/make-thumbs.mjs для уже лежащих фото.
 *
 * Если превью ещё нет, nginx отдаёт оригинал (rewrite в @app, см.
 * /etc/nginx/sites-available/menu.conf на сервере) — карточка не ломается.
 * Страница позиции и широкие баннеры показывают оригинал.
 */
const THUMB_SUFFIX = '.w720.webp';
const THUMB_DIRS = ['/menu-admin/', '/menu/', '/arka-bar/'];

export function thumbUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.endsWith(THUMB_SUFFIX)) return src;
  if (!THUMB_DIRS.some((d) => src.startsWith(d))) return src;
  if (!/\.(webp|jpe?g|png)$/i.test(src)) return src;
  return `${src}${THUMB_SUFFIX}`;
}
