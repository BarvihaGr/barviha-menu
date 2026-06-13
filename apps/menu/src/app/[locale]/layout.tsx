import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { routing } from '@/i18n/routing';
import '../globals.css';

export const metadata: Metadata = {
  title: 'Барвиха Лаунж — Меню',
  description: 'Premium digital menu — Barvikha Lounge',
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
        {/* Фактура мазков кисти (статичный слой за контентом). */}
        <div className="brush-strokes" aria-hidden="true" />
        {/* Живой свет: боковые медно-бронзовые мазки медленно «дышат».
            Чистый CSS-слой за контентом (z-index:-1), анимация opacity/transform → GPU. */}
        <div className="ambient-light" aria-hidden="true" />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
