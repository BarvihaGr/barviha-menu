import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateLocationSettings } from '@barviha/db';
import { invalidSlugResponse } from '@/lib/valid-slug';
import { LocationSettingsPatchSchema } from '@/lib/catalog-schemas';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const slugErr = invalidSlugResponse(slug);
  if (slugErr) return slugErr;
  const parsed = LocationSettingsPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'некорректные данные' }, { status: 400 });
  }
  updateLocationSettings(slug, parsed.data);
  return NextResponse.json({ ok: true });
}
