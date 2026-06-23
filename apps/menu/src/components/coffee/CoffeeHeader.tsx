'use client';

import Image from 'next/image';
import type { Location } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import { coffeeAccentStyle } from '@/lib/coffee-design';
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
    <header
      className="sticky top-0 z-30 border-b border-[var(--cm-border)] bg-[var(--cm-surface-2)]/90 backdrop-blur-md"
      style={coffeeAccentStyle(locationSlug)}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-2 px-4 py-3.5 sm:gap-3 sm:px-6">
        <Link
          href={homeHref}
          className="flex min-w-0 items-center gap-2.5 cursor-pointer"
          aria-label="Barvikha Group"
        >
          <Image
            src="/locations/arka/logo-tree.png"
            alt="Барвиха"
            width={150}
            height={93}
            priority
            className="h-8 w-auto shrink-0 sm:h-9"
          />
          <Image
            src="/logo-since2017.png"
            alt="Barvikha Group Since 2017"
            width={427}
            height={57}
            priority
            className="h-[16px] w-auto sm:h-[21px]"
            style={{ filter: 'invert(var(--cm-logo-invert, 0))' }}
          />
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <LocationSwitcher locations={locations} currentSlug={locationSlug} />
          <LangSwitch />
        </div>
      </div>
    </header>
  );
}
