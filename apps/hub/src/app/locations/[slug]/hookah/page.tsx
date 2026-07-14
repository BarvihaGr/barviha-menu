import { notFound } from 'next/navigation';
import { MOCK_LOCATIONS, getCatalogItems, isContentStoreSlug } from '@barviha/db';
import { PageShell } from '../PageShell';
import { CatalogEditor } from '../CatalogEditor';
import { NotOnboarded } from '../../NotOnboarded';

export default async function HookahPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loc = MOCK_LOCATIONS.find((l) => l.slug === slug);
  if (!loc) notFound();

  return (
    <PageShell name={loc.name} slug={slug}>
      {isContentStoreSlug(slug) ? (
        <CatalogEditor
          slug={slug}
          realm="hookah"
          items={getCatalogItems(slug, 'hookah').filter((it) => !it.is_archived)}
        />
      ) : (
        <NotOnboarded name={loc.name} />
      )}
    </PageShell>
  );
}
