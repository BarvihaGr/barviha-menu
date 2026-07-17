import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { AccountRole } from '@barviha/db/accounts';

/**
 * Подписанная кука-сессия (jose/JWT) вместо таблицы sessions — проверка
 * подписи работает и в edge-раннтайме мидлвари, и в Node (RSC/route
 * handlers), без похода в Supabase на каждый переход. Компромисс: отключение
 * аккаунта не обрывает уже открытую сессию мгновенно — она просто истечёт по
 * TTL (см. needsRefresh ниже). Осознанно принято для проекта такого размера
 * (~30 аккаунтов), см. план "Бэк-офис: аккаунты, роли, реальный вход".
 *
 * TTL — 90 дней, кука persistent (не «сессионная») — по просьбе владельца:
 * автовход, чтобы не вводить логин/пароль каждый раз. Скользящее окно
 * (needsRefresh) продлевает срок при каждом заходе, так что при обычном
 * использовании сессия не истекает вовсе. Обратная сторона: у отключённого
 * аккаунта уже открытая сессия на чужом/старом устройстве может прожить до
 * 90 дней, если её не выгонят повторным логином — это осознанный компромисс
 * ради «не спрашивать пароль каждый раз», не баг.
 */
export const SESSION_COOKIE = 'hub_session';

const TTL_SECONDS = 90 * 24 * 60 * 60; // 90 дней

export interface SessionClaims {
  sub: string; // account id
  role: AccountRole;
  locationSlug: string | null;
  displayName: string;
}

interface VerifiedSession {
  claims: SessionClaims;
  iat: number;
  exp: number;
}

function secretKey(): Uint8Array {
  const secret = process.env.HUB_SESSION_SECRET;
  if (!secret) throw new Error('HUB_SESSION_SECRET не задан в окружении');
  return new TextEncoder().encode(secret);
}

export async function signSession(claims: SessionClaims): Promise<string> {
  return new SignJWT({ role: claims.role, locationSlug: claims.locationSlug, displayName: claims.displayName })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<VerifiedSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const role = payload.role;
    if (typeof payload.sub !== 'string' || (role !== 'big_boss' && role !== 'boss_location' && role !== 'manager')) {
      return null;
    }
    if (typeof payload.iat !== 'number' || typeof payload.exp !== 'number') return null;
    return {
      claims: {
        sub: payload.sub,
        role,
        locationSlug: typeof payload.locationSlug === 'string' ? payload.locationSlug : null,
        displayName: typeof payload.displayName === 'string' ? payload.displayName : '',
      },
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

/** Меньше половины TTL осталось — мидлварь перевыпускает куку со свежим сроком,
 * чтобы активный посреди смены сотрудник не разлогинился, а неактивный/
 * отключённый аккаунт всё равно вылетел не позже чем через TTL. */
export function needsRefresh(session: VerifiedSession): boolean {
  const total = session.exp - session.iat;
  const remaining = session.exp - Math.floor(Date.now() / 1000);
  return remaining < total / 2;
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  // persistent, а не «сессионная» — переживает закрытие браузера/перезапуск
  // телефона, это и есть автовход. Совпадает с TTL самой JWT.
  maxAge: TTL_SECONDS,
};

/** Из RSC/route handlers (apps/hub/src/app/**) — читает и проверяет куку. */
export async function getSessionAccount(): Promise<SessionClaims | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const verified = await verifySession(token);
  return verified?.claims ?? null;
}
