import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getClient } from '@barviha/db';
import { LocationHeader } from '@/components/LocationHeader';
import { Toaster } from '@/components/Toaster';
import { FloatingCartButton } from '@/components/FloatingCartButton';
import { SwipeBack } from '@/components/SwipeBack';
import { getLocationAccent } from '@/lib/location-theme';

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

  return (
    <div className="flex min-h-screen flex-col">
      <LocationHeader
        locationName={locationName}
        locationAddress={location.address}
        locationPhone={location.phone ?? null}
        locationSlug={location.slug}
        locations={locations}
        accent={accent}
      />
      <main className="flex-1 mx-auto w-full max-w-[1200px] px-4 sm:px-6 py-6 pb-32">
        {children}
      </main>
      <FloatingCartButton locationSlug={location.slug} />
      <Toaster />
      <SwipeBack />
    </div>
  );
}
