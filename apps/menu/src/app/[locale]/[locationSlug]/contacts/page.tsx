import { getClient } from '@barviha/db';
import { setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { CoffeeLuxContacts } from '@/components/coffee/CoffeeLuxContacts';
import { isCoffeeDesign, coffeeHomeVariant } from '@/lib/coffee-design';

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

  // Плейсхолдеры, пока в бэк-офисе не заполнены реальные данные локации.
  const phone = location.phone ?? '+7 (999) 796-91-11';
  const address = location.address ?? 'Москва, площадь Киевского Вокзала, 2';
  const hours = location.hours ?? 'Пн–Вс 12:00 – 01:00';

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
