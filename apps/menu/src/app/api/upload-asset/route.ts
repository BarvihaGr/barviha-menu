import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UPLOAD_RELAY_SECRET } from '@/lib/upload-relay';

/**
 * Принимает уже обработанное фото (сжатое, webp) от apps/hub и пишет его в
 * свой public/menu-admin/**. Нужен, потому что hub и menu — два отдельных
 * задеплоенных сервиса с разными файловыми системами (см. apps/hub
 * api/upload/route.ts): раньше hub писал файл «локально», рассчитывая на
 * общий диск с menu, который есть только при локальной разработке — на
 * Railway фото до живого сайта физически не доезжало (404), хотя путь в
 * данные позиции сохранялся. Санитизация slug/realm/filename — по той же
 * логике slugify(), что и на стороне hub, но не доверяем ей вслепую здесь:
 * это публичный write-эндпоинт, повторяем проверки сами.
 */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-upload-secret');
  if (secret !== UPLOAD_RELAY_SECRET) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get('file');
  const slug = slugify(String(form.get('slug') ?? ''));
  const realm = slugify(String(form.get('realm') ?? ''));
  const rawFilename = String(form.get('filename') ?? '');
  // Имя файла hub уже собрал безопасным (slugify + timestamp + .webp) —
  // здесь не пересобираем (slugify() обрезает по 60 симв. и сломал бы имя
  // с таймстампом), а строго валидируем по белому списку символов.
  const filenameOk = /^[a-z0-9-]{1,120}\.webp$/.test(rawFilename);

  if (!(file instanceof File) || !slug || !realm || !filenameOk) {
    return NextResponse.json({ ok: false, error: 'bad request' }, { status: 400 });
  }
  const filename = rawFilename;

  const dir = join(process.cwd(), 'public', 'menu-admin', slug, realm);
  mkdirSync(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  writeFileSync(join(dir, filename), buf);

  const publicPath = `/menu-admin/${slug}/${realm}/${filename}`;
  return NextResponse.json({ ok: true, path: publicPath });
}
