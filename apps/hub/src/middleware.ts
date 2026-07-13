import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { HUB_GATE_COOKIE, HUB_GATE_TOKEN } from '@/lib/hub-gate';

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/gate' || pathname.startsWith('/api/hub-gate')) {
    return NextResponse.next();
  }
  if (request.cookies.get(HUB_GATE_COOKIE)?.value !== HUB_GATE_TOKEN) {
    const url = request.nextUrl.clone();
    url.pathname = '/gate';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
