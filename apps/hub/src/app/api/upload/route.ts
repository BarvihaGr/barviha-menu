import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { menuPublicDir } from '@barviha/db';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Сохраняет загруженное фото в apps/menu/public/menu-admin/<slug>/<realm>/
 * и возвращает веб-путь, который сразу пишется в поле photo позиции. */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get('file');
  const slug = String(form.get('slug') ?? 'arka');
  const realm = String(form.get('realm') ?? 'misc');
  const idHint = String(form.get('id') ?? 'photo');

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'no file' }, { status: 400 });
  }
  const ext = EXT_BY_MIME[file.type] ?? 'jpg';
  const filename = `${slugify(idHint)}-${Date.now()}.${ext}`;
  const dir = join(menuPublicDir(), 'menu-admin', slugify(slug), slugify(realm));
  mkdirSync(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  writeFileSync(join(dir, filename), buf);

  const publicPath = `/menu-admin/${slugify(slug)}/${slugify(realm)}/${filename}`;
  return NextResponse.json({ ok: true, path: publicPath });
}
