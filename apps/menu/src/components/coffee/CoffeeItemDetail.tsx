'use client';

import { useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ItemLabel, ResolvedMenuItem } from '@barviha/db';
import { Link, useRouter } from '@/i18n/navigation';
import { formatPrice, cn, capitalizeRu } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { useToast } from '@/store/toast';
import type { RelatedItem } from '@/components/RelatedItemsRail';
import { trackAdd } from '@/lib/stats';
import { PhotoGallery } from '@/components/PhotoGallery';

interface Ingredient {
  name: string;
  amount?: string | null;
}

interface Props {
  item: ResolvedMenuItem;
  name: string;
  description: string | null;
  ingredients: Ingredient[];
  related: RelatedItem[];
  locationSlug: string;
}

/**
 * Карточка товара в светлом дизайне Coffeemania (для редизайн-локации
 * Бауманская). Крупное фото на тёплом сером фоне, чистая типографика, состав и
 * КБЖУ светлыми чипами, тёмная кнопка «Добавить» со степпером. Справа — узкая
 * лента кружков «из этой же категории». Полная параллель тёмной детальной.
 */
export function CoffeeItemDetail({
  item,
  name,
  description,
  ingredients,
  locationSlug,
}: Props) {
  const t = useTranslations('item');

  return (
    <div className="mx-auto w-full max-w-[680px]">
      <article className="min-w-0 overflow-hidden rounded-3xl border border-[var(--cm-border)] bg-[var(--cm-surface-2)]">
        <div className="px-3 pt-3 sm:px-4 sm:pt-4">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[var(--cm-surface)]">
            <PhotoGallery photos={item.photos} alt={name} />
            <CoffeeCloseButton fallbackHref={`/${locationSlug}`} />
            {item.labels.length > 0 && (
              <div className="absolute left-3 top-14 z-10 flex flex-col gap-1.5">
                {item.labels.map((l) => (
                  <LabelChip key={l} label={l} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 p-5 sm:p-8">
          <div>
            <h1 className="font-[family-name:var(--font-sans)] text-[24px] font-bold leading-tight tracking-[-0.01em] text-[var(--cm-text)] sm:text-[32px]">
              {capitalizeRu(name)}
            </h1>
            {item.weight && (
              <div className="mt-2 text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--cm-accent)]">
                {item.weight} {t('grams')}
              </div>
            )}
          </div>

          {description && (
            <CoffeeExpandableText
              text={description}
              moreLabel={t('more')}
              lessLabel={t('less')}
              className="text-[15px] leading-relaxed text-[#5c5c5c]"
            />
          )}

          {ingredients.length > 0 && (
            <div>
              <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-[var(--cm-muted-dim)]">
                {t('composition')}
              </div>
              <p className="text-[13px] leading-relaxed text-[var(--cm-muted)]">
                {ingredients.map((ing, idx) => (
                  <span key={idx}>
                    {ing.name}
                    {idx < ingredients.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </p>
            </div>
          )}

          {item.nutrition && (
            <div>
              <div className="mb-3 border-b border-[var(--cm-border)] pb-2 text-[11px] uppercase tracking-[0.22em] text-[var(--cm-muted-dim)]">
                {t('nutrition')}
              </div>
              <div className="flex items-stretch overflow-hidden rounded-xl border border-[var(--cm-border)] bg-[var(--cm-bg)]">
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
                    className={cn('flex-1 py-3 text-center', i > 0 && 'border-l border-[var(--cm-border)]')}
                  >
                    <span className="block text-lg font-semibold text-[var(--cm-text)]">{val}</span>
                    <span className="mt-1 block whitespace-nowrap text-[9px] uppercase tracking-[0.12em] text-[var(--cm-muted-dim)]">
                      {t(key)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 border-t border-[var(--cm-border)] pt-5">
            <div className="text-[26px] font-semibold text-[var(--cm-text)] sm:text-[30px]">
              {formatPrice(item.price)}
            </div>
            <CoffeeAddButton
              itemId={item.id}
              itemName={name}
              locationSlug={locationSlug}
              addLabel={t('addToCart')}
            />
          </div>
        </div>
      </article>
    </div>
  );
}

/** Светлый ярлык (хит/новинка/острое…) поверх фото. */
function LabelChip({ label }: { label: ItemLabel }) {
  const t = useTranslations('labels');
  return (
    <span className="rounded-full bg-[var(--cm-surface-2)]/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--cm-text)] shadow-[0_1px_6px_rgba(0,0,0,0.08)] backdrop-blur">
      {t(label)}
    </span>
  );
}

/** Крестик закрытия — назад в историю, иначе на главную локации. */
function CoffeeCloseButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Закрыть"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
      className="absolute left-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--cm-surface-2)]/90 text-[var(--cm-text)] shadow-[0_1px_8px_rgba(0,0,0,0.1)] backdrop-blur transition hover:bg-[var(--cm-surface-2)] cursor-pointer"
    >
      <X size={16} />
    </button>
  );
}

/** Описание — только первое предложение, без кнопок. Кратко и по факту. */
function CoffeeExpandableText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
  moreLabel?: string;
  lessLabel?: string;
  threshold?: number;
}) {
  const first = text.match(/^.+?[.!?…](\s|$)/)?.[0]?.trim() ?? text;
  return <p className={className}>{first}</p>;
}

/** Тёмная кнопка «Добавить» со степпером (стиль чёрных пилюль Coffeemania). */
function CoffeeAddButton({
  itemId,
  itemName,
  locationSlug,
  addLabel,
}: {
  itemId: string;
  itemName: string;
  locationSlug: string;
  addLabel: string;
}) {
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  const qty = useCart((s) => s.items.find((i) => i.itemId === itemId)?.qty ?? 0);
  const push = useToast((s) => s.push);
  const t = useTranslations();

  const firstAdd = () => {
    add(itemId, 1);
    trackAdd(locationSlug, itemId);
    push(t('toast.addedToCart'), 'success');
  };

  if (qty > 0) {
    return (
      <div className="inline-flex items-center gap-1 rounded-full bg-[var(--cm-accent)] px-1.5 py-1.5 text-white">
        <button
          type="button"
          onClick={() => setQty(itemId, qty - 1)}
          aria-label="−"
          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/15 cursor-pointer"
        >
          <Minus size={16} strokeWidth={2.5} />
        </button>
        <span className="min-w-[24px] text-center text-[15px] font-semibold tabular-nums">{qty}</span>
        <button
          type="button"
          onClick={() => add(itemId, 1)}
          aria-label="+"
          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/15 cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={firstAdd}
      aria-label={`${addLabel} ${itemName}`}
      className="inline-flex items-center gap-2 rounded-full bg-[var(--cm-accent)] px-6 py-3.5 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90 cursor-pointer"
    >
      <Plus size={18} strokeWidth={2.4} />
      {addLabel}
    </button>
  );
}

