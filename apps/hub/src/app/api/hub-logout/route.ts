import { NextResponse } from 'next/server';
import { HUB_GATE_COOKIE } from '@/lib/hub-gate';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(HUB_GATE_COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
