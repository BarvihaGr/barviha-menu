import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateBarGroupPhoto } from '@barviha/db';
import { invalidSlugResponse } from '@/lib/valid-slug';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const slugErr = invalidSlugResponse(slug);
  if (slugErr) return slugErr;
  const body = (await request.json().catch(() => null)) as { category?: string; src?: string } | null;
  if (!body?.category || !body.src) {
    return NextResponse.json({ ok: false, error: 'bad body' }, { status: 400 });
  }
  updateBarGroupPhoto(slug, body.category, body.src);
  return NextResponse.json({ ok: true });
}
