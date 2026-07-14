import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import sharp from 'sharp';
import { menuPublicDir } from '@barviha/db';

// Телефонные фото с камеры легко весят 5-10+ МБ — без сжатия это грузит и
// список позиций в бэк-офисе (десятки таких превью на странице), и живое
// меню (сервер каждый раз пережимает оригинал на лету). Ужимаем один раз
// при загрузке: до 1600px по длинной стороне, webp — этого достаточно для
// карточек меню и экономит на порядок места и трафика.
const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 82;

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
  const filename = `${slugify(idHint)}-${Date.now()}.webp`;
  const dir = join(menuPublicDir(), 'menu-admin', slugify(slug), slugify(realm));
  mkdirSync(dir, { recursive: true });
  const srcBuf = Buffer.from(await file.arrayBuffer());
  const outBuf = await sharp(srcBuf)
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
  writeFileSync(join(dir, filename), outBuf);

  const publicPath = `/menu-admin/${slugify(slug)}/${slugify(realm)}/${filename}`;
  return NextResponse.json({ ok: true, path: publicPath });
}
