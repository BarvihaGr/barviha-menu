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
import { isCoffeeDesign } from '@/lib/coffee-design';
import { getLocationAccent } from '@/lib/location-theme';
import { getBookingUrl } from '@/lib/booking';

/** Порядок слотов слева-направо: Кальяны | Кухня | Бар. */
const HOME_CATEGORIES = ['hookah', 'kitchen', 'bar'] as const;

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
  const locationName =
    locale === 'en' && location.name_en
      ? location.name_en
      : locale === 'zh' && location.name_zh
        ? location.name_zh
        : location.name;

  // Светлый дизайн Coffeemania — чистая главная без видео-героя и плашки-кнопок.
  if (isCoffeeDesign(locationSlug)) {
    return (
      <CoffeeHome
        locationSlug={location.slug}
        locationName={locationName}
        locationCity={location.city ?? location.address}
        categories={homeCategories}
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
        locationCity={location.city ?? location.address}
        accent={accent}
      />

      {/* ВРЕМЕННАЯ ЗАГЛУШКА вместо карусели спотлайтов: чёрные карточки с
          золотой надписью, крутятся бесконечной петлёй. Вернуть карусель →
          раскомментировать блок ниже и убрать StubCarousel. */}
      <section className="pb-6 -mt-6 relative left-1/2 -translate-x-1/2 w-screen max-w-[100vw]">
        <StubCarousel
          items={[
            {
              alt: 'Афиша — ночь в стиле Barvikha',
              card: {
                kind: 'afisha',
                brand: 'BARVIKHA',
                title: 'Ночь в стиле Barvikha',
                subtitle: 'Атмосфера роскоши, музыки и безупречного отдыха.',
                date: '24 мая',
                time: '22:00',
                place: locationName,
              },
              title: 'Ночь в стиле Barvikha',
              subtitle: 'Атмосфера роскоши, музыки и безупречного отдыха.',
              bookingUrl: getBookingUrl(locationSlug),
            },
            {
              alt: 'DJ Sander — live DJ-set',
              card: {
                kind: 'dj',
                brand: 'BARVIKHA',
                eyebrow: 'Live · DJ set',
                name: 'DJ Sander',
                date: '24 мая',
                time: '22:00',
              },
              title: 'DJ Sander — Live DJ-set',
              subtitle: 'Живой сет по выходным. Бронируйте стол заранее.',
              bookingUrl: getBookingUrl(locationSlug),
            },
            {
              alt: 'Мы в социальных сетях',
              card: {
                kind: 'social',
                brand: 'BARVIKHA',
                title: 'Мы в социальных сетях',
                note: 'Актуальные события',
                socials: ['VK', 'MAX'],
              },
              title: 'Мы в социальных сетях',
              subtitle: 'Афиша, акции и связь с нами — подписывайтесь.',
              // Заглушки: заменить на реальные ссылки соцсетей по локациям.
              links: [
                { label: 'ВКонтакте', href: 'https://vk.com/barvikha_group' },
                { label: 'MAX', href: '#' },
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
