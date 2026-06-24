'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Info, ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useCart } from '@/store/cart';
import type { Location } from '@barviha/db';
import { LocationInfoModal } from './LocationInfoModal';
import { cn } from '@/lib/utils';
import { isCoffeeDesign, coffeeAccentStyle } from '@/lib/coffee-design';

/** Базовые классы пункта плашки — круглая кнопка-иконка (без подписи).
 *  Тап-зоны 48px — уверенно попадать пальцем, но плашка не громоздкая.
 *  Цвет берётся из CSS-переменной --dock-accent (золото по умолчанию,
 *  фирменный цвет локации для светлого дизайна Coffeemania). */
const navItemBase =
  'relative flex h-12 w-12 items-center justify-center rounded-full transition cursor-pointer';
const navItemActive =
  'bg-[color:var(--dock-accent)] text-[#2A1B11] shadow-[0_4px_18px_rgba(0,0,0,0.35)]';
const navItemIdle = 'text-[color:var(--dock-accent)] hover:bg-[color:var(--dock-accent)]/10';

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
            active
              ? 'bg-[#2A1B11] text-[color:var(--dock-accent)]'
              : 'bg-[color:var(--dock-accent)] text-[#2A1B11]',
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
  /** Все локации для переключения внутри модалки инфо. */
  locations?: Location[];
  /** Цвет иконок/активного пункта плашки. По умолчанию — фирменное золото;
   *  для светлого дизайна Coffeemania прокидываем акцент локации. */
  dockAccent?: string;
}

/**
 * Нижняя плавающая навигация — «таблетка» по центру экрана, sticky при скролле.
 * Три кнопки ЧИСТО ЗНАЧКАМИ (без подписей): слева Information (адрес + телефон
 * во всплывающей модалке), по центру Домик (главная локации), справа Корзина.
 * Активный пункт — акцентным цветом (--dock-accent).
 */
export function FloatingCartButton({ locationSlug, locationName, address, phone, accent, locations, dockAccent }: Props) {
  const rawCount = useCart((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? rawCount : 0;
  const t = useTranslations('nav');
  const pathname = usePathname();

  const coffee = isCoffeeDesign(locationSlug);
  const modalTheme = coffee ? coffeeAccentStyle(locationSlug) : undefined;
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
      <div
        className="flex items-center gap-6 rounded-full border border-[color:var(--dock-accent)]/40 bg-[color:var(--card-elev)] px-6 py-1 shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
        style={{ ['--dock-accent' as string]: dockAccent ?? 'var(--gold)' }}
      >
        {/* Слева — Information: адрес + телефон во всплывающей модалке */}
        <LocationInfoModal
          locationName={locationName}
          address={address}
          phone={phone}
          accent={accent}
          locations={locations}
          currentSlug={locationSlug}
          light={coffee}
          themeStyle={modalTheme}
        >
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
