'use client';

import Image from 'next/image';
import type { Location } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import { coffeeAccentStyle, getCoffeeAccent } from '@/lib/coffee-design';
import { useKievTheme } from '@/store/kievTheme';
import { KIEV_PALETTES } from './KievThemeProvider';
import { HamburgerMenu } from '../HamburgerMenu';

interface Props {
  locationSlug: string;
  locations: Location[];
}

export function CoffeeHeader({ locationSlug, locations }: Props) {
  const homeHref = `/${locationSlug}`;
  const kievVariant = useKievTheme((s) => s.variant);
  const kievPalette = KIEV_PALETTES[kievVariant] as React.CSSProperties;
  const headerStyle = locationSlug === 'kievskaia'
    ? { ...coffeeAccentStyle(locationSlug), ...kievPalette }
    : coffeeAccentStyle(locationSlug);
  const portalStyle: React.CSSProperties = locationSlug === 'kievskaia'
    ? { ['--cm-accent' as string]: getCoffeeAccent(locationSlug), ...kievPalette }
    : { ['--cm-accent' as string]: getCoffeeAccent(locationSlug) };

  return (
    <header
      className="sticky top-0 z-30 overflow-hidden border-b border-[var(--cm-border)] bg-[var(--cm-bg)]/95 backdrop-blur-md"
      style={headerStyle}
    >
      {/* Золотистые волны */}
      <style>{`
        @keyframes bvWave1 { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes bvWave2 { 0%{transform:translateX(-50%)} 100%{transform:translateX(0)} }
        @keyframes bvWave3 { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
      `}</style>
      <div className="pointer-events-none absolute inset-0">
        {/* Волна 1 — медленная, широкая */}
        <svg
          className="absolute bottom-0 h-full"
          style={{ width: '200%', animation: 'bvWave1 26s linear infinite' }}
          viewBox="0 0 1440 56"
          preserveAspectRatio="none"
        >
          <path
            d="M0,28 C120,56 240,0 360,28 C480,56 600,0 720,28 C840,56 960,0 1080,28 C1200,56 1320,0 1440,28 L1440,56 L0,56 Z"
            fill="rgba(197,168,128,0.10)"
          />
        </svg>
        {/* Волна 2 — средняя, в обратную сторону */}
        <svg
          className="absolute bottom-0 h-full"
          style={{ width: '200%', animation: 'bvWave2 18s linear infinite' }}
          viewBox="0 0 1440 56"
          preserveAspectRatio="none"
        >
          <path
            d="M0,38 C160,14 320,50 480,32 C640,14 800,50 960,32 C1120,14 1280,50 1440,32 L1440,56 L0,56 Z"
            fill="rgba(197,168,128,0.07)"
          />
        </svg>
        {/* Волна 3 — тонкая, быстрая */}
        <svg
          className="absolute bottom-0 h-full"
          style={{ width: '200%', animation: 'bvWave3 12s linear infinite' }}
          viewBox="0 0 1440 56"
          preserveAspectRatio="none"
        >
          <path
            d="M0,44 C90,28 180,56 270,40 C360,24 450,52 540,38 C630,24 720,52 810,40 C900,28 990,50 1080,42 C1170,34 1260,48 1440,40 L1440,56 L0,56 Z"
            fill="rgba(197,168,128,0.05)"
          />
        </svg>
      </div>

      <div className="relative mx-auto flex max-w-[1200px] items-center justify-between gap-2 px-4 py-3.5 sm:gap-3 sm:px-6">
        <Link
          href={homeHref}
          className="flex min-w-0 items-center cursor-pointer"
          aria-label="Barvikha Group"
        >
          <Image
            src="/logo.png"
            alt="Barvikha Group Since 2017"
            width={427}
            height={57}
            priority
            className="h-[24px] w-auto sm:h-[30px]"
            style={{ filter: 'invert(var(--cm-logo-invert, 0))' }}
          />
        </Link>

        <HamburgerMenu
          locationSlug={locationSlug}
          locations={locations}
          variant="coffee"
          themeStyle={portalStyle}
          showPalettePicker={locationSlug === 'kievskaia'}
        />
      </div>
    </header>
  );
}
