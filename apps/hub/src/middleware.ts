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
import { checkRateLimitByKey } from '@/lib/rate-limit';
import { securityLog } from '@/lib/security-log';

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

// Общий потолок тела запроса для JSON API-роутов (security-audit, этап 5) —
// без него request.json() в самом хендлере буферизует в память ЛЮБОЙ
// присланный объём до того, как Zod вообще успеет что-то отклонить по
// длине полей. /api/upload — исключение: там уже свой, больший лимит под
// файлы (см. api/upload/route.ts, MAX_UPLOAD_BYTES) и своя проверка
// Content-Length до чтения тела.
const MAX_JSON_BODY_BYTES = 1024 * 1024; // 1 МБ — с большим запасом над любым реальным JSON-патчем

function redirectTo(request: NextRequest, destination: string, next?: string) {
  const url = request.nextUrl.clone();
  url.pathname = destination;
  url.search = '';
  if (next) url.searchParams.set('next', next);
  return NextResponse.redirect(url);
}

function forbidden(pathname: string, accountId: string) {
  // 403 здесь означает "залогинен, но лезет не в свою локацию/вкладку" —
  // самый интересный для мониторинга случай (в отличие от обычного 401
  // у гостя без сессии), поэтому логируем именно его.
  securityLog('forbidden', { pathname, accountId });
  return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/') && pathname !== '/api/upload') {
    const declaredLength = Number(request.headers.get('content-length') ?? '');
    if (Number.isFinite(declaredLength) && declaredLength > MAX_JSON_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: 'payload too large' }, { status: 413 });
    }
  }

  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  // Старый /gate удалён при переходе на аккаунты, но у части сотрудников
  // остались сохранённые ссылки/ярлыки на него — без этого редиректа они
  // упирались в 404 вместо входа.
  if (pathname === '/gate' || pathname.startsWith('/gate/')) {
    return redirectTo(request, '/');
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const verified = token ? await verifySession(token) : null;

  if (!verified) {
    if (pathname.startsWith('/api/')) {
      if (token) securityLog('invalid_session_token', { pathname });
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
    return redirectTo(request, '/login', pathname);
  }
  const { claims } = verified;

  // Общий лимит на API для уже аутентифицированного аккаунта — не про
  // подбор пароля (это login-ip/login-name), а backstop от сорвавшегося
  // скрипта/скомпрометированной сессии, которая долбит API в цикле
  // (security-audit, этап 5). Потолок нарочно щедрый — обычное частое
  // редактирование (blur на каждое поле) в него не упирается.
  if (pathname.startsWith('/api/') && !checkRateLimitByKey('api-account', claims.sub, { windowMs: 60_000, maxAttempts: 300 })) {
    securityLog('api_rate_limited', { pathname, accountId: claims.sub });
    return NextResponse.json({ ok: false, error: 'too many requests' }, { status: 429 });
  }

  const locMatch = pathname.match(/^\/locations\/([^/]+)(?:\/.*)?$/);
  const apiLocMatch = pathname.match(/^\/api\/locations\/([^/]+)(?:\/.*)?$/);

  if (locMatch) {
    const slug = locMatch[1]!;
    if (!canAccessLocation(claims, slug) || !canAccessTab(claims.role, tabFromLocationPath(pathname, slug))) {
      return redirectTo(request, defaultPathFor(claims));
    }
  } else if (apiLocMatch) {
    const slug = apiLocMatch[1]!;
    if (!canAccessLocation(claims, slug)) return forbidden(pathname, claims.sub);
    if (claims.role === 'manager' && apiLocationPathIsStopListOnly(pathname, slug) !== true) {
      return forbidden(pathname, claims.sub);
    }
  } else if (pathname === '/accounts' || pathname.startsWith('/accounts/')) {
    if (claims.role === 'manager') return redirectTo(request, defaultPathFor(claims));
  } else if (pathname === '/api/accounts' || pathname.startsWith('/api/accounts/')) {
    if (claims.role === 'manager') return forbidden(pathname, claims.sub);
  } else if (pathname === '/api/upload') {
    // manager вообще не должен грузить фото (нет такой вкладки); привязку
    // boss_location к своей локации — сама форма не раскрывает без порчи
    // стрима — проверяет сам роут по forwarded-заголовкам ниже.
    if (claims.role === 'manager') return forbidden(pathname, claims.sub);
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
