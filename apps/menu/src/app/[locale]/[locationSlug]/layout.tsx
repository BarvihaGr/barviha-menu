import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { getClient } from '@barviha/db';
import { LocationClosedScreen } from '@/components/LocationClosedScreen';
import { LegalFooter } from '@/components/LegalFooter';
import { NearbyLocationPrompt } from '@/components/NearbyLocationPrompt';
import { LocationHeader } from '@/components/LocationHeader';
import { CoffeeHeader } from '@/components/coffee/CoffeeHeader';
import { LuxBottomNav } from '@/components/coffee/LuxBottomNav';
import { BarvikhaBottomNav } from '@/components/BarvikhaBottomNav';
import { KievThemeProvider } from '@/components/coffee/KievThemeProvider';
import { Toaster } from '@/components/Toaster';
import { FloatingCartButton } from '@/components/FloatingCartButton';
import { SwipeBack } from '@/components/SwipeBack';
import { ScrollMemory } from '@/components/ScrollMemory';
import { getLocationAccent, pickLocationName } from '@/lib/location-theme';
import type { Locale } from '@/i18n/routing';
import {
  isCoffeeDesign,
  isKievskaiaStyle,
  getCoffeeAccent,
  coffeeAccentStyle,
  coffeeHomeVariant,
} from '@/lib/coffee-design';
import { cn } from '@/lib/utils';
import { pickLocationAddress } from '@/lib/i18n-helpers';
import { getActiveLocations, getOpenLocations, isTemplateSlug } from '@/lib/active-locations';
import { locationPageMetadata } from '@/lib/seo';

/**
 * Заголовок/манифест/подпись под иконкой — per-локация, а не общие на весь
 * сайт (см. api/manifest/[locale]/[locationSlug] — там же объяснение бага
 * с «Добавить на экран Домой», который эта функция чинит вместе с ним).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; locationSlug: string }>;
}): Promise<Metadata> {
  const { locale, locationSlug } = await params;
  const db = getClient();
  const location = await db.getLocationBySlug(locationSlug);
  if (!location) return {};

  const name = pickLocationName(location, locale as Locale);
  const tHome = await getTranslations({ locale, namespace: 'home' });

  return {
    // Заголовок/описание/canonical — фолбэк; у каждой страницы локации свой
    // generateMetadata (canonical у разделов и карточек разный).
    ...(await locationPageMetadata({ locale, locationSlug })),
    manifest: `/api/manifest/${locale}/${locationSlug}`,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: `${tHome('menu')} ${name}`,
    },
  };
}

export default async function LocationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; locationSlug: string }>;
}) {
  const { locale, locationSlug } = await params;
  setRequestLocale(locale);

  const db = getClient();
  const [location, locations] = await Promise.all([
    db.getLocationBySlug(locationSlug),
    // Выключенные в бэк-офисе локации гостю не предлагаем — ни в
    // переключателе, ни в подсказке «вы рядом».
    getOpenLocations(),
  ]);
  if (!location) notFound();

  const locationName = pickLocationName(location, locale as Locale);

  // Локацию выключили в бэк-офисе (is_active: false) — показываем заглушку
  // вместо каталога/шапки/навигации, не 404 (ссылка живая, просто закрыта).
  if (location.is_active === false) {
    return (
      <LocationClosedScreen
        locationName={locationName}
        openLocations={await getActiveLocations()}
        locale={locale as Locale}
      />
    );
  }

  const coffeeDesign = isCoffeeDesign(location.slug);
  const accent = coffeeDesign
    ? getCoffeeAccent(location.slug)
    : getLocationAccent(location.slug, location.brand_color);

  const coffee = coffeeDesign;
  const lux = coffee && coffeeHomeVariant(location.slug) === 'lux';
  const isKiev = isKievskaiaStyle(location.slug);

  const inner = (
    <>
      {/* «Тест лок»-шаблоны гостю как «ближайшее заведение» не предлагаем. */}
      <NearbyLocationPrompt
        currentSlug={location.slug}
        locations={locations.filter((l) => l.slug === location.slug || !isTemplateSlug(l.slug))}
      />
      {coffee ? (
        <CoffeeHeader locationSlug={location.slug} locations={locations} />
      ) : (
        <LocationHeader locationSlug={location.slug} locations={locations} />
      )}
      <main className="flex-1 mx-auto w-full max-w-[1200px] px-4 sm:px-6 pt-2 pb-32">
        {children}
      </main>
      {/* Вне <main>: страницы гасят его нижний отступ отрицательным margin
          (lux-главная на весь экран), и подвал внутри main уезжал под них.
          Свой нижний отступ — под фиксированную нижнюю навигацию. */}
      <LegalFooter className="px-6 pb-28" />
      {lux ? (
        <LuxBottomNav locationSlug={location.slug} />
      ) : coffee ? (
        <FloatingCartButton
          locationSlug={location.slug}
          locationName={locationName}
          address={pickLocationAddress(location.address, locale as Locale)}
          phone={location.phone ?? null}
          latitude={location.latitude}
          longitude={location.longitude}
          accent={accent}
          locations={locations}
          dockAccent={getCoffeeAccent(location.slug)}
        />
      ) : (
        <BarvikhaBottomNav locationSlug={location.slug} />
      )}
      <Toaster />
      <SwipeBack />
      <ScrollMemory />
    </>
  );

  return (
    <div
      className={cn('flex min-h-screen flex-col', coffee && 'coffee-theme')}
      style={coffee ? coffeeAccentStyle(location.slug) : undefined}
    >
      {isKiev ? <KievThemeProvider>{inner}</KievThemeProvider> : inner}
    </div>
  );
}
