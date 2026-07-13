import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { addCatalogItem } from '@barviha/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; realm: string }> },
) {
  const { slug, realm } = await params;
  if (realm !== 'kitchen' && realm !== 'hookah' && realm !== 'bar') {
    return NextResponse.json({ ok: false, error: 'bad realm' }, { status: 400 });
  }
  const body = (await request.json().catch(() => null)) as
    | {
        name?: string;
        sub?: string;
        price?: number;
        weight?: number | null;
        description?: string | null;
        composition?: string | null;
      }
    | null;
  if (!body || !body.name?.trim() || !body.sub?.trim()) {
    return NextResponse.json({ ok: false, error: 'bad body' }, { status: 400 });
  }
  const item = addCatalogItem(slug, realm, {
    name: body.name.trim(),
    sub: body.sub.trim(),
    price: Number(body.price) || 0,
    weight: body.weight ?? null,
    description: body.description ?? null,
    composition: body.composition ?? null,
  });
  return NextResponse.json({ ok: true, item });
}
