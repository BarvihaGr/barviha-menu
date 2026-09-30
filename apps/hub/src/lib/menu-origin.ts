/**
 * Фото (и загруженные, и смигрированные) физически лежат в
 * apps/menu/public/**, а не в apps/hub — панель и меню это два разных
 * Next-сервера/порта.
 *
 * Два разных адреса меню, их нельзя путать (security-audit 30.09, M11):
 *
 *  - MENU_ASSET_ORIGIN — для БРАУЗЕРА (превью фото в панели). На проде меню и
 *    бэк-офис живут на одном домене (nginx: /back-off → hub, всё остальное →
 *    menu), поэтому адрес пустой — путь от корня того же сайта. Раньше тут
 *    был дефолт http://localhost:3000 и адрес прода приходил из
 *    NEXT_PUBLIC_MENU_ORIGIN; когда файл с этой переменной пропал с сервера,
 *    все превью в бэк-офисе стали битыми (браузер сотрудника шёл за фото на
 *    собственный localhost). Переменная оставлена как необязательное
 *    переопределение (если меню когда-нибудь уедет на другой домен).
 *
 *  - MENU_RELAY_ORIGIN — для СЕРВЕРА хаба (передача загруженного фото в
 *    приложение меню, см. api/upload). Оба процесса на одной машине, меню
 *    слушает только 127.0.0.1 — ходим напрямую, мимо nginx. Именно
 *    127.0.0.1, не localhost: тот может разрешиться в ::1, где меню не слушает.
 */
const isProd = process.env.NODE_ENV === 'production';

export const MENU_ASSET_ORIGIN = process.env.NEXT_PUBLIC_MENU_ORIGIN ?? (isProd ? '' : 'http://localhost:3000');

export const MENU_RELAY_ORIGIN = process.env.MENU_RELAY_ORIGIN ?? 'http://127.0.0.1:3000';

export function menuAssetUrl(path: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${MENU_ASSET_ORIGIN}${path}`;
}
