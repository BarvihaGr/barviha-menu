'use client';

import type { Location } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import { LangSwitch } from '../LangSwitch';
import { LocationSwitcher } from '../LocationSwitcher';

interface Props {
  locationSlug: string;
  locations: Location[];
}

/**
 * Белая шапка в стиле Coffeemania (только для редизайн-локаций): тёмный
 * wordmark-лого слева, справа — выбор локации и языка. Лёгкая нижняя граница,
 * sticky. Фирменная палитра gold у контролов читается и на белом. Корзина
 * живёт в нижней плавающей плашке (FloatingCartButton).
 */
export function CoffeeHeader({ locationSlug, locations }: Props) {
  const homeHref = `/${locationSlug}`;

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
        </div>
      </div>
    </header>
  );
}
