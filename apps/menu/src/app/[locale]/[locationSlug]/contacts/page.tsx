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

  // Плейсхолдеры для Киевской (реальные адрес/часы заменить в данных локации).
  const phone = location.phone ?? '+7 (999) 796-91-11';
  const address = location.address ?? 'Москва, площадь Киевского Вокзала, 2';

  return (
    <CoffeeLuxContacts
      locationSlug={location.slug}
      phone={phone}
      address={address}
      hours="Пн–Вс 12:00 – 01:00"
    />
  );
}
