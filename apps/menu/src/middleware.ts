import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { WORKING_SLUGS } from '@barviha/db/onboarding';
import { ARKA_GATE_COOKIE } from './lib/arka-gate';
import { TEST_LOC_GATE_COOKIE } from './lib/test-loc-gate';

const intlMiddleware = createMiddleware(routing);
const WORKING_SLUG_SET = new Set(WORKING_SLUGS);
// Служебные пути + шаблоны («Тест лок» — Арка/Киевская) — не редиректим на Киевскую.
const SERVICE_PATHS = new Set([
  'kievskaia',
  'arka',
  'arka-lab',
  'arka-gate',
  'test-loc-gate',
  'board',
  'buttons',
  'concepts',
]);

/**
 * Сессионная cookie: slug последней открытой локации. По просьбе пользователя
 * код доступа должен спрашиваться заново при КАЖДОМ переходе между локациями
 * (в т.ч. между двумя рабочими локациями, у которых один общий пароль/cookie)
 * — а не один раз за сессию браузера. Сравнение lastSlug !== slug и даёт этот
 * эффект: валидность гейт-cookie игнорируется, если только что пришли извне.
 */
const LAST_LOC_COOKIE = 'last_loc_slug';

function setLastLoc(res: NextResponse, slug: string) {
  res.cookies.set(LAST_LOC_COOKIE, slug, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Паттерн: /{locale}/{locationSlug}/...  где locale = ru|en|zh|hy
  const locationMatch = pathname.match(/^\/(ru|en|zh|hy)\/([^/]+)(\/.*)?$/);
  if (locationMatch) {
    const locale = locationMatch[1];
    const slug = locationMatch[2] ?? '';
    const isWorkingLocation = WORKING_SLUG_SET.has(slug);

    // Любой slug, который не Киевская/Арка/служебный и не одна из 25 рабочих
    // локаций — редиректим на /kievskaia (ещё не запущенные точки сети).
    if (!SERVICE_PATHS.has(slug) && !isWorkingLocation) {
      const rest = locationMatch[3] ?? '';
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/kievskaia${rest}`;
      const res = NextResponse.redirect(url, { status: 302 });
      res.cookies.delete(ARKA_GATE_COOKIE);
      res.cookies.delete(TEST_LOC_GATE_COOKIE);
      setLastLoc(res, 'kievskaia');
      return res;
    }

    // По просьбе пользователя пароли на локациях (Арка + 25 рабочих клонов)
    // убраны — все локации открываются свободно, как раньше была только
    // Киевская. Инфраструктура гейтов (страницы /arka-gate, /test-loc-gate,
    // их API-роуты) осталась в коде на случай, если пароли понадобится
    // вернуть — просто не вызывается отсюда.
    if (slug === 'arka' || slug === 'kievskaia' || isWorkingLocation) {
      const res = intlMiddleware(request);
      setLastLoc(res, slug);
      return res;
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
