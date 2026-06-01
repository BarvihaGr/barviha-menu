import { getClient } from '@barviha/db';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { UtensilsCrossed, Wine } from 'lucide-react';
import type { Locale } from '@/i18n/routing';
import { pickCategoryName } from '@/lib/i18n-helpers';
import { CategoryPuzzleCard } from '@/components/CategoryPuzzleCard';
import { SectionTitle } from '@/components/SectionTitle';
import { HeroSection } from '@/components/HeroSection';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';
import { HookahIcon } from '@/components/icons/HookahIcon';
import { getLocationAccent } from '@/lib/location-theme';

/** Порядок слотов слева-направо: Кальяны | Кухня | Бар. */
const HOME_CATEGORIES = ['hookah', 'kitchen', 'bar'] as const;

const CATEGORY_VISUALS: Record<
  (typeof HOME_CATEGORIES)[number],
  {
    icon: React.ReactNode;
    aspect: 'tall' | 'normal' | 'wide';
    offsetY: 'up' | 'none' | 'down';
    /** shape 0 — бугор справа; shape 1 — впадина слева + бугор справа; shape 2 — впадина слева */
    shape: 0 | 1 | 2;
  }
> = {
  hookah: {
    icon: <HookahIcon size={48} />,
    aspect: 'tall',
    offsetY: 'down',
    shape: 0,
  },
  kitchen: {
    icon: <UtensilsCrossed size={44} strokeWidth={1.6} />,
    aspect: 'tall',
    offsetY: 'none',
    shape: 1,
  },
  bar: {
    icon: <Wine size={44} strokeWidth={1.6} />,
    aspect: 'normal',
    offsetY: 'down',
    shape: 2,
  },
};

export default async function LocationHome({
  params,
}: {
  params: Promise<{ locale: string; locationSlug: string }>;
}) {
  const { locale, locationSlug } = await params;
  setRequestLocale(locale);
  const tHome = await getTranslations('home');

  const db = getClient();
  const location = await db.getLocationBySlug(locationSlug);
  if (!location) notFound();
  const [categories, announcements] = await Promise.all([
    db.getCategoriesForLocation(location.id),
    db.getAnnouncementsForLocation(location.id),
  ]);

  // Берём ровно 3 категории (kitchen → bar → hookah) в этом порядке
  const homeCategories = HOME_CATEGORIES.map((slug) => categories.find((c) => c.slug === slug)).filter(
    (c): c is NonNullable<typeof c> => Boolean(c),
  );

  const accent = getLocationAccent(location.slug, location.brand_color);
  const locationName =
    locale === 'en' && location.name_en
      ? location.name_en
      : locale === 'zh' && location.name_zh
        ? location.name_zh
        : location.name;

  return (
    <div className="flex flex-col gap-2">
      <HeroSection
        videoSrc={location.hero_video}
        poster={location.hero_video ? location.hero_video.replace(/hero\.mp4$/, 'poster.jpg') : null}
        locationName={locationName}
        locationCity={location.city ?? location.address}
        accent={accent}
      />

      {homeCategories.length > 0 && (
        <section className="pb-4">
          <SectionTitle>{tHome('menu')}</SectionTitle>
          <div className="grid grid-cols-3 gap-1 sm:gap-2 px-2 sm:px-6">
            {homeCategories.map((c, idx) => {
              const slug = c.slug as (typeof HOME_CATEGORIES)[number];
              const visual = CATEGORY_VISUALS[slug];
              const href = slug === 'hookah' ? `/${location.slug}/hookah` : `/${location.slug}/${slug}`;
              return (
                <CategoryPuzzleCard
                  key={c.id}
                  href={href}
                  title={pickCategoryName(c, locale as Locale)}
                  icon={visual.icon}
                  aspect={visual.aspect}
                  offsetY={visual.offsetY}
                  shape={visual.shape}
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
