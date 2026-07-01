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
      <div className="mx-auto grid max-w-[1200px] items-center grid-cols-[1fr_auto_1fr] px-4 sm:px-6 py-3">
        <div />

        <Link href={homeHref} className="flex flex-col items-center text-center cursor-pointer" aria-label="Barvikha Group">
          <span
            style={{
              fontFamily: "'Cormorant SC', 'Cormorant Garamond', serif",
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: '0.18em',
              color: 'var(--foreground)',
              lineHeight: 1.2,
            }}
          >
            BARVIKHA GROUP
          </span>
          <span
            style={{
              fontSize: 9,
              letterSpacing: '0.26em',
              color: 'var(--muted)',
              marginTop: 3,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            — SINCE 2017 —
          </span>
        </Link>

        <div className="flex justify-end">
          <HamburgerMenu locationSlug={locationSlug} locations={locations} variant="dark" />
        </div>
      </div>
    </header>
  );
}
