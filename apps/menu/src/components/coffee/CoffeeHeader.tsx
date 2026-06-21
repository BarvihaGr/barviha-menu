'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Location } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import { useCart } from '@/store/cart';
import { LangSwitch } from '../LangSwitch';
import { LocationSwitcher } from '../LocationSwitcher';

interface Props {
  locationSlug: string;
  locations: Location[];
}

/**
 * Белая шапка в стиле Coffeemania (только для редизайн-локаций): тёмный
 * wordmark-лого слева, справа — выбор локации и языка. Лёгкая нижняя граница,
 * sticky. Фирменная палитра gold у контролов читается и на белом.
 */
export function CoffeeHeader({ locationSlug, locations }: Props) {
  const homeHref = `/${locationSlug}`;
  const cartHref = `/${locationSlug}/cart`;
  const t = useTranslations('nav');
  const rawCount = useCart((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  // Корзина приезжает из localStorage только на клиенте — до маунта показываем 0,
  // чтобы не ловить hydration mismatch на бейдже.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? rawCount : 0;

  return (
    <header className="sticky top-0 z-30 border-b border-[#ececec] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Link
          href={homeHref}
          className="font-[family-name:var(--font-display)] text-[15px] font-semibold uppercase tracking-[0.22em] text-[#1a1a1a] sm:text-[17px] cursor-pointer"
          aria-label="BARVIKHA GROUP"
        >
          BARVIKHA<span className="text-[#c49262]"> GROUP</span>
        </Link>

        <div className="flex items-center gap-2">
          <LocationSwitcher locations={locations} currentSlug={locationSlug} />
          <LangSwitch />
          <Link
            href={cartHref}
            aria-label={t('cart')}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#1a1a1a] transition-colors hover:bg-[#f1f1ef] cursor-pointer"
          >
            <ShoppingBag size={19} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[17px] items-center justify-center rounded-full bg-[#c49262] px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
