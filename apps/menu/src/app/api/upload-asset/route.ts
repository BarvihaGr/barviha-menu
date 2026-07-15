import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { timingSafeEqual } from 'node:crypto';
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

// Тот же кап, что у hub (см. api/upload/route.ts) — этот эндпоинт публично
// достижим напрямую (проверка только по секрету в заголовке, без сессии), и
// раньше размер тела вообще не проверялся: можно было залить файл любого
// размера и забить диск боевой VDS.
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

function secretMatches(provided: string | null): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(UPLOAD_RELAY_SECRET);
  // timingSafeEqual throws on length mismatch — сравниваем длину сначала,
  // это не даёт атакующему информации о самом секрете (только о его длине,
  // которая и так не тайна).
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Легковесная проверка "это правда webp", без тяжёлой зависимости (sharp
// есть только у hub, тащить его сюда ради валидации — лишний нативный
// пакет в публичном приложении). Формат RIFF: байты 0-3 "RIFF", 8-11 "WEBP".
// Не полноценная валидация кодека, но отсекает попытки залить произвольный
// бинарник под видом .webp через этот write-эндпоинт.
function looksLikeWebp(buf: Buffer): boolean {
  return (
    buf.length > 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  );
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-upload-secret');
  if (!secretMatches(secret)) {
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
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ ok: false, error: 'file too large (max 20MB)' }, { status: 413 });
  }
  const filename = rawFilename;

  const buf = Buffer.from(await file.arrayBuffer());
  if (!looksLikeWebp(buf)) {
    return NextResponse.json({ ok: false, error: 'not a webp file' }, { status: 400 });
  }

  const dir = join(process.cwd(), 'public', 'menu-admin', slug, realm);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, filename), buf);

  const publicPath = `/menu-admin/${slug}/${realm}/${filename}`;
  return NextResponse.json({ ok: true, path: publicPath });
}
