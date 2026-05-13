'use client';

import { ChevronLeft, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import type { ResolvedMenuItem } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { pickItemName } from '@/lib/i18n-helpers';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { useToast } from '@/store/toast';
import { QtyControl } from '@/components/QtyControl';
import { SectionTitle } from '@/components/SectionTitle';
import { CallWaiterButton } from '@/components/CallWaiterButton';

interface Props {
  allItems: ResolvedMenuItem[];
  locationSlug: string;
}

export function CartView({ allItems, locationSlug }: Props) {
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');
  const tToast = useTranslations('toast');
  const locale = useLocale() as Locale;
  const cart = useCart();
  const push = useToast((s) => s.push);

  const entries = cart.items
    .map((entry) => {
      const item = allItems.find((i) => i.id === entry.itemId);
      return item ? { entry, item } : null;
    })
    .filter((x): x is { entry: typeof cart.items[number]; item: ResolvedMenuItem } => x !== null);

  const total = entries.reduce((sum, { entry, item }) => sum + entry.qty * item.price, 0);

  const onSubmit = () => {
    if (entries.length === 0) return;
    push(tToast('orderSubmitted'), 'success');
    setTimeout(() => cart.clear(), 600);
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <Link
        href={`/${locationSlug}`}
        className="inline-flex items-center gap-1 self-start text-[10px] uppercase tracking-[0.25em] text-muted hover:text-gold cursor-pointer"
      >
        <ChevronLeft size={14} />
        {tCommon('back')}
      </Link>

      <SectionTitle>{t('title')}</SectionTitle>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-16 text-center">
          <span className="text-6xl text-gold-dark opacity-30">◇</span>
          <p className="text-sm text-muted max-w-sm">{t('empty')}</p>
          <Link
            href={`/${locationSlug}`}
            className="border border-gold text-gold px-6 py-3 text-xs uppercase tracking-[0.25em] hover:bg-gold hover:text-black transition cursor-pointer"
          >
            {t('browse')}
          </Link>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {entries.map(({ entry, item }) => (
                <motion.li
                  key={entry.itemId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="flex items-center gap-4 border border-[color:var(--border)] bg-card p-4 rounded-sm"
                >
                  <div className="h-16 w-16 shrink-0 rounded-sm border border-[color:var(--border)] bg-background flex items-center justify-center text-2xl text-gold-dark opacity-40">
                    ◈
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">
                      {pickItemName(item, locale)}
                    </div>
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
              ))}
            </AnimatePresence>
          </ul>

          <div className="border-t border-gold pt-5 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.2em] text-muted">{t('subtotal')}</span>
              <span className="text-2xl text-gold font-medium">{formatPrice(total)}</span>
            </div>
            <p className="text-[11px] text-muted text-center leading-relaxed">
              {t('submitDescription')}
            </p>
            <button
              type="button"
              onClick={onSubmit}
              className="w-full bg-gold text-black py-5 text-xs uppercase tracking-[0.3em] font-semibold hover:bg-gold-light transition cursor-pointer"
            >
              {t('submit')}
            </button>
            <CallWaiterButton variant="large" />
          </div>
        </>
      )}
    </div>
  );
}
