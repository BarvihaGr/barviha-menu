import type { AccountRole } from '@barviha/db/accounts';
import type { SessionClaims } from './session';

/**
 * Чистые, edge-safe правила ролей/доступа — без импортов Node-only модулей
 * (bcrypt, Supabase-клиент и т.п.), чтобы middleware.ts мог их использовать
 * напрямую в edge-раннтайме. Единый источник правды и для мидлвари (жёсткий
 * гейт), и для PageShell/TabNav (видимость вкладок в навигации) — см. план
 * "Бэк-офис: аккаунты, роли, реальный вход".
 */
export type TabKey = 'settings' | 'kitchen' | 'bar' | 'hookah' | 'add' | 'stop-list' | 'archive' | 'stats';

export const ALL_TABS: TabKey[] = ['settings', 'kitchen', 'bar', 'hookah', 'add', 'stop-list', 'archive', 'stats'];

const MANAGER_TABS: TabKey[] = ['stop-list'];

const TAB_SEGMENT: Record<string, TabKey> = {
  '': 'settings',
  kitchen: 'kitchen',
  bar: 'bar',
  hookah: 'hookah',
  add: 'add',
  'stop-list': 'stop-list',
  archive: 'archive',
  stats: 'stats',
};

/** Вкладки, видимые роли — используется и в навигации (PageShell → TabNav), и в мидлвари (canAccessTab). */
export function visibleTabsFor(role: AccountRole): TabKey[] {
  return role === 'manager' ? MANAGER_TABS : ALL_TABS;
}

/** Куда вести после логина / при попытке зайти туда, куда нельзя. */
export function defaultPathFor(session: SessionClaims): string {
  if (session.role === 'big_boss' || !session.locationSlug) return '/locations/arka';
  return session.role === 'manager'
    ? `/locations/${session.locationSlug}/stop-list`
    : `/locations/${session.locationSlug}`;
}

export function canAccessLocation(session: SessionClaims, slug: string): boolean {
  if (session.role === 'big_boss') return true;
  return session.locationSlug === slug;
}

/** `/locations/<slug>` → 'settings', `/locations/<slug>/<tab>` → соответствующий TabKey, иначе null. */
export function tabFromLocationPath(pathname: string, slug: string): TabKey | null {
  const base = `/locations/${slug}`;
  if (pathname === base) return 'settings';
  if (!pathname.startsWith(`${base}/`)) return null;
  const rest = pathname.slice(base.length + 1).split('/')[0] ?? '';
  return TAB_SEGMENT[rest] ?? null;
}

export function canAccessTab(role: AccountRole, tab: TabKey | null): boolean {
  if (tab === null) return true; // неизвестный сегмент — не задача этой проверки (пусть роутер сам решит, 404 и т.п.)
  return visibleTabsFor(role).includes(tab);
}

/**
 * Относится ли `/api/locations/<slug>/**`-путь к «стоп-листу» (единственное,
 * что доступно роли manager через API) или ко всему остальному. flag/** —
 * общий роут для Стоп-листа и Архива (is_available vs is_archived) — тело
 * запроса тут не читаем (нельзя без порчи стрима для хендлера), поэтому
 * относим путь целиком к stop-list, а разницу "вернуть в меню" / "вернуть
 * из архива" проверяет точечно сам роут, см.
 * apps/hub/src/app/api/locations/[slug]/flag/[realm]/[id]/route.ts.
 */
export function apiLocationPathIsStopListOnly(pathname: string, slug: string): boolean | null {
  const base = `/api/locations/${slug}`;
  if (!pathname.startsWith(`${base}/`)) return null;
  const rest = pathname.slice(base.length + 1).split('/')[0] ?? '';
  return rest === 'flag';
}
