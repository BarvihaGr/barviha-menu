import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isContentStoreSlug, recordAdd } from '@barviha/db';
import { STATS_ENABLED } from '@/lib/stats';

// itemId идёт напрямую в JSON-объект как ключ (stats[itemId] = ...,
// см. packages/db/src/stats.ts) — без ограничений на форму строки это
// пропускало "__proto__"/"constructor"/"prototype" (локальное prototype
// pollution через bracket-assignment на plain-объект) и произвольную длину/
// символы (security-audit, этап 3). Реальные id позиций меню — латиница/
// цифры/дефис (см. GEN_ITEMS), белый список под них с запасом.
const ITEM_ID_RE = /^[a-z0-9-]{1,120}$/;
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!STATS_ENABLED) return NextResponse.json({ ok: false, error: 'stats disabled' }, { status: 404 });
  const { slug } = await params;
  // slug приходит из URL без аутентификации (публичный эндпоинт) — без
  // проверки по allowlist это был бы path traversal в writeContentJson
  // (security-audit, см. также resolveContentPath в content-store.ts).
  if (!isContentStoreSlug(slug)) return NextResponse.json({ ok: false, error: 'bad slug' }, { status: 400 });
  const body = await request.json().catch(() => null);
  const itemId = typeof body?.itemId === 'string' ? body.itemId : '';
  if (!itemId || !ITEM_ID_RE.test(itemId) || FORBIDDEN_KEYS.has(itemId)) {
    return NextResponse.json({ ok: false, error: 'bad body' }, { status: 400 });
  }
  recordAdd(slug, itemId);
  return NextResponse.json({ ok: true });
}
