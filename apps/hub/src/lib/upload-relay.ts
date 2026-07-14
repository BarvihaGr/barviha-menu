/**
 * Общий секрет с apps/menu/src/lib/upload-relay.ts (см. там подробности) —
 * не общий импорт (разные приложения), а одинаковое имя env-переменной и
 * дефолт для локальной разработки. В проде UPLOAD_RELAY_SECRET должен быть
 * задан одинаково у ОБОИХ сервисов (hub и menu), иначе загрузка фото 401-ит.
 */
export const UPLOAD_RELAY_SECRET = process.env.UPLOAD_RELAY_SECRET ?? 'dev-local-only-secret';
