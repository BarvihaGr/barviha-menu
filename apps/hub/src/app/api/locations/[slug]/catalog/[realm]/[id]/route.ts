import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateCatalogItem } from '@barviha/db';
import type { CatalogItem } from '@barviha/db';
import { invalidSlugResponse } from '@/lib/valid-slug';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; realm: string; id: string }> },
) {
  const { slug, realm, id } = await params;
  const slugErr = invalidSlugResponse(slug);
  if (slugErr) return slugErr;
  if (realm !== 'kitchen' && realm !== 'hookah' && realm !== 'bar') {
    return NextResponse.json({ ok: false, error: 'bad realm' }, { status: 400 });
  }
  const patch = (await request.json().catch(() => null)) as Partial<CatalogItem> | null;
  if (!patch) return NextResponse.json({ ok: false, error: 'bad body' }, { status: 400 });
  try {
    updateCatalogItem(slug, realm, id, patch);
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
