import { NextResponse } from 'next/server';
import { getClient } from '@barviha/db';

/**
 * Манифест per-локация — раньше был один статический /manifest.json на
 * весь сайт с start_url:"/", из-за чего «Добавить на экран Домой» в
 * Safari на iPhone 16.4+ всегда открывало ту локацию, на которую
 * редиректит корень (/ → /ru → /ru/kievskaia), а не ту страницу, с
 * которой реально сохраняли (см. жалобу — сохранили Павелецкую, а
 * иконка открывала Киевскую). iOS 16.4+ распознаёт валидный manifest и
 * использует его start_url вместо фактического URL страницы.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; locationSlug: string }> },
) {
  const { locale, locationSlug } = await params;
  const db = getClient();
  const location = await db.getLocationBySlug(locationSlug);

  const name =
    location && locale === 'en' && location.name_en
      ? location.name_en
      : location && locale === 'zh' && location.name_zh
        ? location.name_zh
        : (location?.name ?? 'Барвиха');

  const scope = `/${locale}/${locationSlug}`;

  return NextResponse.json(
    {
      name: `Барвиха Лаунж — ${name}`,
      short_name: `Меню ${name}`,
      description: `Меню — Barvikha Lounge ${name}`,
      start_url: scope,
      scope,
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#0C0A08',
      theme_color: '#0C0A08',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
}
