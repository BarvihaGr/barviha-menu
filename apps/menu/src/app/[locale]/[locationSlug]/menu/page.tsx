import { getClient } from '@barviha/db';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import type { Locale } from '@/i18n/routing';
import { CoffeeLuxMenu } from '@/components/coffee/CoffeeLuxMenu';
import { isCoffeeDesign, coffeeHomeVariant } from '@/lib/coffee-design';
import { locationPageMetadata } from '@/lib/seo';

/** Порядок разделов в хабе «Меню»: Кухня → Бар → Кальянная карта. */
const MENU_ORDER = ['kitchen', 'bar', 'hookah'] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; locationSlug: string }>;
}) {
  const { locale, locationSlug } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  return locationPageMetadata({ locale, locationSlug, subPath: '/menu', section: t('menu') });
}

export default async function MenuHubPage({
  params,
}: {
  params: Promise<{ locale: string; locationSlug: string }>;
}) {
  const { locale, locationSlug } = await params;
  setRequestLocale(locale);

  // Хаб «Меню» — только для lux-локаций. Остальные → на главную локации.
  if (!(isCoffeeDesign(locationSlug) && coffeeHomeVariant(locationSlug) === 'lux')) {
    redirect(`/${locale}/${locationSlug}`);
  }

  const db = getClient();
  const location = await db.getLocationBySlug(locationSlug);
  if (!location) notFound();
  // Локация выключена в бэк-офисе — заглушку рисует layout, а страница не
  // должна отдавать каталог в RSC-ответе.
  if (location.is_active === false) return null;

  const categories = await db.getCategoriesForLocation(location.id);
  const ordered = MENU_ORDER.map((slug) => categories.find((c) => c.slug === slug)).filter(
    (c): c is NonNullable<typeof c> => Boolean(c),
  );

  return (
    <CoffeeLuxMenu locationSlug={location.slug} categories={ordered} locale={locale as Locale} />
  );
}
