import { notFound } from 'next/navigation';
import { MOCK_LOCATIONS, getLocationSettings, isContentStoreSlug } from '@barviha/db';
import { PageShell } from './PageShell';
import { LocationSettingsForm } from './LocationSettingsForm';
import { NotOnboarded } from '../NotOnboarded';

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loc = MOCK_LOCATIONS.find((l) => l.slug === slug);
  if (!loc) notFound();

  return (
    <PageShell name={loc.name} slug={slug}>
      {isContentStoreSlug(slug) ? (
        <LocationSettingsForm slug={slug} settings={getLocationSettings(slug)} />
      ) : (
        <NotOnboarded name={loc.name} />
      )}
    </PageShell>
  );
}
