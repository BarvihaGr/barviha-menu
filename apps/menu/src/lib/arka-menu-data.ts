// Типы Бара «Арки» + чистая логика вариаций объём/цена — client-safe
// (без fs). Импортируется и серверными, и клиентскими компонентами
// (ArkaCardTypes.tsx — 'use client'). Загрузка контента из content-store
// (fs, server-only) — отдельно, см. @/lib/arka-bar-loader.
export type { ArkaMenuEntry, ArkaMenuItem, ArkaMenuVariant } from '@barviha/db/arka-shared';
export { getItemVariants } from '@barviha/db/arka-shared';
