import { getClient } from '@barviha/db';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Locale } from '@/i18n/routing';
import { pickCategoryName } from '@/lib/i18n-helpers';
import { CategoryCard } from '@/components/CategoryCard';
import { SectionTitle } from '@/components/SectionTitle';
import { SearchBar } from '@/components/SearchBar';
import { HeroSection } from '@/components/HeroSection';
import { PromoCarousel } from '@/components/PromoCarousel';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';

const CATEGORY_ICONS: Record<string, string> = {
  hookah: '◈',
  bar: '◉',
  kitchen: '◆',
  rolls: '❖',
  desserts: '✦',
};

const REALM_ORDER: Array<'kitchen' | 'bar' | 'hookah'> = ['kitchen', 'bar', 'hookah'];

export default async function LocationHome({
  params,
}: {
  params: Promise<{ locale: string; locationSlug: string }>;
}) {
  const { locale, locationSlug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('hookah');
  const tHome = await getTranslations('home');
  const tRealms = await getTranslations('realms');
  const tBrand = await getTranslations('brand');

  const db = getClient();
  const location = await db.getLocationBySlug(locationSlug);
  if (!location) notFound();
  const [categories, items, announcements] = await Promise.all([
    db.getCategoriesForLocation(location.id),
    db.getMenuItemsForLocation(location.id),
    db.getAnnouncementsForLocation(location.id),
  ]);

  const featured = items.filter((i) => i.labels.includes('hit') || i.labels.includes('chef_pick'));

  // Группируем категории по «мирам»: Кухня / Бар / Кальяны
  const byRealm = REALM_ORDER.map((realm) => ({
    realm,
    cats: categories.filter((c) => (c.realm ?? 'kitchen') === realm),
  })).filter((g) => g.cats.length > 0);

  return (
    <div className="flex flex-col gap-8">
      <HeroSection videoSrc={location.hero_video} tagline={tBrand('tagline')} />

      <SearchBar items={items} locationSlug={location.slug} />

      {featured.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionTitle>{tHome('featured')}</SectionTitle>
          <PromoCarousel items={featured.slice(0, 10)} locationSlug={location.slug} />
        </section>
      )}

      {byRealm.map(({ realm, cats }) => (
        <section key={realm}>
          <SectionTitle>{tRealms(realm)}</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {cats.map((c, idx) => {
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
      ))}

      {featured.length > 0 && (
        <section>
          <SectionTitle>{t('hitsTitle')}</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {featured.slice(0, 8).map((item, i) => (
              <CategoryCard
                key={`hit-${item.id}`}
                href={`/${location.slug}/item/${item.id}`}
                title={item.name}
                icon="✦"
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      <AnnouncementBanner announcements={announcements} />
    </div>
  );
}
