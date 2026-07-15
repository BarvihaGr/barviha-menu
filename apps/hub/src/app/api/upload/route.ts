import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import sharp from 'sharp';
import { MENU_ORIGIN } from '@/lib/menu-origin';
import { UPLOAD_RELAY_SECRET } from '@/lib/upload-relay';
import { invalidSlugResponse } from '@/lib/valid-slug';

// Телефонные фото с камеры легко весят 5-10+ МБ — без сжатия это грузит и
// список позиций в бэк-офисе (десятки таких превью на странице), и живое
// меню (сервер каждый раз пережимает оригинал на лету). Ужимаем один раз
// при загрузке: до 1600px по длинной стороне, webp — этого достаточно для
// карточек меню и экономит на порядок места и трафика.
const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 82;
// Прод крутится на скромной VDS (2 vCPU, ~4ГБ, уже частично в свопе) —
// декодирование огромного фото (30+ МБ raw с телефона) резко раздувает
// память и грузит оба ядра, из-за чего на несколько секунд подвисает вообще
// весь сайт (соседние Node-процессы и nginx на той же машине). Жёсткий кап
// по входному размеру + урезанный concurrency у sharp — чтобы одна загрузка
// фото не укладывала прод.
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
sharp.cache(false);
sharp.concurrency(1);

// Только латиница/цифры — apps/menu/api/upload-asset проверяет имя файла по
// /^[a-z0-9-]+\.webp$/ (см. там), кириллица там не проходит. idHint для
// обычных позиций и так латинский (id вида "kitchen-salads-..."), но для
// категорий (GroupPhotoUploader шлёт название категории как есть, кириллицей)
// без этой чистки загрузка тихо 502-ила на relay-шаге — фото просто не
// менялось, без видимой причины.
function slugify(s: string): string {
  const cleaned = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return cleaned || 'photo';
}

/**
 * Сжимает загруженное фото и отправляет его на сервер apps/menu (см.
 * api/upload-asset там) — сам hub файл больше НЕ пишет на диск. hub и menu —
 * два отдельных задеплоенных сервиса с разными файловыми системами (на
 * Railway), локальная запись работала только в дев-режиме на одной машине,
 * а на проде фото до живого сайта не доезжало (404 при валидном пути в
 * данных). См. project memory про этот баг.
 */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get('file');
  const slug = String(form.get('slug') ?? 'arka');
  const realm = String(form.get('realm') ?? 'misc');
  const idHint = String(form.get('id') ?? 'photo');

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'no file' }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ ok: false, error: 'file too large (max 20MB)' }, { status: 413 });
  }
  const slugErr = invalidSlugResponse(slug);
  if (slugErr) return slugErr;

  const filename = `${slugify(idHint)}-${Date.now()}.webp`;
  const srcBuf = Buffer.from(await file.arrayBuffer());
  let outBuf: Buffer;
  try {
    outBuf = await sharp(srcBuf)
      .rotate()
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch {
    // Не валидное изображение (битый файл, чужой формат, мусор под видом
    // фото) — до этой правки sharp кидал необработанное исключение прямо в
    // рантайм Next (500 без внятной причины для пользователя бэк-офиса).
    return NextResponse.json({ ok: false, error: 'invalid image file' }, { status: 400 });
  }

  const relayForm = new FormData();
  relayForm.append('file', new Blob([new Uint8Array(outBuf)], { type: 'image/webp' }), filename);
  relayForm.append('slug', slug);
  relayForm.append('realm', realm);
  relayForm.append('filename', filename);

  let relayRes: Response;
  try {
    relayRes = await fetch(`${MENU_ORIGIN}/api/upload-asset`, {
      method: 'POST',
      headers: { 'x-upload-secret': UPLOAD_RELAY_SECRET },
      body: relayForm,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'menu server unreachable' }, { status: 502 });
  }
  if (!relayRes.ok) {
    const body = await relayRes.text().catch(() => '');
    return NextResponse.json({ ok: false, error: `menu upload failed: ${relayRes.status} ${body}`.trim() }, { status: 502 });
  }
  const relayData = (await relayRes.json()) as { ok: boolean; path?: string };
  if (!relayData.ok || !relayData.path) {
    return NextResponse.json({ ok: false, error: 'menu upload rejected' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, path: relayData.path });
}
