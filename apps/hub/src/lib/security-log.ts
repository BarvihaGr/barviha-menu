/**
 * Структурированный лог security-событий (security-audit, этап 6) — раньше
 * неудачные логины, 401/403/429 не оставляли вообще никакого следа (только
 * молчаливый ответ клиенту), из логов было невозможно понять, что кто-то
 * перебирает пароль или долбит API. Пишем в stdout/stderr одной JSON-строкой
 * на событие — pm2 уже собирает их в /root/.pm2/logs/barviha-hub-*.log без
 * доп. инфраструктуры (Sentry/ELK и т.п. — избыточно для масштаба проекта).
 */
export function securityLog(event: string, details: Record<string, unknown>): void {
  console.warn(JSON.stringify({ level: 'security', event, at: new Date().toISOString(), ...details }));
}
