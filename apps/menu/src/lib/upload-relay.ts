/**
 * Общий секрет между apps/hub и apps/menu для приёма загруженных фото (см.
 * api/upload-asset). Нужен, потому что это публично доступный write-эндпоинт
 * на боевом домене — без секрета кто угодно из интернета мог бы залить файлы
 * на сервер меню. Дефолт — только для локальной разработки (оба процесса на
 * одной машине). В проде раньше это был просто мягкий комментарий-напоминание
 * — если бы переменную забыли задать при новом деплое, эндпоинт молча
 * остался бы защищён общеизвестным дефолтным значением вместо явной ошибки
 * (security-audit, этап 4). Теперь в production при отсутствующей переменной
 * падаем сразу при старте процесса, а не тихо деградируем.
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
