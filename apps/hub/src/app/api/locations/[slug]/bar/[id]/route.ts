import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateBarItem } from '@barviha/db';
import type { ArkaMenuItem } from '@barviha/db';
import { invalidSlugResponse } from '@/lib/valid-slug';
import { decodeRouteParam } from '@/lib/decode-param';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const { slug, id: rawId } = await params;
  const id = decodeRouteParam(rawId);
  const slugErr = invalidSlugResponse(slug);
  if (slugErr) return slugErr;
  const patch = (await request.json().catch(() => null)) as Partial<ArkaMenuItem> | null;
  if (!patch) return NextResponse.json({ ok: false, error: 'bad body' }, { status: 400 });
  try {
    updateBarItem(slug, id, patch);
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
