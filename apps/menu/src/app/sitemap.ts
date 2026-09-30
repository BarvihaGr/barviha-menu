import type { MetadataRoute } from 'next';
import { getClient } from '@barviha/db';
import { routing } from '@/i18n/routing';
import { getActiveLocations } from '@/lib/active-locations';
import { coffeeHomeVariant, isCoffeeDesign } from '@/lib/coffee-design';
import { SITE_URL } from '@/lib/seo';

// Локации включаются/выключаются в бэк-офисе — карту собираем на запрос.
export const dynamic = 'force-dynamic';

function entry(path: string, priority: number): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}/${routing.defaultLocale}${path}`,
    changeFrequency: 'daily',
    priority,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`])),
    },
  };
}

/** Главная и разделы открытых локаций (карточки позиций поиск находит по ссылкам из разделов). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = getClient();
  const locations = await getActiveLocations();
  // Корень при единственной открытой локации — редирект в неё, в карту не кладём.
  const out: MetadataRoute.Sitemap = locations.length === 1 ? [] : [entry('', 1)];

  for (const location of locations) {
    out.push(entry(`/${location.slug}`, 0.9));
    const categories = await db.getCategoriesForLocation(location.id);
    for (const c of categories) out.push(entry(`/${location.slug}/${c.slug}`, 0.8));
    // «Меню»-хаб и «Контакты» есть только у lux-локаций, у остальных там редирект на главную.
    if (isCoffeeDesign(location.slug) && coffeeHomeVariant(location.slug) === 'lux') {
      out.push(entry(`/${location.slug}/menu`, 0.7), entry(`/${location.slug}/contacts`, 0.6));
    }
  }
  return out;
}
