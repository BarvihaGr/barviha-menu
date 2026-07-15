/**
 * Гейты (arka-gate, test-loc-gate) после верного кода делают жёсткий
 * редирект на `?next=...` из URL — этот параметр раньше шёл прямиком в
 * window.location.href без проверки. Ссылка вида
 * /ru/arka-gate?next=https://evil.example — валидный код доступа плюс
 * редирект на чужой домен сразу после его ввода (open redirect, классика
 * для фишинга). Разрешаем только относительные пути в пределах сайта:
 * должны начинаться с одного "/", но не с "//" (protocol-relative URL —
 * браузер трактует //evil.com как переход на другой хост).
 */
export function safeNextPath(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback;
  return raw;
}
