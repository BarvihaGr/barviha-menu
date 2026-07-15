/**
 * Гейт доступа к бэк-офису — единый пароль на всю панель (без ролей, см.
 * договорённость: роли/уровни доступа — следующий этап). Паттерн 1:1 с
 * apps/menu/src/lib/arka-gate.ts — сессионная cookie (без maxAge), спрашивает
 * код заново при каждом новом визите/закрытии браузера.
 *
 * И TOKEN, и PASSWORD — из env (см. .env.production), НЕ хардкод. Раньше
 * оба были литералами прямо в коде публичного GitHub-репозитория:
 * TOKEN='ok-v1' — значит куки hub_gate=ok-v1 давала полный доступ без
 * пароля вообще, просто скопировав значение из исходников (обход гейта
 * подтверждён на проде). Дефолты ниже — только для локальной разработки.
 */
export const HUB_GATE_COOKIE = 'hub_gate';
export const HUB_GATE_TOKEN = process.env.HUB_GATE_TOKEN ?? 'dev-local-only-token';
export const HUB_GATE_PASSWORD = process.env.HUB_GATE_PASSWORD ?? 'admin1';
