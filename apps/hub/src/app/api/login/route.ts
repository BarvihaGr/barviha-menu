import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { DUMMY_PASSWORD_HASH, findAccountByLoginKey, touchLastLogin, verifyPassword } from '@barviha/db/accounts';
import { SESSION_COOKIE, SESSION_COOKIE_OPTIONS, signSession } from '@/lib/auth/session';
import { checkRateLimitByKey } from '@/lib/rate-limit';

const BodySchema = z.object({
  login: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(request: NextRequest) {
  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'неверный логин или пароль' }, { status: 400 });
  }
  const loginKey = parsed.data.login.trim().toLowerCase();

  // Лимит и по IP, и отдельно по имени логина — иначе конкретный логин
  // (например "Spider") можно перебирать распределённо, с разных IP.
  if (!checkRateLimitByKey('login-ip', clientIp(request)) || !checkRateLimitByKey('login-name', loginKey)) {
    return NextResponse.json({ ok: false, error: 'слишком много попыток' }, { status: 429 });
  }

  const account = await findAccountByLoginKey(loginKey);
  // Сверяем с хэшем, даже если логин не найден — иначе ответ на "нет такого
  // логина" будет заметно быстрее ответа на "логин есть, пароль неверный", и
  // по этой разнице во времени можно перебором узнать, какие логины вообще
  // существуют в системе.
  const passwordOk = await verifyPassword(parsed.data.password, account?.password_hash ?? DUMMY_PASSWORD_HASH);

  if (!account || !passwordOk || !account.is_active) {
    return NextResponse.json({ ok: false, error: 'неверный логин или пароль' }, { status: 401 });
  }

  await touchLastLogin(account.id);

  const token = await signSession({
    sub: account.id,
    role: account.role,
    locationSlug: account.location_slug,
    displayName: account.display_name,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  return res;
}
