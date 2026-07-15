import { NextResponse } from 'next/server';
import { isContentStoreSlug } from '@barviha/db';

/**
 * Slug локации приходит из URL-сегмента и течёт напрямую в путь до файла на
 * диске (content-store: packages/db/content/<slug>/*.json) без какой-либо
 * санитизации по пути — path.join() не режет ".." сегменты. Раньше ни один
 * из /api/locations/[slug]/** роутов не проверял slug против реального
 * списка локаций, так что фактическая защита от обхода пути держалась
 * только на hub-gate cookie. Whitelist здесь — defense in depth, а не смена
 * поведения для легитимных запросов (список локаций и так статичный).
 */
export function invalidSlugResponse(slug: string): NextResponse | null {
  if (isContentStoreSlug(slug)) return null;
  return NextResponse.json({ ok: false, error: 'unknown location' }, { status: 404 });
}
