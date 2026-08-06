import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { addCatalogItem } from '@barviha/db';
import { invalidSlugResponse } from '@/lib/valid-slug';
import { NewCatalogItemSchema } from '@/lib/catalog-schemas';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; realm: string }> },
) {
  const { slug, realm } = await params;
  const slugErr = invalidSlugResponse(slug);
  if (slugErr) return slugErr;
  if (realm !== 'kitchen' && realm !== 'hookah' && realm !== 'bar') {
    return NextResponse.json({ ok: false, error: 'bad realm' }, { status: 400 });
  }
  const parsed = NewCatalogItemSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'некорректные данные' }, { status: 400 });
  }
  const body = parsed.data;
  const item = addCatalogItem(slug, realm, {
    name: body.name,
    sub: body.sub,
    price: body.price ?? 0,
    weight: body.weight ?? null,
    description: body.description ?? null,
    composition: body.composition ?? null,
  });
  return NextResponse.json({ ok: true, item });
}
