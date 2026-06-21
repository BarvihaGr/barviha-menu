import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getClient } from '@barviha/db';
import { LocationHeader } from '@/components/LocationHeader';
import { CoffeeHeader } from '@/components/coffee/CoffeeHeader';
import { Toaster } from '@/components/Toaster';
import { FloatingCartButton } from '@/components/FloatingCartButton';
import { SwipeBack } from '@/components/SwipeBack';
import { ScrollMemory } from '@/components/ScrollMemory';
import { getLocationAccent } from '@/lib/location-theme';
import { isCoffeeDesign } from '@/lib/coffee-design';

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

  const accent = getLocationAccent(location.slug, location.brand_color);
  const locationName =
    locale === 'en' && location.name_en
      ? location.name_en
      : locale === 'zh' && location.name_zh
        ? location.name_zh
        : location.name;

  const coffee = isCoffeeDesign(location.slug);

  return (
    <div className="flex min-h-screen flex-col">
      {coffee ? (
        <CoffeeHeader locationSlug={location.slug} locations={locations} />
      ) : (
        <LocationHeader locationSlug={location.slug} locations={locations} />
      )}
      <main className="flex-1 mx-auto w-full max-w-[1200px] px-4 sm:px-6 pt-2 pb-32">
        {children}
      </main>
      {/* Coffeemania — без нижней плашки-кнопок; корзина живёт в шапке. */}
      {!coffee && (
        <FloatingCartButton
          locationSlug={location.slug}
          locationName={locationName}
          address={location.address}
          phone={location.phone ?? null}
          accent={accent}
        />
      )}
      <Toaster />
      <SwipeBack />
      <ScrollMemory />
    </div>
  );
}
