import { setRequestLocale } from 'next-intl/server';
import { getClient } from '@barviha/db';
import { notFound } from 'next/navigation';
import { CartView } from './CartView';
import { CoffeeCart } from '@/components/coffee/CoffeeCart';
import { isCoffeeDesign } from '@/lib/coffee-design';
import { toResolvedArkaBarItems } from '@/lib/arka-menu-data';

// Тестовые позиции нового бара «Арки» не заведены в @barviha/db (см. чат) —
// подмешиваем их в список корзины только для Арки, чтобы корзина их не
// удаляла как «несуществующие» (см. CoffeeCart — там сверка по allItems).
const ARKA_TEST_SLUG = 'arka';

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
  const dbItems = await db.getMenuItemsForLocation(location.id);
  const items = locationSlug === ARKA_TEST_SLUG ? [...dbItems, ...toResolvedArkaBarItems()] : dbItems;

  if (isCoffeeDesign(locationSlug)) {
    return <CoffeeCart allItems={items} locationSlug={locationSlug} />;
  }

  return <CartView allItems={items} locationSlug={locationSlug} />;
}
