import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { moveCatalogItem } from '@barviha/db';
import { invalidSlugResponse } from '@/lib/valid-slug';
import { decodeRouteParam } from '@/lib/decode-param';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; realm: string; id: string }> },
) {
  const { slug, realm, id: rawId } = await params;
  const id = decodeRouteParam(rawId);
  const slugErr = invalidSlugResponse(slug);
  if (slugErr) return slugErr;
  if (realm !== 'kitchen' && realm !== 'hookah' && realm !== 'bar') {
    return NextResponse.json({ ok: false, error: 'bad realm' }, { status: 400 });
  }
  const body = (await request.json().catch(() => null)) as { direction?: 'up' | 'down' } | null;
  if (body?.direction !== 'up' && body?.direction !== 'down') {
    return NextResponse.json({ ok: false, error: 'bad direction' }, { status: 400 });
  }
  try {
    moveCatalogItem(slug, realm, id, body.direction);
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
