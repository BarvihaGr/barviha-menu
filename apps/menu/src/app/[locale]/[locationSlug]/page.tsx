import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getClient } from '@barviha/db';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Locale } from '@/i18n/routing';
import { pickCategoryName } from '@/lib/i18n-helpers';
import { CategoryPuzzleRow } from '@/components/CategoryPuzzleRow';
import { SectionTitle } from '@/components/SectionTitle';
import { HeroSection } from '@/components/HeroSection';
import { SpotlightCarousel } from '@/components/SpotlightCarousel';
import { StubCarousel } from '@/components/StubCarousel';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';
import { CoffeeHome } from '@/components/coffee/CoffeeHome';
import { CoffeeLuxHome } from '@/components/coffee/CoffeeLuxHome';
import { isCoffeeDesign, coffeeHomeVariant } from '@/lib/coffee-design';
import { getLocationAccent, pickLocationName, pickLocationCity } from '@/lib/location-theme';
import { getBookingUrl } from '@/lib/booking';

/** Порядок слотов слева-направо: Кальяны | Кухня | Бар. */
const HOME_CATEGORIES = ['hookah', 'kitchen', 'bar'] as const;

/** Гео-видео lux-дизайна: у большинства локаций общий ролик (/locations/arka),
 * но у некоторых — своё (см. public/locations/<slug>/hero.mp4), например
 * Павелецкая. Проверяем наличие файла на диске, не хардкодим список слагов. */
function getLuxHeroPaths(slug: string): { video: string; poster: string } {
  const ownVideo = join(process.cwd(), 'public', 'locations', slug, 'hero.mp4');
  if (existsSync(ownVideo)) {
    return { video: `/locations/${slug}/hero.mp4`, poster: `/locations/${slug}/poster.jpg` };
  }
  return { video: '/locations/arka/hero.mp4', poster: '/locations/arka/poster.jpg' };
}

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
  const [categories, announcements, spotlights] = await Promise.all([
    db.getCategoriesForLocation(location.id),
    db.getAnnouncementsForLocation(location.id),
    db.getSpotlightsForLocation(location.id),
  ]);

  // Берём ровно 3 категории (kitchen → bar → hookah) в этом порядке
  const homeCategories = HOME_CATEGORIES.map((slug) => categories.find((c) => c.slug === slug)).filter(
    (c): c is NonNullable<typeof c> => Boolean(c),
  );

  const accent = getLocationAccent(location.slug, location.brand_color);
  const locationName = pickLocationName(location, locale as Locale);
  const locationCity = pickLocationCity(location.city, locale as Locale) ?? location.address;

  // Lux-дизайн «дорогой минимализм» (Ереван) — тёмный hero c бронью и меню.
  if (isCoffeeDesign(locationSlug) && coffeeHomeVariant(locationSlug) === 'lux') {
    const heroPaths = getLuxHeroPaths(location.slug);
    return (
      <CoffeeLuxHome
        locationSlug={location.slug}
        locationName={locationName}
        locationCity={locationCity}
        menuHref={`/${location.slug}/kitchen`}
        menuLabel={tHome('menu')}
        locale={locale as Locale}
        socials={[]}
        heroVideo={heroPaths.video}
        heroPoster={heroPaths.poster}
      />
    );
  }

  // Светлый дизайн Coffeemania — чистая главная без видео-героя и плашки-кнопок.
  if (isCoffeeDesign(locationSlug)) {
    // Репрезентативное фото на каждую категорию (первое блюдо с фото) — для
    // крупных карточек-плиток на главной.
    const allItems = await db.getMenuItemsForLocation(location.id);
    const categoryPhotos: Record<string, string | null> = {};
    for (const c of homeCategories) {
      const withPhoto = allItems.find((i) => i.category_id === c.id && i.photo);
      categoryPhotos[c.slug] = withPhoto?.photo ?? null;
    }

    return (
      <CoffeeHome
        locationSlug={location.slug}
        locationName={locationName}
        locationCity={locationCity}
        categories={homeCategories}
        categoryPhotos={categoryPhotos}
        locale={locale as Locale}
        ctaLabel={tHome('exploreMenu')}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <HeroSection
        videoSrc={location.hero_video}
        poster={location.hero_video ? location.hero_video.replace(/hero\.mp4$/, 'poster.jpg') : null}
        locationName={locationName}
        locationCity={locationCity}
        accent={accent}
      />

      {/* ВРЕМЕННАЯ ЗАГЛУШКА вместо карусели спотлайтов: чёрные карточки с
          золотой надписью, крутятся бесконечной петлёй. Вернуть карусель →
          раскомментировать блок ниже и убрать StubCarousel. */}
      <section className="pb-6 -mt-6 relative left-1/2 -translate-x-1/2 w-screen max-w-[100vw]">
        <StubCarousel
          items={[
            {
              alt: tHome('stub.afishaAlt'),
              card: {
                kind: 'afisha',
                brand: 'BARVIKHA',
                title: tHome('stub.afishaTitle'),
                subtitle: tHome('stub.afishaSubtitle'),
                date: tHome('stub.days'),
                time: '22:00',
                place: locationName,
              },
              title: tHome('stub.afishaTitle'),
              subtitle: tHome('stub.afishaSubtitle'),
              bookingUrl: getBookingUrl(locationSlug),
            },
            {
              alt: tHome('stub.djAlt'),
              card: {
                kind: 'dj',
                brand: 'BARVIKHA',
                eyebrow: tHome('stub.djEyebrow'),
                name: 'DJ Sander',
                date: tHome('stub.days'),
                time: '22:00',
              },
              title: tHome('stub.djTitle'),
              subtitle: tHome('stub.djSubtitle'),
              bookingUrl: getBookingUrl(locationSlug),
            },
            {
              alt: tHome('stub.socialAlt'),
              card: {
                kind: 'social',
                brand: 'BARVIKHA',
                title: tHome('stub.socialTitle'),
                note: tHome('stub.socialNote'),
                socials: ['VK'],
              },
              title: tHome('stub.socialTitle'),
              subtitle: tHome('stub.socialSubtitle'),
              links: [
                { label: tHome('stub.vkLabel'), href: 'https://vk.com/barvikha_group' },
              ],
            },
          ]}
        />
      </section>
      {/* {spotlights.length > 0 && (
        <section className="pb-6 -mt-6 relative left-1/2 -translate-x-1/2 w-screen max-w-[100vw]">
          <SpotlightCarousel spotlights={spotlights} accent={accent} />
        </section>
      )} */}

      {homeCategories.length > 0 && (
        <section className="pb-4">
          <SectionTitle>{tHome('menu')}</SectionTitle>
          <div className="px-2 sm:px-6">
            <CategoryPuzzleRow
              locationSlug={location.slug}
              items={homeCategories.map((c) => {
                const slug = c.slug as (typeof HOME_CATEGORIES)[number];
                return {
                  href: slug === 'hookah' ? `/${location.slug}/hookah` : `/${location.slug}/${slug}`,
                  title: pickCategoryName(c, locale as Locale),
                };
              })}
            />
          </div>
        </section>
      )}

      <AnnouncementBanner announcements={announcements} />
    </div>
  );
}
