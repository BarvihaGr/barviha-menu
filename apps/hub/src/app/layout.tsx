import type { Metadata, Viewport } from 'next';
import { BASE_PATH } from '@/lib/base-path';
import './globals.css';

export const metadata: Metadata = {
  title: 'Barviha Hub — бэк-офис меню',
  description: 'Внутренняя панель редактирования диджитал-меню Barviha.',
  robots: { index: false, follow: false },
  // Иконки/манифест — строки не проходят через роутинг Next (basePath
  // подставляется только в <Link>/useRouter), поэтому /back-off прописываем
  // руками, см. lib/base-path.ts.
  manifest: `${BASE_PATH}/manifest.json`,
  icons: {
    icon: [
      { url: `${BASE_PATH}/icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { url: `${BASE_PATH}/icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: `${BASE_PATH}/icons/apple-touch-icon.png`, sizes: '180x180', type: 'image/png' }],
  },
  // «Добавить на экран Домой» на iPhone — полноэкранный standalone-режим
  // вместо мини-браузера со своей шапкой (см. apps/menu — тот же приём).
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Бэк офис',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a13',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
