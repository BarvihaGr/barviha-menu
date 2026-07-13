import { notFound } from 'next/navigation';
import { MOCK_LOCATIONS, getStopListItems, isContentStoreSlug } from '@barviha/db';
import { Header } from '../Header';
import { FlagListEditor } from '../FlagListEditor';
import { NotOnboarded } from '../../NotOnboarded';

export default async function StopListPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loc = MOCK_LOCATIONS.find((l) => l.slug === slug);
  if (!loc) notFound();

  return (
    <div>
      <Header name={loc.name} slug={slug} />
      {isContentStoreSlug(slug) ? (
        <FlagListEditor slug={slug} items={getStopListItems(slug)} mode="stop-list" />
      ) : (
        <NotOnboarded name={loc.name} />
      )}
    </div>
  );
}
