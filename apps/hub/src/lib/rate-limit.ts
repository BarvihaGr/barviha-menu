/**
 * In-memory rate limiter на IP для /api/hub-gate — единственный пароль на
 * весь бэк-офис (весь контент сети + загрузка фото), без него его можно
 * перебирать скриптом сколько угодно раз в секунду. Один Node-процесс в
 * fork-режиме (pm2), состояние в памяти — see apps/menu/src/lib/rate-limit.ts
 * (тот же паттерн, продублировано — разные приложения, общий импорт
 * невозможен).
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
export function checkRateLimit(request: Request, bucket: string): boolean {
  const key = `${bucket}:${clientIp(request)}`;
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count += 1;
  return true;
}
