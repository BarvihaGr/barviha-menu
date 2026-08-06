import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateCatalogItem } from '@barviha/db';
import { invalidSlugResponse } from '@/lib/valid-slug';
import { decodeRouteParam } from '@/lib/decode-param';
import { CatalogItemPatchSchema } from '@/lib/catalog-schemas';

export async function PATCH(
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
  const parsed = CatalogItemPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'некорректные данные' }, { status: 400 });
  }
  try {
    updateCatalogItem(slug, realm, id, parsed.data);
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
