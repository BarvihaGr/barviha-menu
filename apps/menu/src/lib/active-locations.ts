import { getClient, type Location } from '@barviha/db';
import { TEMPLATE_SLUGS } from '@barviha/db/onboarding';
import { LOCATION_GROUPS, type LocationGroupDef } from './location-theme';

function flattenSlugs(defs: LocationGroupDef[]): string[] {
  return defs.flatMap((d) => d.slugs ?? flattenSlugs(d.children ?? []));
}

/** Порядок локаций как в переключателе (страна → город → точки), не по алфавиту. */
const SWITCHER_ORDER = new Map(flattenSlugs(LOCATION_GROUPS).map((slug, i) => [slug, i]));

export function isTemplateSlug(slug: string): boolean {
  return (TEMPLATE_SLUGS as readonly string[]).includes(slug);
}

/** Локация открыта гостям: включена в бэк-офисе (по умолчанию — да). */
export function isOpenOnline(l: Pick<Location, 'is_active'>): boolean {
  return l.is_active !== false;
}

/**
 * Все локации, но без выключенных в бэк-офисе — то, что можно предлагать
 * гостю (переключатель, «вы рядом»). Шаблоны («Тест лок») остаются: их
 * прячет сам переключатель, а своя шапка у них должна знать текущую локацию.
 */
export async function getOpenLocations(): Promise<Location[]> {
  return (await getClient().getAllLocations()).filter(isOpenOnline);
}

/**
 * Рабочие локации сети, открытые онлайн, — для корня сайта, заглушки закрытой
 * локации и sitemap. Без шаблонов, в порядке переключателя.
 */
export async function getActiveLocations(): Promise<Location[]> {
  return (await getOpenLocations())
    .filter((l) => !isTemplateSlug(l.slug))
    .sort((a, b) => (SWITCHER_ORDER.get(a.slug) ?? 999) - (SWITCHER_ORDER.get(b.slug) ?? 999));
}
