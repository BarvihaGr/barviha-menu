'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import type { ResolvedMenuItem } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { pickItemName } from '@/lib/i18n-helpers';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { QtyControl } from '@/components/QtyControl';
import { SectionTitle } from '@/components/SectionTitle';

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
    .filter((x): x is { entry: typeof cart.items[number]; item: ResolvedMenuItem } => x !== null);

  useEffect(() => {
    const validIds = new Set(allItems.map((i) => i.id));
    cart.items
      .filter((e) => !validIds.has(e.itemId))
      .forEach((e) => cart.remove(e.itemId));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = entries.reduce((sum, { entry, item }) => sum + entry.qty * item.price, 0);

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <SectionTitle>{t('title')}</SectionTitle>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-16 text-center">
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
                    className="flex items-center gap-4 border border-[color:var(--border)] bg-card p-3 sm:p-4 rounded-sm"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm border border-[color:var(--border)] bg-background">
                      {item.photo ? (
                        <Image
                          src={item.photo}
                          alt={name}
                          fill
                          sizes="64px"
                          className="object-cover"
                          style={{ filter: 'brightness(0.85) saturate(0.9)' }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl text-gold-dark opacity-40">
                          ◈
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-[family-name:var(--font-display)] text-sm text-cream truncate">{name}</div>
                      <div className="text-sm text-gold">{formatPrice(item.price)}</div>
                    </div>
                    <QtyControl itemId={entry.itemId} qty={entry.qty} />
                    <button
                      type="button"
                      onClick={() => cart.remove(entry.itemId)}
                      aria-label={t('remove')}
                      className="text-muted hover:text-red-400 transition cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <div className="border-t border-gold pt-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.2em] text-muted">{t('subtotal')}</span>
              <span className="text-2xl text-gold font-medium">{formatPrice(total)}</span>
            </div>
            <p className="text-center text-[11px] tracking-[0.15em] uppercase text-muted leading-relaxed">
              {t('submitDescription')}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
