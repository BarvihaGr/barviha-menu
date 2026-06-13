'use client';

import { motion } from 'framer-motion';
import { Home, Info, ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useCart } from '@/store/cart';
import { LocationInfoModal } from './LocationInfoModal';
import { cn } from '@/lib/utils';

/** Базовые классы пункта плашки — круглая кнопка-иконка (без подписи).
 *  Тап-зоны 48px — уверенно попадать пальцем, но плашка не громоздкая. */
const navItemBase =
  'relative flex h-12 w-12 items-center justify-center rounded-full transition cursor-pointer';
const navItemActive = 'bg-gold text-[#2A1B11] shadow-[0_4px_18px_rgba(196,146,98,0.45)]';
const navItemIdle = 'text-gold hover:bg-gold/10';

/** Один пункт плавающей навигации — только иконка (подпись в aria-label). */
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
    <Link href={href} aria-label={label} className={cn(navItemBase, active ? navItemActive : navItemIdle)}>
      {icon}
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            'absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-semibold',
            active ? 'bg-[#2A1B11] text-gold' : 'bg-gold text-[#2A1B11]',
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

interface Props {
  locationSlug: string;
  locationName: string;
  address: string | null;
  phone: string | null;
  /** Акцентный цвет локации — для полосы в модалке инфо. */
  accent: string;
}

/**
 * Нижняя плавающая навигация — «таблетка» по центру экрана, sticky при скролле.
 * Три кнопки ЧИСТО ЗНАЧКАМИ (без подписей): слева Information (адрес + телефон
 * во всплывающей модалке), по центру Домик (главная локации), справа Корзина.
 * Активный пункт — золотом.
 */
export function FloatingCartButton({ locationSlug, locationName, address, phone, accent }: Props) {
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
      <div className="flex items-center gap-6 rounded-full border border-gold/40 bg-[color:var(--card-elev)] px-6 py-1 shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
        {/* Слева — Information: адрес + телефон во всплывающей модалке */}
        <LocationInfoModal locationName={locationName} address={address} phone={phone} accent={accent}>
          <button type="button" className={cn(navItemBase, navItemIdle)} aria-label={t('info')}>
            <Info size={23} />
          </button>
        </LocationInfoModal>

        {/* Центр — Домик (главная локации) */}
        <NavItem href={homeHref} icon={<Home size={23} />} label={t('menu')} active={isHome} />

        {/* Справа — Корзина */}
        <NavItem href={cartHref} icon={<ShoppingBag size={23} />} label={t('cart')} active={isCart} badge={count} />
      </div>
    </motion.div>
  );
}
