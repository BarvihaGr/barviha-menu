import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateLocationSettings } from '@barviha/db';
import type { LocationSettings } from '@barviha/db';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const patch = (await request.json().catch(() => null)) as Partial<LocationSettings> | null;
  if (!patch) return NextResponse.json({ ok: false, error: 'bad body' }, { status: 400 });
  updateLocationSettings(slug, patch);
  return NextResponse.json({ ok: true });
}
