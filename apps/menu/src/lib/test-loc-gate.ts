/**
 * Общий гейт для 25 «рабочих» локаций-клонов (см. @barviha/db WORKING_SLUGS) —
 * тот же паттерн и тот же пароль (0000), что и arka-gate.ts, но своя
 * cookie/токен, потому что это отдельная группа локаций («Тест лок» в
 * бэк-офисе — Арка и Киевская — сюда не входят: Арка со своим гейтом,
 * Киевская вообще без гейта). Сессионная cookie (без maxAge/expires).
 */
export const TEST_LOC_GATE_COOKIE = 'test_loc_gate';
export const TEST_LOC_GATE_TOKEN = 'ok-v1';
export const TEST_LOC_GATE_PASSWORD = '0000';
