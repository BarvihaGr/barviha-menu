import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { addBarCategory, renameBarCategory } from '@barviha/db';
import { invalidSlugResponse } from '@/lib/valid-slug';
import { NewBarCategorySchema, RenameBarCategorySchema } from '@/lib/catalog-schemas';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const slugErr = invalidSlugResponse(slug);
  if (slugErr) return slugErr;
  const parsed = NewBarCategorySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'bad body' }, { status: 400 });
  try {
    const index = addBarCategory(slug, parsed.data.category);
    return NextResponse.json({ ok: true, index });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 409 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const slugErr = invalidSlugResponse(slug);
  if (slugErr) return slugErr;
  const parsed = RenameBarCategorySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'bad body' }, { status: 400 });
  try {
    renameBarCategory(slug, parsed.data.from, parsed.data.to);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 404 });
  }
}
