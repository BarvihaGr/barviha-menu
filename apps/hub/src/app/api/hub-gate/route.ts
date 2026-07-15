import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { HUB_GATE_COOKIE, HUB_GATE_PASSWORD, HUB_GATE_TOKEN } from '@/lib/hub-gate';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  if (!checkRateLimit(request, 'hub-gate')) {
    return NextResponse.json({ ok: false, error: 'too many attempts' }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === 'string' ? body.password : '';

  if (password !== HUB_GATE_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(HUB_GATE_COOKIE, HUB_GATE_TOKEN, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return res;
}
