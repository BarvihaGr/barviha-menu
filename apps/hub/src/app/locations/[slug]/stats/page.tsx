import { notFound } from 'next/navigation';
import { MOCK_LOCATIONS, getStatsSummary, isContentStoreSlug } from '@barviha/db';
import { Header } from '../Header';
import { StatsView } from '../StatsView';
import { NotOnboarded } from '../../NotOnboarded';

export default async function StatsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loc = MOCK_LOCATIONS.find((l) => l.slug === slug);
  if (!loc) notFound();

  return (
    <div>
      <Header name={loc.name} slug={slug} />
      {isContentStoreSlug(slug) ? (
        <StatsView rows={getStatsSummary(slug)} />
      ) : (
        <NotOnboarded name={loc.name} />
      )}
    </div>
  );
}
