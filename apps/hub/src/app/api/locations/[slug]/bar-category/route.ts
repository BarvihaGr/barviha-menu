import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { addBarCategory } from '@barviha/db';
import { invalidSlugResponse } from '@/lib/valid-slug';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const slugErr = invalidSlugResponse(slug);
  if (slugErr) return slugErr;
  const body = (await request.json().catch(() => null)) as { category?: string } | null;
  if (!body || !body.category?.trim()) {
    return NextResponse.json({ ok: false, error: 'bad body' }, { status: 400 });
  }
  try {
    const index = addBarCategory(slug, body.category.trim());
    return NextResponse.json({ ok: true, index });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 409 });
  }
}
