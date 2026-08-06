import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { addBarItem } from '@barviha/db';
import { invalidSlugResponse } from '@/lib/valid-slug';
import { NewBarItemSchema } from '@/lib/catalog-schemas';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const slugErr = invalidSlugResponse(slug);
  if (slugErr) return slugErr;
  const parsed = NewBarItemSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'некорректные данные' }, { status: 400 });
  }
  const body = parsed.data;
  try {
    const item = addBarItem(slug, body.categoryIndex, {
      name: body.name,
      price: body.price,
      volume: body.volume || null,
      description: body.description || null,
      type: body.type ?? 1,
    });
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 404 });
  }
}
