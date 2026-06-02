import { getClient } from '@barviha/db';
import { setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import type { Locale } from '@/i18n/routing';
import { pickCategoryName } from '@/lib/i18n-helpers';
import { SectionTitle } from '@/components/SectionTitle';
import { CategoryItemsList } from '@/components/CategoryItemsList';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; locationSlug: string; categorySlug: string }>;
}) {
  const { locale, locationSlug, categorySlug } = await params;
  setRequestLocale(locale);

  if (categorySlug === 'hookah') {
    redirect(`/${locale}/${locationSlug}/hookah`);
  }

  const db = getClient();
  const [location, category] = await Promise.all([
    db.getLocationBySlug(locationSlug),
    db.getCategoryBySlug(categorySlug),
  ]);
  if (!location) notFound();
  if (!category) notFound();

  const items = (await db.getMenuItemsForLocation(location.id)).filter(
    (i) => i.category_id === category.id,
  );

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle>{pickCategoryName(category, locale as Locale)}</SectionTitle>
      <CategoryItemsList
        items={items}
        locationSlug={locationSlug}
        categorySlug={category.slug}
        realm={(category.realm as 'bar' | 'kitchen' | 'hookah') ?? 'kitchen'}
      />
    </div>
  );
}
