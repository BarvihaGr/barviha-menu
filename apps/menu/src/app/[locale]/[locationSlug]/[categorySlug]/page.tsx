import { getClient, usesArkaBarTemplate } from '@barviha/db';
import { setRequestLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import type { Locale } from '@/i18n/routing';
import { pickCategoryName } from '@/lib/i18n-helpers';
import { SectionTitle } from '@/components/SectionTitle';
import { CategoryItemsList } from '@/components/CategoryItemsList';
import { CoffeeMenuList } from '@/components/coffee/CoffeeMenuList';
import { CoffeeCategoryNav } from '@/components/coffee/CoffeeCategoryNav';
import { ArkaMenuSections } from '@/components/coffee/ArkaMenuSections';
import { loadArkaBarSections, loadArkaBarGroupPhotos } from '@/lib/arka-bar-loader';
import { isCoffeeDesign, coffeeAccentStyle } from '@/lib/coffee-design';

// Бар (шаблон «Арка») рендерится своей вёрсткой (секции + type1/type2
// карточки, см. ArkaMenuSections) вместо общего CoffeeMenuList — данные из
// content-store (packages/db/content/<slug>/bar.json), редактируются в
// бэк-офисе (apps/hub). Применяется к Арке и ко всем 25 рабочим клонам
// (см. usesArkaBarTemplate). Кухня/Кальяны идут обычным путём через
// db.getMenuItemsForLocation — content-store подключён внутри client.ts.
// У Киевской Бар — тоже content-store, но обычный CatalogItem (свой шаблон
// не задет), поэтому она идёт через CoffeeMenuList, как и остальные разделы.
const ARKA_TEST_CATEGORY = 'bar';

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
  const realm = (category.realm as 'bar' | 'kitchen' | 'hookah' | 'desserts') ?? 'kitchen';

  // Светлый дизайн Coffeemania — только для выбранных локаций.
  if (isCoffeeDesign(locationSlug)) {
    return (
      // Полноширинный светлый фон: выходим за пределы контейнера main на всю ширину вьюпорта.
      <div
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen -mt-2 min-h-screen bg-[var(--cm-bg)] text-[var(--cm-text)]"
        style={coffeeAccentStyle(locationSlug)}
      >
        <div className="mx-auto w-full max-w-[1200px] px-4 pb-32 sm:px-6 lg:pt-10">
          <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-8">
            <CoffeeCategoryNav
              categories={categories}
              currentSlug={category.slug}
              locationSlug={locationSlug}
              locale={locale as Locale}
            />
            {usesArkaBarTemplate(locationSlug) && category.slug === ARKA_TEST_CATEGORY ? (
              <ArkaMenuSections
                sections={loadArkaBarSections(locationSlug)}
                groupPhotos={loadArkaBarGroupPhotos(locationSlug)}
                locationSlug={locationSlug}
                locale={locale as Locale}
              />
            ) : (
              <div className="min-w-0">
                <CoffeeMenuList
                  items={items}
                  locationSlug={locationSlug}
                  categorySlug={category.slug}
                  realm={realm}
                />
              </div>
            )}
          </div>
        </div>
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
