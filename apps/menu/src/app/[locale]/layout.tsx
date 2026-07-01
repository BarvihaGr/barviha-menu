import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata, Viewport } from 'next';
import { routing } from '@/i18n/routing';
import { SplashScreen } from '@/components/SplashScreen';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Барвиха Лаунж — Меню',
  description: 'Premium digital menu — Barvikha Lounge',
};

// viewport-fit=cover — без него env(safe-area-inset-*) на iPhone равны 0,
// и плавающая плашка-корзина не учитывает «домашний индикатор».
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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
          <SplashScreen>{children}</SplashScreen>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
