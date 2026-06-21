import { setRequestLocale } from 'next-intl/server';
import { getClient } from '@barviha/db';
import { notFound } from 'next/navigation';
import { CartView } from './CartView';
import { CoffeeCart } from '@/components/coffee/CoffeeCart';
import { isCoffeeDesign } from '@/lib/coffee-design';

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string; locationSlug: string }>;
}) {
  const { locale, locationSlug } = await params;
  setRequestLocale(locale);

  const db = getClient();
  const location = await db.getLocationBySlug(locationSlug);
  if (!location) notFound();
  const items = await db.getMenuItemsForLocation(location.id);

  if (isCoffeeDesign(locationSlug)) {
    return <CoffeeCart allItems={items} locationSlug={locationSlug} />;
  }

  return <CartView allItems={items} locationSlug={locationSlug} />;
}
