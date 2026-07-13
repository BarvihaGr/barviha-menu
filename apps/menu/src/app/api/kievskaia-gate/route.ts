import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { KIEVSKAIA_GATE_COOKIE, KIEVSKAIA_GATE_PASSWORD, KIEVSKAIA_GATE_TOKEN } from '@/lib/kievskaia-gate';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === 'string' ? body.password : '';

  if (password !== KIEVSKAIA_GATE_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(KIEVSKAIA_GATE_COOKIE, KIEVSKAIA_GATE_TOKEN, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return res;
}
