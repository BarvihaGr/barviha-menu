/**
 * Уменьшенные копии фото лежат рядом с оригиналом:
 *   `<файл>.w720.webp`  — превью для карточек списка (720px, ~25–40 КБ);
 *   `<файл>.w1200.webp` — для галереи на странице блюда (1200px, ~60–90 КБ).
 * Оригинал (до 1600px, 100–170 КБ) — только для полноэкранного просмотра.
 * Делает их бэк-офис при загрузке (apps/hub api/upload) и скрипт
 * deploy/thumbs/make-thumbs.mjs для уже лежащих фото.
 *
 * Если копии ещё нет, nginx отдаёт оригинал (rewrite в @app, см.
 * /etc/nginx/sites-available/menu.conf на сервере) — ничего не ломается.
 */
const THUMB_DIRS = ['/menu-admin/', '/menu/', '/arka-bar/'];

function variant(src: string | null | undefined, suffix: string): string | null {
  if (!src) return null;
  if (/\.w\d+\.webp$/.test(src)) return src;
  if (!THUMB_DIRS.some((d) => src.startsWith(d))) return src;
  if (!/\.(webp|jpe?g|png)$/i.test(src)) return src;
  return `${src}${suffix}`;
}

export function thumbUrl(src: string | null | undefined): string | null {
  return variant(src, '.w720.webp');
}

export function galleryUrl(src: string | null | undefined): string | null {
  return variant(src, '.w1200.webp');
}
