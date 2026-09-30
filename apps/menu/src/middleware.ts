import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import type { NextRequest, NextResponse } from 'next/server';
import { WORKING_SLUGS } from '@barviha/db/onboarding';

const intlMiddleware = createMiddleware(routing);
const WORKING_SLUG_SET = new Set(WORKING_SLUGS);

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
    const slug = locationMatch[2] ?? '';
    const isWorkingLocation = WORKING_SLUG_SET.has(slug);

    // Несуществующий slug не редиректим (раньше уводили на /kievskaia — мусорные
    // ссылки и сканеры получали 302 на живую страницу): он идёт дальше обычным
    // путём, и [locationSlug]/layout.tsx отвечает настоящим 404. Rewrite на
    // страницу 404 отсюда делать нельзя: сервер слушает 127.0.0.1, Next считает
    // такой rewrite внешним и пытается проксировать запрос сам в себя.

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
