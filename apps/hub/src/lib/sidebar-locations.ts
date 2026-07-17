import { MOCK_LOCATIONS, TEMPLATE_SLUGS } from '@barviha/db';
import type { SessionClaims } from './auth/session';

export interface LocationRow {
  slug: string;
  name: string;
}

/**
 * Общий источник списка локаций для сайдбара — используется и на /locations,
 * и на /accounts (тот же сайдбар для навигации), чтобы фильтрация "видит
 * только свою локацию" для boss_location/manager не разъезжалась по двум
 * копиям одной и той же логики.
 */
export function getSidebarLocations(session: SessionClaims | null): {
  templates: LocationRow[];
  working: LocationRow[];
} {
  const templateSet = new Set<string>(TEMPLATE_SLUGS);
  const scopedSlug = session && session.role !== 'big_boss' ? session.locationSlug : null;
  const visible = session?.role === 'big_boss' ? MOCK_LOCATIONS : MOCK_LOCATIONS.filter((l) => l.slug === scopedSlug);
  return {
    templates: visible.filter((l) => templateSet.has(l.slug)).map((l) => ({ slug: l.slug, name: l.name })),
    working: visible.filter((l) => !templateSet.has(l.slug)).map((l) => ({ slug: l.slug, name: l.name })),
  };
}
