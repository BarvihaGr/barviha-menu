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

/**
 * Берём ПОСЛЕДНИЙ адрес из X-Forwarded-For, не первый — см. точно такой же
 * комментарий и обоснование в apps/menu/src/lib/rate-limit.ts (security-audit,
 * первый элемент подделывается клиентом и обнуляет лимит по IP).
 */
function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) {
    const parts = fwd.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1]!;
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/**
 * true — запрос разрешён. false — превышен лимит, отдавай 429. Дефолтное
 * окно/потолок — под логин (жёстко, 10 попыток / 5 мин); для более широких
 * применений (общий лимит на API-роут, security-audit этап 5) передавай
 * opts — window/maxAttempts там мягче, чтобы не резать обычное частое
 * сохранение полей в бэк-офисе (каждый blur — отдельный PATCH).
 */
export function checkRateLimitByKey(
  bucket: string,
  key: string,
  opts?: { windowMs?: number; maxAttempts?: number },
): boolean {
  const windowMs = opts?.windowMs ?? WINDOW_MS;
  const maxAttempts = opts?.maxAttempts ?? MAX_ATTEMPTS;
  const fullKey = `${bucket}:${key}`;
  const now = Date.now();
  const entry = hits.get(fullKey);
  if (!entry || entry.resetAt < now) {
    hits.set(fullKey, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxAttempts) return false;
  entry.count += 1;
  return true;
}

/** true — запрос разрешён. false — превышен лимит, отдавай 429. Лимит по IP запросившего. */
export function checkRateLimit(request: Request, bucket: string): boolean {
  return checkRateLimitByKey(bucket, clientIp(request));
}
