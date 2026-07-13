import { setRequestLocale } from 'next-intl/server';
import { getClient, usesArkaBarTemplate } from '@barviha/db';
import { notFound } from 'next/navigation';
import { CartView } from './CartView';
import { CoffeeCart } from '@/components/coffee/CoffeeCart';
import { isCoffeeDesign } from '@/lib/coffee-design';
import { toResolvedArkaBarItems } from '@/lib/arka-bar-loader';

// Позиции Бара (шаблон «Арка») не заведены как обычные ResolvedMenuItem в
// content-store — подмешиваем их в список корзины, чтобы корзина их не
// удаляла как «несуществующие» (см. CoffeeCart — там сверка по allItems).
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
  const items = usesArkaBarTemplate(locationSlug) ? [...dbItems, ...toResolvedArkaBarItems(locationSlug)] : dbItems;

  if (isCoffeeDesign(locationSlug)) {
    return <CoffeeCart allItems={items} locationSlug={locationSlug} />;
  }

  return <CartView allItems={items} locationSlug={locationSlug} />;
}
