import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getClient } from '@barviha/db';
import { routing, type Locale } from '@/i18n/routing';
import { isOpenOnline, isTemplateSlug } from './active-locations';
import { pickLocationName } from './location-theme';

export const SITE_URL = 'https://menu.barvikhagroup.ru';
const OG_IMAGE = '/locations/arka/poster.jpg';
const NOINDEX = { index: false, follow: false } as const;

/** canonical + hreflang для пути без локали («/paveletskaia/kitchen», корень — «»). */
export function pageAlternates(locale: string, path: string): NonNullable<Metadata['alternates']> {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`])),
      'x-default': `/${routing.defaultLocale}${path}`,
    },
  };
}

interface PageMetaInput {
  locale: string;
  locationSlug: string;
  /** Хвост пути после слага локации: '', '/kitchen', '/item/<id>'. */
  subPath?: string;
  /** Название раздела/позиции — идёт первым в заголовке. */
  section?: string | null;
  description?: string | null;
  image?: string | null;
  /** Страницу не индексировать при любых условиях (корзина). */
  noindex?: boolean;
}

/**
 * Заголовок/описание/canonical/hreflang/OG страницы локации. Шаблоны («Тест
 * лок») и выключенные в бэк-офисе локации — всегда noindex.
 */
export async function locationPageMetadata({
  locale,
  locationSlug,
  subPath = '',
  section,
  description,
  image,
  noindex,
}: PageMetaInput): Promise<Metadata> {
  const location = await getClient().getLocationBySlug(locationSlug);
  if (!location) return {};

  const t = await getTranslations({ locale, namespace: 'meta' });
  const name = pickLocationName(location, locale as Locale);
  // Бренд-вордмарк — латиницей на любом языке (см. [locale]/layout.tsx).
  const brand = `Barvikha Lounge — ${name}`;
  const title = section ? `${section} · ${brand}` : brand;
  const desc =
    description?.trim() ||
    (section ? t('sectionDescription', { section, name }) : t('locationDescription', { name }));
  const path = `/${locationSlug}${subPath}`;
  const hidden = noindex || isTemplateSlug(locationSlug) || !isOpenOnline(location);

  return {
    title,
    description: desc,
    alternates: pageAlternates(locale, path),
    robots: hidden ? NOINDEX : undefined,
    openGraph: {
      title,
      description: desc,
      url: `/${locale}${path}`,
      siteName: 'Barvikha Lounge',
      locale,
      type: 'website',
      images: [image || OG_IMAGE],
    },
  };
}
