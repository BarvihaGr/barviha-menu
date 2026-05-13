import { getClient } from '@barviha/db';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Locale } from '@/i18n/routing';
import { pickCategoryName, pickItemDescription, pickItemName } from '@/lib/i18n-helpers';
import { CategoryCard } from '@/components/CategoryCard';
import { SectionTitle } from '@/components/SectionTitle';
import { SearchBar } from '@/components/SearchBar';
import { ItemCard } from '@/components/ItemCard';

const CATEGORY_ICONS: Record<string, string> = {
  hookah: '◈',
  bar: '◉',
  kitchen: '◆',
  desserts: '✦',
};

export default async function LocationHome({
  params,
}: {
  params: Promise<{ locale: string; locationSlug: string }>;
}) {
  const { locale, locationSlug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('hookah');
  const tNav = await getTranslations('nav');

  const db = getClient();
  const location = await db.getLocationBySlug(locationSlug);
  if (!location) notFound();
  const [categories, items] = await Promise.all([
    db.getCategoriesForLocation(location.id),
    db.getMenuItemsForLocation(location.id),
  ]);

  const featured = items.filter((i) => i.labels.includes('hit') || i.labels.includes('chef_pick'));

  return (
    <div className="flex flex-col gap-8">
      <SearchBar items={items} locationSlug={location.slug} />

      <section>
        <SectionTitle>{tNav('menu')}</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {categories.map((c, idx) => {
            const count = items.filter((i) => i.category_id === c.id).length;
            const href = c.slug === 'hookah' ? `/${location.slug}/hookah` : `/${location.slug}/${c.slug}`;
            return (
              <CategoryCard
                key={c.id}
                href={href}
                title={pickCategoryName(c, locale as Locale)}
                icon={CATEGORY_ICONS[c.slug] ?? '◇'}
                count={count}
                index={idx}
              />
            );
          })}
        </div>
      </section>

      {featured.length > 0 && (
        <section>
          <SectionTitle>{t('hitsTitle')}</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {featured.slice(0, 8).map((item, i) => (
              <ItemCard
                key={item.id}
                item={item}
                name={pickItemName(item, locale as Locale)}
                description={pickItemDescription(item, locale as Locale)}
                locationSlug={location.slug}
                index={i}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
