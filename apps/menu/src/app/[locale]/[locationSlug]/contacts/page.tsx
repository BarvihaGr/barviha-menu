import { getClient } from '@barviha/db';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { CoffeeLuxContacts } from '@/components/coffee/CoffeeLuxContacts';
import { isCoffeeDesign, coffeeHomeVariant } from '@/lib/coffee-design';
import { pickLocationAddress, pickLocationHours } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/routing';
import { locationPageMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; locationSlug: string }>;
}) {
  const { locale, locationSlug } = await params;
  const t = await getTranslations({ locale, namespace: 'nav' });
  return locationPageMetadata({ locale, locationSlug, subPath: '/contacts', section: t('contacts') });
}

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: string; locationSlug: string }>;
}) {
  const { locale, locationSlug } = await params;
  setRequestLocale(locale);

  if (!(isCoffeeDesign(locationSlug) && coffeeHomeVariant(locationSlug) === 'lux')) {
    redirect(`/${locale}/${locationSlug}`);
  }

  const db = getClient();
  const location = await db.getLocationBySlug(locationSlug);
  if (!location) notFound();
  // Локация выключена в бэк-офисе — заглушку рисует layout, а страница не
  // должна отдавать каталог в RSC-ответе.
  if (location.is_active === false) return null;

  // Плейсхолдеры, пока в бэк-офисе не заполнены реальные данные локации.
  const phone = location.phone ?? '+7 (999) 796-91-11';
  // Плейсхолдер (локация без заполненного адреса) тоже прогоняем через
  // переводчик, иначе на en/zh/hy он оставался кириллицей.
  const address = pickLocationAddress(
    location.address ?? 'Москва, площадь Киевского Вокзала, 2',
    locale as Locale,
  )!;
  const hours = pickLocationHours(location.hours ?? 'Пн–Вс 12:00 – 01:00', locale as Locale)!;

  return (
    <CoffeeLuxContacts
      locationSlug={location.slug}
      phone={phone}
      address={address}
      latitude={location.latitude}
      longitude={location.longitude}
      hours={hours}
    />
  );
}
