import { getClient } from '@barviha/db';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { pickCategoryName } from '@/lib/i18n-helpers';
import { SectionTitle } from '@/components/SectionTitle';
import { CategoryItemsList } from '@/components/CategoryItemsList';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; locationSlug: string; categorySlug: string }>;
}) {
  const { locale, locationSlug, categorySlug } = await params;
  setRequestLocale(locale);
  const tCommon = await getTranslations('common');

  if (categorySlug === 'hookah') {
    redirect(`/${locale}/${locationSlug}/hookah`);
  }

  const db = getClient();
  const location = await db.getLocationBySlug(locationSlug);
  if (!location) notFound();
  const category = await db.getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const items = (await db.getMenuItemsForLocation(location.id)).filter(
    (i) => i.category_id === category.id,
  );

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={`/${locationSlug}`}
        className="inline-flex items-center gap-1 self-start text-[10px] uppercase tracking-[0.25em] text-muted hover:text-gold cursor-pointer"
      >
        <ChevronLeft size={14} />
        {tCommon('back')}
      </Link>
      <SectionTitle>{pickCategoryName(category, locale as Locale)}</SectionTitle>
      <CategoryItemsList items={items} locationSlug={locationSlug} />
    </div>
  );
}
