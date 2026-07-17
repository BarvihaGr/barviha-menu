/**
 * In-memory rate limiter — состояние в памяти одного Node-процесса
 * (pm2, fork-режим), see apps/menu/src/lib/rate-limit.ts (тот же паттерн,
 * продублировано — разные приложения, общий импорт невозможен).
 *
 * Изначально — только по IP для /api/hub-gate (единственный пароль на весь
 * бэк-офис). После перехода на аккаунты (см. /api/login) лимит по IP одному
 * не защищает конкретный логин (например «Spider») от распределённого
 * перебора с разных адресов — checkRateLimitByKey даёт лимитировать по
 * произвольному ключу вдобавок к IP.
 */
const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 10;

const hits = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/** true — запрос разрешён. false — превышен лимит, отдавай 429. */
export function checkRateLimitByKey(bucket: string, key: string): boolean {
  const fullKey = `${bucket}:${key}`;
  const now = Date.now();
  const entry = hits.get(fullKey);
  if (!entry || entry.resetAt < now) {
    hits.set(fullKey, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count += 1;
  return true;
}

/** true — запрос разрешён. false — превышен лимит, отдавай 429. Лимит по IP запросившего. */
export function checkRateLimit(request: Request, bucket: string): boolean {
  return checkRateLimitByKey(bucket, clientIp(request));
}
