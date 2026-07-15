/**
 * Простой in-memory rate limiter на IP — для gate-эндпоинтов (arka-gate,
 * test-loc-gate), у которых пароль — это 4-значный код без него их можно
 * перебрать целиком (0000-9999) скриптом за секунды. Redis/Upstash тут
 * избыточен: один Node-процесс в fork-режиме (см. pm2 list на проде), без
 * кластеризации — состояние в памяти процесса корректно отражает реальный
 * трафик. Не переживает рестарт процесса — это ОК, это защита от быстрого
 * автоматического перебора, а не постоянный бан.
 */
const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 15;

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
