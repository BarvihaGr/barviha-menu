import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getClient } from '@barviha/db';
import { LocationHeader } from '@/components/LocationHeader';
import { CoffeeHeader } from '@/components/coffee/CoffeeHeader';
import { LuxBottomNav } from '@/components/coffee/LuxBottomNav';
import { KievThemeProvider } from '@/components/coffee/KievThemeProvider';
import { Toaster } from '@/components/Toaster';
import { FloatingCartButton } from '@/components/FloatingCartButton';
import { SwipeBack } from '@/components/SwipeBack';
import { ScrollMemory } from '@/components/ScrollMemory';
import { getLocationAccent } from '@/lib/location-theme';
import {
  isCoffeeDesign,
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

  const coffeeDesign = isCoffeeDesign(location.slug);
  // Для светлого дизайна акцент = фирменный цвет локации (ветка метро),
  // чтобы инфо-модалка и плашка совпадали по цвету с остальным UI.
  const accent = coffeeDesign
    ? getCoffeeAccent(location.slug)
    : getLocationAccent(location.slug, location.brand_color);
  const locationName =
    locale === 'en' && location.name_en
      ? location.name_en
      : locale === 'zh' && location.name_zh
        ? location.name_zh
        : location.name;

  const coffee = coffeeDesign;
  // Lux-локации (Ереван, Киевская) — нижняя навигация на 4 таба вместо плашки.
  const lux = coffee && coffeeHomeVariant(location.slug) === 'lux';
  const isKiev = location.slug === 'kievskaia';

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
      ) : (
        <FloatingCartButton
          locationSlug={location.slug}
          locationName={locationName}
          address={location.address}
          phone={location.phone ?? null}
          accent={accent}
          locations={locations}
          dockAccent={coffee ? getCoffeeAccent(location.slug) : undefined}
        />
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
