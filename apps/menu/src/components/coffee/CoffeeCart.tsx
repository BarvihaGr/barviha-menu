'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { ResolvedMenuItem } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { pickItemName } from '@/lib/i18n-helpers';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { coffeeAccentStyle } from '@/lib/coffee-design';

interface Props {
  allItems: ResolvedMenuItem[];
  locationSlug: string;
}

/**
 * «Мой стол» (корзина) в светлом дизайне Coffeemania — для редизайн-локаций
 * (Бауманская). Полноширинный тёплый фон, белые карточки позиций со степпером
 * в чёрной пилюле, тёмная плашка итога. Полная параллель тёмной CartView.
 */
export function CoffeeCart({ allItems, locationSlug }: Props) {
  const t = useTranslations('cart');
  const locale = useLocale() as Locale;
  const cart = useCart();

  // Удаляем из store позиции, которых больше нет в меню этой локации.
  // Без этого badge (LuxBottomNav) показывает устаревший счётчик, а корзина — пустой экран.
  useEffect(() => {
    const validIds = new Set(allItems.map((i) => i.id));
    cart.items
      .filter((e) => !validIds.has(e.itemId))
      .forEach((e) => cart.remove(e.itemId));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entries = cart.items
    .map((entry) => {
      const item = allItems.find((i) => i.id === entry.itemId);
      return item ? { entry, item } : null;
    })
    .filter((x): x is { entry: (typeof cart.items)[number]; item: ResolvedMenuItem } => x !== null);

  const total = entries.reduce((sum, { entry, item }) => sum + entry.qty * item.price, 0);

  return (
    // Полноширинный светлый фон — выходим за пределы контейнера main.
    <div
      className="relative left-1/2 right-1/2 -mx-[50vw] w-screen -mt-2 min-h-screen bg-[var(--cm-bg)] text-[var(--cm-text)]"
      style={coffeeAccentStyle(locationSlug)}
    >
      <div className="mx-auto w-full max-w-[760px] px-4 pb-32 pt-8 sm:px-6 lg:pt-12">
        <h1 className="mb-7 text-center font-[family-name:var(--font-sans)] text-[26px] font-bold leading-tight tracking-[-0.01em] text-[var(--cm-text)] sm:text-[32px]">
          {t('title')}
        </h1>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-5 py-16 text-center">
            <span className="text-6xl text-[#d8d6d0]">◇</span>
            <p className="max-w-sm text-[15px] text-[var(--cm-muted-dim)]">{t('empty')}</p>
            <Link
              href={`/${locationSlug}`}
              className="rounded-full bg-[var(--cm-accent)] px-6 py-3.5 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-90 cursor-pointer"
            >
              {t('browse')}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {entries.map(({ entry, item }) => {
                  const name = pickItemName(item, locale);
                  return (
                    <motion.li
                      key={entry.itemId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="flex items-center gap-4 rounded-2xl border border-[var(--cm-border)] bg-[var(--cm-surface-2)] p-3 shadow-[0_1px_8px_rgba(0,0,0,0.03)] sm:p-4"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--cm-surface)]">
                        {item.photo ? (
                          <Image
                            src={item.photo}
                            alt={name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl text-[#d8d6d0]">
                            ◍
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[15px] font-semibold text-[var(--cm-text)]">{name}</div>
                        <div className="mt-0.5 text-[14px] text-[var(--cm-accent-on-bg,var(--cm-accent))]">{formatPrice(item.price)}</div>
                      </div>
                      <CoffeeQty itemId={entry.itemId} qty={entry.qty} />
                      <button
                        type="button"
                        onClick={() => cart.remove(entry.itemId)}
                        aria-label={t('remove')}
                        className="text-[#bdbdbd] transition hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>

            <div className="mt-6 flex flex-col gap-4 border-t border-[var(--cm-border)] pt-6">
              <div className="flex items-center justify-between">
                <span className="text-[12px] uppercase tracking-[0.2em] text-[var(--cm-muted-dim)]">
                  {t('subtotal')}
                </span>
                <span className="text-[28px] font-semibold text-[var(--cm-text)]">{formatPrice(total)}</span>
              </div>
              <p className="text-center text-[11px] uppercase leading-relaxed tracking-[0.15em] text-[var(--cm-muted-dim)]">
                {t('submitDescription')}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** Светлый степпер количества в чёрной пилюле (стиль Coffeemania). */
function CoffeeQty({ itemId, qty }: { itemId: string; qty: number }) {
  const setQty = useCart((s) => s.setQty);
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
        onClick={() => setQty(itemId, qty + 1)}
        aria-label="+"
        className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/15 cursor-pointer"
      >
        <Plus size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
