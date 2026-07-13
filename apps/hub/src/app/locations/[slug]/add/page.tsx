import { notFound } from 'next/navigation';
import {
  MOCK_LOCATIONS,
  getBarCategories,
  getCatalogCategories,
  isContentStoreSlug,
  usesArkaBarTemplate,
} from '@barviha/db';
import type { CatalogRealm } from '@barviha/db';
import { Header } from '../Header';
import { AddContentEditor } from '../AddContentEditor';
import { NotOnboarded } from '../../NotOnboarded';

export default async function AddPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loc = MOCK_LOCATIONS.find((l) => l.slug === slug);
  if (!loc) notFound();

  if (!isContentStoreSlug(slug)) {
    return (
      <div>
        <Header name={loc.name} slug={slug} />
        <NotOnboarded name={loc.name} />
      </div>
    );
  }

  const isBarTemplate = usesArkaBarTemplate(slug);
  const realms: CatalogRealm[] = ['kitchen', 'hookah', 'bar'];
  const catalogCategories = Object.fromEntries(
    realms.map((r) => [r, r === 'bar' && isBarTemplate ? [] : getCatalogCategories(slug, r)]),
  ) as Record<CatalogRealm, { sub: string; label: string }[]>;

  return (
    <div>
      <Header name={loc.name} slug={slug} />
      <AddContentEditor
        slug={slug}
        isBarTemplate={isBarTemplate}
        catalogCategories={catalogCategories}
        barCategories={isBarTemplate ? getBarCategories(slug) : []}
      />
    </div>
  );
}
