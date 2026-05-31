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
import { getLocationAccent } from '@/lib/location-theme';

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
  const tHome = await getTranslations('home');
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

  // Все категории в едином порядке миров (Кухня → Бар → Кальяны), без дробления на секции
  const orderedCategories = [...categories].sort(
    (a, b) =>
      REALM_ORDER.indexOf((a.realm ?? 'kitchen') as 'kitchen' | 'bar' | 'hookah') -
      REALM_ORDER.indexOf((b.realm ?? 'kitchen') as 'kitchen' | 'bar' | 'hookah'),
  );

  const accent = getLocationAccent(location.slug, location.brand_color);
  const locationName =
    locale === 'en' && location.name_en
      ? location.name_en
      : locale === 'zh' && location.name_zh
        ? location.name_zh
        : location.name;

  return (
    <div className="flex flex-col gap-6">
      <HeroSection
        videoSrc={location.hero_video}
        poster={location.hero_video ? location.hero_video.replace(/hero\.mp4$/, 'poster.jpg') : null}
        tagline={tBrand('tagline')}
        locationName={locationName}
        locationCity={location.city ?? location.address}
        accent={accent}
      />

      <SearchBar items={items} locationSlug={location.slug} />

      {featured.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionTitle>{tHome('featured')}</SectionTitle>
          <PromoCarousel items={featured.slice(0, 10)} locationSlug={location.slug} />
        </section>
      )}

      {orderedCategories.length > 0 && (
        <section>
          <SectionTitle>{tHome('menu')}</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {orderedCategories.map((c, idx) => {
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
      )}

      <AnnouncementBanner announcements={announcements} />
    </div>
  );
}
