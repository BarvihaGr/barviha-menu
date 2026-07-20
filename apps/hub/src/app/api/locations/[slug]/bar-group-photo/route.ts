import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { removeBarGroupPhoto, updateBarGroupPhoto, updateBarGroupPhotoCrop } from '@barviha/db';
import type { PhotoEntry } from '@barviha/db';
import { invalidSlugResponse } from '@/lib/valid-slug';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const slugErr = invalidSlugResponse(slug);
  if (slugErr) return slugErr;
  const body = (await request.json().catch(() => null)) as
    | { category?: string; src?: string; position?: PhotoEntry['position']; transform?: PhotoEntry['transform'] }
    | null;
  if (!body?.category) {
    return NextResponse.json({ ok: false, error: 'bad body' }, { status: 400 });
  }
  if (body.src) {
    updateBarGroupPhoto(slug, body.category, body.src);
  } else if ('position' in body || 'transform' in body) {
    try {
      updateBarGroupPhotoCrop(slug, body.category, { position: body.position, transform: body.transform });
    } catch (e) {
      return NextResponse.json({ ok: false, error: String(e) }, { status: 404 });
    }
  } else {
    return NextResponse.json({ ok: false, error: 'bad body' }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const slugErr = invalidSlugResponse(slug);
  if (slugErr) return slugErr;
  const body = (await request.json().catch(() => null)) as { category?: string } | null;
  if (!body?.category) {
    return NextResponse.json({ ok: false, error: 'bad body' }, { status: 400 });
  }
  removeBarGroupPhoto(slug, body.category);
  return NextResponse.json({ ok: true });
}
