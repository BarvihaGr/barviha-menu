import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getClient } from '@barviha/db';
import { LocationClosedScreen } from '@/components/LocationClosedScreen';
import { LocationHeader } from '@/components/LocationHeader';
import { CoffeeHeader } from '@/components/coffee/CoffeeHeader';
import { LuxBottomNav } from '@/components/coffee/LuxBottomNav';
import { BarvikhaBottomNav } from '@/components/BarvikhaBottomNav';
import { KievThemeProvider } from '@/components/coffee/KievThemeProvider';
import { Toaster } from '@/components/Toaster';
import { FloatingCartButton } from '@/components/FloatingCartButton';
import { SwipeBack } from '@/components/SwipeBack';
import { ScrollMemory } from '@/components/ScrollMemory';
import { getLocationAccent } from '@/lib/location-theme';
import {
  isCoffeeDesign,
  isKievskaiaStyle,
  getCoffeeAccent,
  coffeeAccentStyle,
  coffeeHomeVariant,
} from '@/lib/coffee-design';
import { cn } from '@/lib/utils';

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
    db.getAllLocations(),
  ]);
  if (!location) notFound();

  const locationName =
    locale === 'en' && location.name_en
      ? location.name_en
      : locale === 'zh' && location.name_zh
        ? location.name_zh
        : location.name;

  // Локацию выключили в бэк-офисе (is_active: false) — показываем заглушку
  // вместо каталога/шапки/навигации, не 404 (ссылка живая, просто закрыта).
  if (location.is_active === false) {
    return <LocationClosedScreen locationName={locationName} />;
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
      {coffee ? (
        <CoffeeHeader locationSlug={location.slug} locations={locations} />
      ) : (
        <LocationHeader locationSlug={location.slug} locations={locations} />
      )}
      <main className="flex-1 mx-auto w-full max-w-[1200px] px-4 sm:px-6 pt-2 pb-32">
        {children}
      </main>
      {lux ? (
        <LuxBottomNav locationSlug={location.slug} />
      ) : coffee ? (
        <FloatingCartButton
          locationSlug={location.slug}
          locationName={locationName}
          address={location.address}
          phone={location.phone ?? null}
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
