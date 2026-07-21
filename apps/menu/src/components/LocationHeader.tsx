'use client';

import type { Location } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import { HamburgerMenu } from './HamburgerMenu';

interface Props {
  locationSlug: string;
  locations: Location[];
}

export function LocationHeader({ locationSlug, locations }: Props) {
  const homeHref = `/${locationSlug}`;

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div
        className="mx-auto flex max-w-[1200px] items-center justify-between px-4 pb-3.5 sm:px-6"
        style={{ paddingTop: 'calc(0.875rem + env(safe-area-inset-top, 0px))' }}
      >

        <Link href={homeHref} className="flex flex-col cursor-pointer" aria-label="Barvikha Group">
          <span
            style={{
              fontFamily: "'Cormorant SC', 'Cormorant Garamond', serif",
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '0.14em',
              color: 'var(--foreground)',
              lineHeight: 1.15,
            }}
          >
            BARVIKHA GROUP
          </span>
          <span
            style={{
              fontSize: 9,
              letterSpacing: '0.28em',
              color: 'var(--muted)',
              marginTop: 2,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            SINCE 2017
          </span>
        </Link>

        <HamburgerMenu locationSlug={locationSlug} locations={locations} variant="dark" />
      </div>
    </header>
  );
}
