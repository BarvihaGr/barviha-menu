/**
 * Общий гейт для 25 «рабочих» локаций-клонов (см. @barviha/db WORKING_SLUGS) —
 * тот же паттерн, что и arka-gate.ts, но своя cookie/токен, потому что это
 * отдельная группа локаций («Тест лок» в бэк-офисе — Арка и Киевская — сюда
 * не входят: Арка со своим гейтом, Киевская вообще без гейта). Сессионная
 * cookie (без maxAge/expires).
 *
 * TOKEN/PASSWORD — из env, не хардкод (см. комментарий в arka-gate.ts —
 * тот же класс уязвимости: литерал в публичном репо = обход пароля).
 */
export const TEST_LOC_GATE_COOKIE = 'test_loc_gate';
export const TEST_LOC_GATE_TOKEN = process.env.TEST_LOC_GATE_TOKEN ?? 'dev-local-only-token';
// 6 цифр — под стать реальному прод-паролю (см. .env.production.local),
// UI (test-loc-gate/page.tsx CODE_LENGTH) рассчитан на 6 знаков.
export const TEST_LOC_GATE_PASSWORD = process.env.TEST_LOC_GATE_PASSWORD ?? '000000';
