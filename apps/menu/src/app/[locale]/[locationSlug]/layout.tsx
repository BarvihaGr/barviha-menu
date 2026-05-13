import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getClient } from '@barviha/db';
import { LocationHeader } from '@/components/LocationHeader';
import { Toaster } from '@/components/Toaster';
import { FloatingCartButton } from '@/components/FloatingCartButton';
import { CallWaiterButton } from '@/components/CallWaiterButton';

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
  const location = await db.getLocationBySlug(locationSlug);
  if (!location) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <LocationHeader
        locationName={location.name}
        locationAddress={location.address}
        locationSlug={location.slug}
      />
      <main className="flex-1 mx-auto w-full max-w-[1200px] px-4 sm:px-6 py-6 pb-32">
        {children}
      </main>
      <CallWaiterButton variant="floating" />
      <FloatingCartButton locationSlug={location.slug} />
      <Toaster />
    </div>
  );
}
