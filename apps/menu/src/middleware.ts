import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Редирект любой локации кроме kievskaia на /kievskaia
  // Паттерн: /{locale}/{locationSlug}/...  где locale = ru|en|zh|hy
  const locationMatch = pathname.match(/^\/(ru|en|zh|hy)\/([^/]+)(\/.*)?$/);
  if (locationMatch) {
    const slug = locationMatch[2] ?? '';
    // Пропускаем служебные пути и саму Киевскую
    const passThrough = ['kievskaia', 'board', 'buttons', 'concepts'];
    if (!passThrough.includes(slug)) {
      const locale = locationMatch[1];
      const rest   = locationMatch[3] ?? '';
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/kievskaia${rest}`;
      return NextResponse.redirect(url, { status: 302 });
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
