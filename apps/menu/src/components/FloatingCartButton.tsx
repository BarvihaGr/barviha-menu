'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCart } from '@/store/cart';

export function FloatingCartButton({ locationSlug }: { locationSlug: string }) {
  const count = useCart((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const t = useTranslations('nav');

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          className="fixed bottom-6 right-5 z-40"
        >
          <Link
            href={`/${locationSlug}/cart`}
            className="flex items-center gap-3 rounded-full bg-gold text-[#3F1904] px-5 py-4 text-xs uppercase tracking-[0.2em] font-semibold shadow-[0_10px_30px_rgba(218,193,120,0.4)] hover:bg-gold-light transition cursor-pointer"
          >
            <ShoppingBag size={16} />
            <span>{t('cart')}</span>
            <span className="bg-black text-gold rounded-full px-2.5 py-0.5 text-xs min-w-[24px] text-center">
              {count}
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
