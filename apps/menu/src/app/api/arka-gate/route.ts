import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ARKA_GATE_COOKIE, ARKA_GATE_PASSWORD, ARKA_GATE_TOKEN } from '@/lib/arka-gate';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === 'string' ? body.password : '';

  if (password !== ARKA_GATE_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  // Без maxAge/expires — сессионная cookie: живёт, пока браузер открыт,
  // пропадает при полном закрытии. Каждый новый визит спросит код заново.
  res.cookies.set(ARKA_GATE_COOKIE, ARKA_GATE_TOKEN, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return res;
}
