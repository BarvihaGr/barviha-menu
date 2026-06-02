import { getClient } from '@barviha/db';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Locale } from '@/i18n/routing';
import { pickItemComposition, pickItemDescription, pickItemName } from '@/lib/i18n-helpers';
import { formatPrice, parseIngredients } from '@/lib/utils';
import { Badge } from '@/components/Badge';
import { AddToCartButton } from '@/components/AddToCartButton';
import { RelatedItemsRail, type RelatedItem } from '@/components/RelatedItemsRail';
import { ExpandableText } from '@/components/ExpandableText';
import { ItemPhotoViewer } from '@/components/ItemPhotoViewer';

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ locale: string; locationSlug: string; itemId: string }>;
}) {
  const { locale, locationSlug, itemId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('item');

  const db = getClient();
  const item = await db.getMenuItemById(itemId, locationSlug);
  if (!item) notFound();

  const name = pickItemName(item, locale as Locale);
  const description = pickItemDescription(item, locale as Locale);
  const composition = pickItemComposition(item, locale as Locale);
  const ingredients = parseIngredients(composition);

  // Соседи по категории — для боковой ленты «из этой же категории».
  const loc = await db.getLocationBySlug(locationSlug);
  const related: RelatedItem[] = loc
    ? (await db.getMenuItemsForLocation(loc.id))
        .filter((x) => x.id !== item.id && x.category_id === item.category_id && x.is_available)
        .slice(0, 16)
        .map((x) => ({ id: x.id, name: pickItemName(x, locale as Locale), photo: x.photo }))
    : [];

  return (
    <div className="mx-auto flex max-w-4xl gap-3 sm:gap-5">
      <article className="min-w-0 flex-1 overflow-hidden rounded-3xl border border-[color:var(--border)] bg-card">
        <div className="px-3 pt-3 sm:px-4 sm:pt-4">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br from-[#453324] to-[#2A1B11]">
            {item.photo ? (
              <ItemPhotoViewer src={item.photo} alt={name} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-7xl text-gold-dark opacity-30">
                ◈
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
            {item.labels.length > 0 && (
              <div className="absolute left-4 top-4 flex flex-col gap-1.5 z-10">
                {item.labels.map((l) => (
                  <Badge key={l} label={l} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <div>
            <h1 className="text-2xl sm:text-3xl uppercase tracking-[0.1em] font-light text-white">
              {name}
            </h1>
            {item.weight && (
              <div className="mt-2 text-[10px] uppercase tracking-[0.25em] text-gold">
                {item.weight}
              </div>
            )}
          </div>

          {description && (
            <ExpandableText text={description} className="text-sm leading-relaxed text-beige" />
          )}

          {ingredients.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold border-b border-[color:var(--border)] pb-2 mb-4">
                {t('composition')}
              </div>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-background/60 px-3.5 py-2 text-xs"
                  >
                    <span className="text-white/90">{ing.name}</span>
                    {ing.amount && (
                      <span className="text-gold/80 text-[11px] before:content-['·'] before:mr-1.5 before:text-gold/40">
                        {ing.amount}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.nutrition && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold border-b border-[color:var(--border)] pb-2 mb-3">
                {t('nutrition')}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(
                  [
                    ['kcal', item.nutrition.kcal],
                    ['protein', item.nutrition.protein],
                    ['fat', item.nutrition.fat],
                    ['carbs', item.nutrition.carbs],
                  ] as const
                ).map(([key, val]) => (
                  <div
                    key={key}
                    className="rounded-sm border border-[color:var(--border)] bg-background py-3 text-center"
                  >
                    <span className="block text-lg font-medium text-gold">{val}</span>
                    <span className="mt-1 block text-[9px] uppercase tracking-[0.2em] text-muted">
                      {t(key)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 border-t border-[color:var(--border)] pt-5">
            <div className="text-2xl sm:text-3xl text-gold font-medium">{formatPrice(item.price)}</div>
            <AddToCartButton itemId={item.id} itemName={name} />
          </div>
        </div>
      </article>

      <RelatedItemsRail items={related} locationSlug={locationSlug} />
    </div>
  );
}
