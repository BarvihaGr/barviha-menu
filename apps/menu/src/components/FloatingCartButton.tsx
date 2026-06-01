'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, UtensilsCrossed } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useCart } from '@/store/cart';
import { cn } from '@/lib/utils';

/** Один пункт плавающей навигации. Вынесен наружу, чтобы не пересоздаваться
 *  при каждой перерисовке родителя. */
function NavItem({
  href,
  icon,
  label,
  active,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'relative flex items-center gap-2 rounded-full px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] font-medium transition cursor-pointer',
        active
          ? 'bg-gold text-[#2A1B11] shadow-[0_4px_18px_rgba(196,146,98,0.45)]'
          : 'text-gold hover:bg-gold/10',
      )}
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            'ml-0.5 inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold',
            active ? 'bg-[#2A1B11] text-gold' : 'bg-gold text-[#2A1B11]',
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

/**
 * Нижняя плавающая навигация — «таблетка» по центру экрана,
 * sticky при скролле. Перекидывает между главной локации (меню)
 * и корзиной. Активный пункт подсвечен золотом.
 */
export function FloatingCartButton({ locationSlug }: { locationSlug: string }) {
  const count = useCart((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const t = useTranslations('nav');
  const pathname = usePathname();

  const homeHref = `/${locationSlug}`;
  const cartHref = `/${locationSlug}/cart`;
  const isCart = pathname.startsWith(cartHref);
  const isHome = !isCart;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed left-1/2 bottom-5 z-40 -translate-x-1/2"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center gap-1 rounded-full border border-gold/40 bg-[color:var(--card-elev)] p-1 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
        <NavItem
          href={homeHref}
          icon={<UtensilsCrossed size={15} />}
          label={t('menu')}
          active={isHome}
        />
        <NavItem
          href={cartHref}
          icon={<ShoppingBag size={15} />}
          label={t('cart')}
          active={isCart}
          badge={count}
        />
      </div>
    </motion.div>
  );
}
