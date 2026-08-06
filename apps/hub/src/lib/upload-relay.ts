/**
 * Общий секрет с apps/menu/src/lib/upload-relay.ts (см. там подробности,
 * включая security-audit про недопустимость тихого дефолта в проде) — не
 * общий импорт (разные приложения), а одинаковое имя env-переменной. В проде
 * UPLOAD_RELAY_SECRET должен быть задан одинаково у ОБОИХ сервисов.
 */
function resolveUploadRelaySecret(): string {
  const secret = process.env.UPLOAD_RELAY_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('UPLOAD_RELAY_SECRET не задан в окружении — обязателен в проде');
  }
  return 'dev-local-only-secret';
}

export const UPLOAD_RELAY_SECRET = resolveUploadRelaySecret();
