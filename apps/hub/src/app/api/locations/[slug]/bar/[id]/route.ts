import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateBarItem } from '@barviha/db';
import { invalidSlugResponse } from '@/lib/valid-slug';
import { decodeRouteParam } from '@/lib/decode-param';
import { BarItemPatchSchema } from '@/lib/catalog-schemas';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id: rawId } = await params;
  const id = decodeRouteParam(rawId);
  const slugErr = invalidSlugResponse(slug);
  if (slugErr) return slugErr;
  const parsed = BarItemPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'некорректные данные' }, { status: 400 });
  }
  try {
    updateBarItem(slug, id, parsed.data);
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
