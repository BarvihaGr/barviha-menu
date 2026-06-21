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
              src: '/spotlight/afisha.webp',
              alt: 'Афиша — ночь в стиле Barvikha',
              w: 16,
              h: 9,
              title: 'Ночь в стиле Barvikha',
              subtitle: 'Атмосфера роскоши, музыки и безупречного отдыха.',
              bookingUrl: getBookingUrl(locationSlug),
            },
            {
              src: '/spotlight/dj.webp',
              alt: 'DJ Sander — live DJ-set',
              w: 16,
              h: 9,
              title: 'DJ Sander — Live DJ-set',
              subtitle: 'Живой сет по выходным. Бронируйте стол заранее.',
              bookingUrl: getBookingUrl(locationSlug),
            },
            {
              src: '/spotlight/soc.webp',
              alt: 'Мы в социальных сетях',
              w: 16,
              h: 9,
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
