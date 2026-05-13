import { getClient } from '@barviha/db';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { pickItemComposition, pickItemDescription, pickItemName } from '@/lib/i18n-helpers';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/Badge';
import { AddToCartButton } from '@/components/AddToCartButton';

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ locale: string; locationSlug: string; itemId: string }>;
}) {
  const { locale, locationSlug, itemId } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('item');
  const tCommon = await getTranslations('common');

  const db = getClient();
  const item = await db.getMenuItemById(itemId);
  if (!item) notFound();

  const name = pickItemName(item, locale as Locale);
  const description = pickItemDescription(item, locale as Locale);
  const composition = pickItemComposition(item, locale as Locale);
  const ingredients = composition ? composition.split(',').map((s) => s.trim()).filter(Boolean) : [];

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <Link
        href={`/${locationSlug}`}
        className="inline-flex items-center gap-1 self-start text-[10px] uppercase tracking-[0.25em] text-muted hover:text-gold cursor-pointer"
      >
        <ChevronLeft size={14} />
        {tCommon('back')}
      </Link>

      <div className="overflow-hidden rounded-sm border border-[color:var(--border)] bg-card">
        <div className="relative aspect-[16/10] flex items-center justify-center bg-gradient-to-br from-[#222] to-[#0c0c0c]">
          {item.labels.length > 0 && (
            <div className="absolute left-4 top-4 flex flex-col gap-1.5 z-10">
              {item.labels.map((l) => (
                <Badge key={l} label={l} />
              ))}
            </div>
          )}
          <span className="text-7xl text-gold-dark opacity-30">◈</span>
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

          {description && <p className="text-sm leading-relaxed text-[#ccc]">{description}</p>}

          {ingredients.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold border-b border-[color:var(--border)] pb-2 mb-3">
                {t('composition')}
              </div>
              <ul className="flex flex-col gap-0">
                {ingredients.map((ing, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 py-2 text-sm text-[#ccc] border-b border-[rgba(201,169,97,0.08)] last:border-b-0"
                  >
                    <span className="text-gold text-[8px]">◆</span>
                    {ing}
                  </li>
                ))}
              </ul>
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

          <div className="flex items-center gap-4 border-t border-[color:var(--border)] pt-5">
            <div className="text-2xl sm:text-3xl text-gold font-medium">{formatPrice(item.price)}</div>
            <AddToCartButton itemId={item.id} itemName={name} variant="full" />
          </div>
        </div>
      </div>
    </div>
  );
}
