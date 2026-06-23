'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import type { ResolvedMenuItem } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { pickItemName } from '@/lib/i18n-helpers';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { QtyControl } from '@/components/QtyControl';

interface Props {
  allItems: ResolvedMenuItem[];
  locationSlug: string;
}

export function CartView({ allItems, locationSlug }: Props) {
  const t = useTranslations('cart');
  const locale = useLocale() as Locale;
  const cart = useCart();

  const entries = cart.items
    .map((entry) => {
      const item = allItems.find((i) => i.id === entry.itemId);
      return item ? { entry, item } : null;
    })
    .filter((x): x is { entry: (typeof cart.items)[number]; item: ResolvedMenuItem } => x !== null);

  useEffect(() => {
    const validIds = new Set(allItems.map((i) => i.id));
    cart.items
      .filter((e) => !validIds.has(e.itemId))
      .forEach((e) => cart.remove(e.itemId));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = entries.reduce((sum, { entry, item }) => sum + entry.qty * item.price, 0);
  const totalCount = entries.reduce((sum, { entry }) => sum + entry.qty, 0);

  return (
    <div className="flex flex-col max-w-lg mx-auto min-h-[60vh]">

      {/* ── Заголовок ── */}
      <div className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-[family-name:var(--font-display)] text-cream tracking-wide">
          {t('title')}
        </h1>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={() => cart.clear()}
            className="text-sm text-muted/70 hover:text-red-400 transition cursor-pointer"
          >
            {t('clearAll')}
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        /* ── Пустая корзина ── */
        <div className="flex flex-col items-center gap-5 py-20 text-center">
          <span className="text-6xl text-gold-dark opacity-30">◇</span>
          <p className="text-sm text-muted max-w-sm">{t('empty')}</p>
          <Link
            href={`/${locationSlug}`}
            className="border border-gold text-gold px-6 py-3 text-xs uppercase tracking-[0.25em] hover:bg-gold hover:text-[#2A1B11] transition cursor-pointer"
          >
            {t('browse')}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4 flex-1">

          {/* ── Счётчик позиций ── */}
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
            {totalCount} {t('qty')}
          </p>

          {/* ── Список блюд ── */}
          <ul className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {entries.map(({ entry, item }) => {
                const name = pickItemName(item, locale);
                const lineTotal = item.price * entry.qty;
                return (
                  <motion.li
                    key={entry.itemId}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40, transition: { duration: 0.18 } }}
                    className="flex gap-3 rounded-2xl border border-[color:var(--border)] bg-card p-3"
                  >
                    {/* Фото */}
                    <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-xl border border-[color:var(--border)] bg-background">
                      {item.photo ? (
                        <Image
                          src={item.photo}
                          alt={name}
                          fill
                          sizes="76px"
                          className="object-cover"
                          style={{ filter: 'brightness(0.88) saturate(0.92)' }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl text-gold-dark opacity-30">
                          ◈
                        </div>
                      )}
                    </div>

                    {/* Контент */}
                    <div className="flex flex-1 min-w-0 flex-col justify-between py-0.5">
                      {/* Название */}
                      <p className="font-[family-name:var(--font-display)] text-sm text-cream leading-snug line-clamp-2">
                        {name}
                      </p>
                      {/* Нижняя строка: qty + цена */}
                      <div className="flex items-center justify-between mt-2">
                        <QtyControl itemId={entry.itemId} qty={entry.qty} compact />
                        <span className="text-sm font-medium text-gold tabular-nums">
                          {formatPrice(lineTotal)}
                        </span>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          {/* ── Итого + кнопка ── */}
          <div className="mt-2 flex flex-col gap-3 pb-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs uppercase tracking-[0.2em] text-muted">{t('subtotal')}</span>
              <span className="text-2xl text-gold font-medium tabular-nums">{formatPrice(total)}</span>
            </div>

            <button
              type="button"
              className="w-full rounded-2xl bg-gold py-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#2A1B11] shadow-[0_4px_20px_rgba(196,146,98,0.35)] transition hover:brightness-110 active:scale-[0.98] cursor-pointer"
            >
              {t('showWaiter')} · {formatPrice(total)}
            </button>

            <p className="text-center text-[10px] tracking-[0.15em] uppercase text-muted/60">
              {t('submitDescription')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
