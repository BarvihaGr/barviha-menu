import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  needsRefresh,
  signSession,
  verifySession,
} from '@/lib/auth/session';
import {
  apiLocationPathIsStopListOnly,
  canAccessLocation,
  canAccessTab,
  defaultPathFor,
  tabFromLocationPath,
} from '@/lib/auth/permissions';

/**
 * Единая точка контроля доступа — и страницы, и API (см. matcher ниже, он
 * покрывает оба). Проверяет подпись сессионной JWT-куки (edge-safe, никакого
 * похода в Supabase на каждый переход) и решает по роли/локации, пускать
 * дальше или нет. См. план "Бэк-офис: аккаунты, роли, реальный вход" —
 * единственное исключение из "путь решает всё" — /api/locations/[slug]/flag
 * и /api/upload, где тело запроса читать здесь нельзя (порвёт стрим для
 * хендлера), поэтому точечные проверки живут в самих роутах.
 */

const PUBLIC_PATHS = new Set(['/login', '/api/login']);

function redirectTo(request: NextRequest, destination: string, next?: string) {
  const url = request.nextUrl.clone();
  url.pathname = destination;
  url.search = '';
  if (next) url.searchParams.set('next', next);
  return NextResponse.redirect(url);
}

function forbidden() {
  return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const verified = token ? await verifySession(token) : null;

  if (!verified) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
    return redirectTo(request, '/login', pathname);
  }
  const { claims } = verified;

  const locMatch = pathname.match(/^\/locations\/([^/]+)(?:\/.*)?$/);
  const apiLocMatch = pathname.match(/^\/api\/locations\/([^/]+)(?:\/.*)?$/);

  if (locMatch) {
    const slug = locMatch[1]!;
    if (!canAccessLocation(claims, slug) || !canAccessTab(claims.role, tabFromLocationPath(pathname, slug))) {
      return redirectTo(request, defaultPathFor(claims));
    }
  } else if (apiLocMatch) {
    const slug = apiLocMatch[1]!;
    if (!canAccessLocation(claims, slug)) return forbidden();
    if (claims.role === 'manager' && apiLocationPathIsStopListOnly(pathname, slug) !== true) {
      return forbidden();
    }
  } else if (pathname === '/accounts' || pathname.startsWith('/accounts/')) {
    if (claims.role === 'manager') return redirectTo(request, defaultPathFor(claims));
  } else if (pathname === '/api/accounts' || pathname.startsWith('/api/accounts/')) {
    if (claims.role === 'manager') return forbidden();
  } else if (pathname === '/api/upload') {
    // manager вообще не должен грузить фото (нет такой вкладки); привязку
    // boss_location к своей локации — сама форма не раскрывает без порчи
    // стрима — проверяет сам роут по forwarded-заголовкам ниже.
    if (claims.role === 'manager') return forbidden();
  }

  const headers = new Headers(request.headers);
  headers.set('x-hub-account-id', claims.sub);
  headers.set('x-hub-role', claims.role);
  if (claims.locationSlug) headers.set('x-hub-location', claims.locationSlug);

  const response = NextResponse.next({ request: { headers } });

  if (needsRefresh(verified)) {
    const fresh = await signSession(claims);
    response.cookies.set(SESSION_COOKIE, fresh, SESSION_COOKIE_OPTIONS);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
