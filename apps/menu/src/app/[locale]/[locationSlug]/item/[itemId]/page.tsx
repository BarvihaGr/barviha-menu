import { getClient, usesArkaBarTemplate, recordView } from '@barviha/db';
import { STATS_ENABLED } from '@/lib/stats';
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
import { ItemCloseButton } from '@/components/ItemCloseButton';
import { CoffeeItemDetail } from '@/components/coffee/CoffeeItemDetail';
import { isCoffeeDesign, coffeeAccentStyle } from '@/lib/coffee-design';
import { toResolvedArkaBarItems } from '@/lib/arka-bar-loader';
import { decodeRouteParam } from '@/lib/decode-param';

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ locale: string; locationSlug: string; itemId: string }>;
}) {
  const { locale, locationSlug, itemId: rawItemId } = await params;
  const itemId = decodeRouteParam(rawItemId);
  setRequestLocale(locale);
  const t = await getTranslations('item');

  // Позиции Бара (шаблон «Арка», см. arka-bar-loader) не заведены как
  // обычные ResolvedMenuItem в content-store — подставляем их напрямую по
  // id, не трогая обычный путь через getMenuItemById.
  const arkaBarItem = usesArkaBarTemplate(locationSlug)
    ? toResolvedArkaBarItems(locationSlug).find((i) => i.id === itemId)
    : undefined;

  const db = getClient();
  const item = arkaBarItem ?? (await db.getMenuItemById(itemId, locationSlug));
  if (!item) notFound();
  // Заготовка счётчика просмотров (см. lib/stats.ts) — пока STATS_ENABLED
  // false, ничего не пишет.
  if (STATS_ENABLED) recordView(locationSlug, item.id);

  const name = pickItemName(item, locale as Locale);
  const description = pickItemDescription(item, locale as Locale);
  const composition = pickItemComposition(item, locale as Locale);
  const ingredients = parseIngredients(composition);

  // Соседи по категории — для боковой ленты «из этой же категории».
  // У тестовых позиций Арки категории нет (не заведены в БД) — лента пустая.
  const loc = arkaBarItem ? null : await db.getLocationBySlug(locationSlug);
  const related: RelatedItem[] = loc
    ? (await db.getMenuItemsForLocation(loc.id))
        .filter((x) => x.id !== item.id && x.category_id === item.category_id && x.is_available)
        .slice(0, 16)
        .map((x) => ({ id: x.id, name: pickItemName(x, locale as Locale), photo: x.photo }))
    : [];

  // Светлый дизайн Coffeemania — детальная карточка в той же эстетике, что
  // главная/меню редизайн-локации (Бауманская). Полноширинный светлый фон.
  if (isCoffeeDesign(locationSlug)) {
    return (
      <div
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen -mt-2 min-h-screen bg-[var(--cm-bg)] text-[var(--cm-text)]"
        style={coffeeAccentStyle(locationSlug)}
      >
        <div className="mx-auto w-full max-w-[1200px] px-4 pb-32 pt-6 sm:px-6 lg:pt-10">
          <CoffeeItemDetail
            item={item}
            name={name}
            description={description}
            ingredients={ingredients}
            related={related}
            locationSlug={locationSlug}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl gap-3 sm:gap-5">
      <article className="min-w-0 flex-1 overflow-hidden rounded-3xl border border-[color:var(--border)] bg-card">
        <div className="px-3 pt-3 sm:px-4 sm:pt-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-[#453324] to-[#2A1B11]">
            {item.photo ? (
              <ItemPhotoViewer src={item.photo} alt={name} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-7xl text-gold-dark opacity-30">
                ◈
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
            <ItemCloseButton fallbackHref={`/${locationSlug}`} />
            {item.labels.length > 0 && (
              <div className="absolute left-4 top-16 flex flex-col gap-1.5 z-10">
                {item.labels.map((l) => (
                  <Badge key={l} label={l} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-light tracking-[0.03em] text-cream leading-tight">
              {name}
            </h1>
            {item.weight && (
              <div className="mt-2 text-[10px] uppercase tracking-[0.25em] text-gold">
                {item.weight} {t('grams')}
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
              <div className="flex items-stretch overflow-hidden rounded-sm border border-[color:var(--border)] bg-background">
                {(
                  [
                    ['kcal', item.nutrition.kcal],
                    ['protein', item.nutrition.protein],
                    ['fat', item.nutrition.fat],
                    ['carbs', item.nutrition.carbs],
                  ] as const
                ).map(([key, val], i) => (
                  <div
                    key={key}
                    className={`flex-1 py-3 text-center ${i > 0 ? 'border-l border-[color:var(--border)]' : ''}`}
                  >
                    <span className="block text-lg font-medium text-gold">{val}</span>
                    <span className="mt-1 block whitespace-nowrap text-[8px] uppercase tracking-[0.12em] text-muted">
                      {t(key)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 border-t border-[color:var(--border)] pt-5">
            <div className="text-2xl sm:text-3xl text-gold font-medium">{formatPrice(item.price)}</div>
            <AddToCartButton itemId={item.id} itemName={name} locationSlug={locationSlug} />
          </div>
        </div>
      </article>

      <RelatedItemsRail items={related} locationSlug={locationSlug} />
    </div>
  );
}
