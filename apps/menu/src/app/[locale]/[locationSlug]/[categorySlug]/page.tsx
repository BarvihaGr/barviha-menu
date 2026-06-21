import { getClient } from '@barviha/db';
import { setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import type { Locale } from '@/i18n/routing';
import { pickCategoryName } from '@/lib/i18n-helpers';
import { SectionTitle } from '@/components/SectionTitle';
import { CategoryItemsList } from '@/components/CategoryItemsList';
import { CoffeeMenuList } from '@/components/coffee/CoffeeMenuList';
import { CoffeeCategoryNav } from '@/components/coffee/CoffeeCategoryNav';

/** Локации с новым (Coffeemania-style) дизайном меню. */
const COFFEE_DESIGN_SLUGS = new Set(['baumanskaia']);

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

  const [allItems, categories] = await Promise.all([
    db.getMenuItemsForLocation(location.id),
    db.getCategoriesForLocation(location.id),
  ]);
  const items = allItems.filter((i) => i.category_id === category.id);
  const realm = (category.realm as 'bar' | 'kitchen' | 'hookah') ?? 'kitchen';

  // Новый дизайн (Coffeemania-style) — только для выбранных локаций.
  if (COFFEE_DESIGN_SLUGS.has(locationSlug)) {
    return (
      <div className="flex flex-col">
        <CoffeeCategoryNav
          categories={categories}
          currentSlug={category.slug}
          locationSlug={locationSlug}
          locale={locale as Locale}
        />
        <h1 className="mb-5 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[0.01em] text-cream sm:text-3xl">
          {pickCategoryName(category, locale as Locale)}
        </h1>
        <CoffeeMenuList
          items={items}
          locationSlug={locationSlug}
          categorySlug={category.slug}
          realm={realm}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle>{pickCategoryName(category, locale as Locale)}</SectionTitle>
      <CategoryItemsList
        items={items}
        locationSlug={locationSlug}
        categorySlug={category.slug}
        realm={realm}
      />
    </div>
  );
}
