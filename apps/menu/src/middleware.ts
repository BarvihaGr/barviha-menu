import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { WORKING_SLUGS } from '@barviha/db/onboarding';

const intlMiddleware = createMiddleware(routing);
const WORKING_SLUG_SET = new Set(WORKING_SLUGS);
// Служебные пути + шаблоны («Тест лок» — Арка/Киевская) — не редиректим на Киевскую.
const SERVICE_PATHS = new Set([
  'kievskaia',
  'kievskaia-network',
  'arka',
  'arka-network',
  'arka-lab',
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
      setLastLoc(res, 'kievskaia');
      return res;
    }

    // Пароли на локациях (Арка + 25 рабочих клонов) убраны насовсем — все
    // локации открываются свободно, как раньше была только Киевская.
    if (
      slug === 'arka' ||
      slug === 'arka-network' ||
      slug === 'kievskaia' ||
      slug === 'kievskaia-network' ||
      isWorkingLocation
    ) {
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
