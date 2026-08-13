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

// Хиты копятся, пока жив процесс (см. комментарий выше — это осознанно,
// не переживает рестарт), но БЕЗ чистки старых записей карта растёт вечно,
// пока процесс не перезапустят — за недели аптайма на pm2 это медленная
// утечка памяти (security-audit, этап 5). Раз в CLEANUP_INTERVAL_MS сметаем
// всё, что уже истекло.
const CLEANUP_INTERVAL_MS = 30 * 60 * 1000;

const hits = new Map<string, { count: number; resetAt: number }>();
let lastCleanup = Date.now();

function cleanupIfDue(now: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of hits) {
    if (entry.resetAt < now) hits.delete(key);
  }
}

/**
 * Берём ПОСЛЕДНИЙ адрес из X-Forwarded-For, не первый. nginx перед нами
 * пишет заголовок через $proxy_add_x_forwarded_for — это цепочка "то, что
 * прислал клиент" + ", " + реальный IP клиента, добавленный самим nginx в
 * конец. Первый элемент полностью подконтролен клиенту (можно послать
 * X-Forwarded-For: 1.2.3.4 и обнулять его на каждый запрос) — с ним лимит
 * по IP тривиально обходится сменой заголовка. Последний элемент — то, что
 * реально видел nginx на TCP-уровне, его подделать нельзя (см. security-audit).
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
 * true — запрос разрешён. false — превышен лимит, отдавай 429. Дефолт
 * (15/5мин) — под перебор 4-значного кода; для более легитимно частых
 * сценариев (например, серийная загрузка фото из бэк-офиса, см.
 * api/upload-asset) передавай opts с более мягким потолком.
 */
export function checkRateLimit(
  request: Request,
  bucket: string,
  opts?: { windowMs?: number; maxAttempts?: number },
): boolean {
  const windowMs = opts?.windowMs ?? WINDOW_MS;
  const maxAttempts = opts?.maxAttempts ?? MAX_ATTEMPTS;
  const key = `${bucket}:${clientIp(request)}`;
  const now = Date.now();
  cleanupIfDue(now);
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxAttempts) return false;
  entry.count += 1;
  return true;
}
