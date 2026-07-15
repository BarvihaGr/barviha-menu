import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { addBarItem } from '@barviha/db';
import { invalidSlugResponse } from '@/lib/valid-slug';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const slugErr = invalidSlugResponse(slug);
  if (slugErr) return slugErr;
  const body = (await request.json().catch(() => null)) as
    | {
        categoryIndex?: number;
        name?: string;
        price?: string;
        volume?: string | null;
        description?: string | null;
        type?: 1 | 2;
      }
    | null;
  if (!body || body.categoryIndex == null || !body.name?.trim() || !body.price?.trim()) {
    return NextResponse.json({ ok: false, error: 'bad body' }, { status: 400 });
  }
  try {
    const item = addBarItem(slug, body.categoryIndex, {
      name: body.name.trim(),
      price: body.price.trim(),
      volume: body.volume?.trim() || null,
      description: body.description?.trim() || null,
      type: body.type ?? 1,
    });
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 404 });
  }
}
