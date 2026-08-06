import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isContentStoreSlug, recordAdd } from '@barviha/db';
import { STATS_ENABLED } from '@/lib/stats';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!STATS_ENABLED) return NextResponse.json({ ok: false, error: 'stats disabled' }, { status: 404 });
  const { slug } = await params;
  // slug приходит из URL без аутентификации (публичный эндпоинт) — без
  // проверки по allowlist это был бы path traversal в writeContentJson
  // (security-audit, см. также resolveContentPath в content-store.ts).
  if (!isContentStoreSlug(slug)) return NextResponse.json({ ok: false, error: 'bad slug' }, { status: 400 });
  const body = await request.json().catch(() => null);
  const itemId = typeof body?.itemId === 'string' ? body.itemId : '';
  if (!itemId) return NextResponse.json({ ok: false, error: 'bad body' }, { status: 400 });
  recordAdd(slug, itemId);
  return NextResponse.json({ ok: true });
}
