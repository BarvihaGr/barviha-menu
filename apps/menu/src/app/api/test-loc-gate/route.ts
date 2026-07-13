import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { TEST_LOC_GATE_COOKIE, TEST_LOC_GATE_PASSWORD, TEST_LOC_GATE_TOKEN } from '@/lib/test-loc-gate';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === 'string' ? body.password : '';

  if (password !== TEST_LOC_GATE_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(TEST_LOC_GATE_COOKIE, TEST_LOC_GATE_TOKEN, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return res;
}
