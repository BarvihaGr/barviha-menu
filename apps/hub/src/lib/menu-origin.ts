/**
 * Фото (и загруженные, и смигрированные) физически лежат в
 * apps/menu/public/**, а не в apps/hub — панель и меню это два разных
 * Next-сервера/порта. Чтобы превью в панели вообще открывалось, путь нужно
 * резолвить относительно домена приложения меню, а не своего собственного.
 */
export const MENU_ORIGIN = process.env.NEXT_PUBLIC_MENU_ORIGIN ?? 'http://localhost:3000';

export function menuAssetUrl(path: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${MENU_ORIGIN}${path}`;
}
