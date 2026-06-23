'use client';

import Image from 'next/image';
import type { Location } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import { coffeeAccentStyle, getCoffeeAccent } from '@/lib/coffee-design';
import { HamburgerMenu } from '../HamburgerMenu';

interface Props {
  locationSlug: string;
  locations: Location[];
}

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
            className="hidden h-9 w-auto shrink-0 sm:block"
          />
          <Image
            src="/logo-since2017.png"
            alt="Barvikha Group Since 2017"
            width={427}
            height={57}
            priority
            className="h-[14px] w-auto sm:h-[20px]"
            style={{ filter: 'invert(var(--cm-logo-invert, 0))' }}
          />
        </Link>

        <HamburgerMenu
          locationSlug={locationSlug}
          locations={locations}
          variant="coffee"
          themeStyle={{ ['--cm-accent' as string]: getCoffeeAccent(locationSlug) }}
        />
      </div>
    </header>
  );
}
