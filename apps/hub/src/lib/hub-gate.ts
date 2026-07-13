/**
 * Гейт доступа к бэк-офису — единый пароль на всю панель (без ролей, см.
 * договорённость: роли/уровни доступа — следующий этап). Паттерн 1:1 с
 * apps/menu/src/lib/arka-gate.ts — сессионная cookie (без maxAge), спрашивает
 * код заново при каждом новом визите/закрытии браузера.
 */
export const HUB_GATE_COOKIE = 'hub_gate';
export const HUB_GATE_TOKEN = 'ok-v1';
export const HUB_GATE_PASSWORD = 'admin1';
