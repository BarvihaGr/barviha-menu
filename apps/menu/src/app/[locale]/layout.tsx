import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata, Viewport } from 'next';
import { routing } from '@/i18n/routing';
import { SplashScreen } from '@/components/SplashScreen';
import { ImageProtection } from '@/components/ImageProtection';
import { AgeGate } from '@/components/AgeGate';
import { SITE_URL } from '@/lib/seo';
// Шрифты со своего домена (см. комментарий в globals.css). Файлы woff2 Next
// кладёт в /_next/static/media; браузер качает только нужные подмножества
// (латиница/кириллица/армянский) по unicode-range.
import '@fontsource-variable/inter';
import '@fontsource-variable/manrope';
import '@fontsource-variable/raleway';
import '@fontsource-variable/noto-sans-armenian';
import '@fontsource/cormorant-sc/400.css';
import '@fontsource/cormorant-sc/500.css';
import '@fontsource/cormorant-sc/600.css';
import '@fontsource/cormorant-sc/700.css';
import '@fontsource/cormorant-garamond/300.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/700.css';
import '../globals.css';

export const metadata: Metadata = {
  // База для canonical/hreflang/OG — все они заданы относительными путями.
  metadataBase: new URL(SITE_URL),
  // Бренд-вордмарк — всегда латиницей на любом языке (см. not-found.tsx,
  // error.tsx — то же соглашение). Локализованный per-локация заголовок
  // задаёт [locationSlug]/layout.tsx generateMetadata; этот — фолбэк для
  // маршрутов без своих metadata (i18n-audit: раньше был жёстко на русском).
  title: 'Barvikha Lounge — Menu',
  description: 'Premium digital menu — Barvikha Lounge',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  // «Добавить на экран Домой» на iPhone — без этого блока Safari открывает
  // PWA в мини-браузере со своей шапкой вместо полноэкранного standalone-режима.
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Barvikha',
  },
};

// viewport-fit=cover — без него env(safe-area-inset-*) на iPhone равны 0,
// и плавающая плашка-корзина не учитывает «домашний индикатор».
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0C0A08',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col text-foreground">
        <NextIntlClientProvider>
          <ImageProtection />
          <AgeGate />
          <SplashScreen>{children}</SplashScreen>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
