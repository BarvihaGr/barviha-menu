import { notFound } from 'next/navigation';
import { MOCK_LOCATIONS, getCatalogItems, isContentStoreSlug } from '@barviha/db';
import { Header } from '../Header';
import { CatalogEditor } from '../CatalogEditor';
import { NotOnboarded } from '../../NotOnboarded';

export default async function KitchenPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loc = MOCK_LOCATIONS.find((l) => l.slug === slug);
  if (!loc) notFound();

  return (
    <div>
      <Header name={loc.name} slug={slug} />
      {isContentStoreSlug(slug) ? (
        <CatalogEditor
          slug={slug}
          realm="kitchen"
          items={getCatalogItems(slug, 'kitchen').filter((it) => !it.is_archived)}
        />
      ) : (
        <NotOnboarded name={loc.name} />
      )}
    </div>
  );
}
