import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ARKA_GATE_COOKIE, ARKA_GATE_TOKEN } from './lib/arka-gate';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Редирект любой локации кроме kievskaia на /kievskaia
  // Паттерн: /{locale}/{locationSlug}/...  где locale = ru|en|zh|hy
  const locationMatch = pathname.match(/^\/(ru|en|zh|hy)\/([^/]+)(\/.*)?$/);
  if (locationMatch) {
    const locale = locationMatch[1];
    const slug = locationMatch[2] ?? '';
    // Пропускаем служебные пути и саму Киевскую
    const passThrough = ['kievskaia', 'arka', 'arka-lab', 'arka-gate', 'board', 'buttons', 'concepts'];
    if (!passThrough.includes(slug)) {
      const rest = locationMatch[3] ?? '';
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/kievskaia${rest}`;
      return NextResponse.redirect(url, { status: 302 });
    }

    // Арка — тестовая локация, закрыта паролем: даже по прямой ссылке без
    // валидной cookie отправляем на экран ввода кода, а не сразу на страницу.
    if (slug === 'arka' && request.cookies.get(ARKA_GATE_COOKIE)?.value !== ARKA_GATE_TOKEN) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/arka-gate`;
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url, { status: 302 });
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
