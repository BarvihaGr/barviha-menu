import { notFound } from 'next/navigation';
import { MOCK_LOCATIONS, getAvailabilityItems, isContentStoreSlug } from '@barviha/db';
import { PageShell } from '../PageShell';
import { AvailabilityBoard } from '../AvailabilityBoard';
import { NotOnboarded } from '../../NotOnboarded';

/**
 * «Стоп-лист» — доска всех действующих позиций с тумблером «в наличии».
 * Для роли manager (админ локации) это единственный экран бэк-офиса:
 * поставить в стоп-лист / вернуть, ничего больше. Для владельца и
 * управляющего — тот же быстрый обзор без захода в каждый раздел.
 */
export default async function StopListPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loc = MOCK_LOCATIONS.find((l) => l.slug === slug);
  if (!loc) notFound();

  return (
    <PageShell name={loc.name} slug={slug}>
      {isContentStoreSlug(slug) ? (
        <AvailabilityBoard slug={slug} items={getAvailabilityItems(slug)} />
      ) : (
        <NotOnboarded name={loc.name} />
      )}
    </PageShell>
  );
}
