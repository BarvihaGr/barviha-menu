import { notFound } from 'next/navigation';
import {
  MOCK_LOCATIONS,
  filterBarSections,
  getBarSections,
  getCatalogItems,
  isContentStoreSlug,
  usesArkaBarTemplate,
} from '@barviha/db';
import { Header } from '../Header';
import { BarEditor } from '../BarEditor';
import { CatalogEditor } from '../CatalogEditor';
import { NotOnboarded } from '../../NotOnboarded';

export default async function BarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loc = MOCK_LOCATIONS.find((l) => l.slug === slug);
  if (!loc) notFound();

  return (
    <div>
      <Header name={loc.name} slug={slug} />
      {!isContentStoreSlug(slug) ? (
        <NotOnboarded name={loc.name} />
      ) : usesArkaBarTemplate(slug) ? (
        <BarEditor
          slug={slug}
          sections={filterBarSections(getBarSections(slug), (it) => !it.is_archived)}
        />
      ) : (
        // Киевская: Бар — обычные позиции (своя вёрстка CoffeeMenuList не задета).
        <CatalogEditor
          slug={slug}
          realm="bar"
          items={getCatalogItems(slug, 'bar').filter((it) => !it.is_archived)}
        />
      )}
    </div>
  );
}
