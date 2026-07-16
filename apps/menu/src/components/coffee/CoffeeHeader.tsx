'use client';

import Image from 'next/image';
import type { Location } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import { coffeeAccentStyle, getCoffeeAccent, isKievskaiaStyle } from '@/lib/coffee-design';
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
  const headerStyle = isKievskaiaStyle(locationSlug)
    ? { ...coffeeAccentStyle(locationSlug), ...kievPalette }
    : coffeeAccentStyle(locationSlug);
  const portalStyle: React.CSSProperties = isKievskaiaStyle(locationSlug)
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
      `}</style>
      <div className="pointer-events-none absolute inset-0">
        <svg
          className="absolute bottom-0 h-full"
          style={{ width: '200%', animation: 'bvWave1 55s linear infinite' }}
          viewBox="0 0 1440 56"
          preserveAspectRatio="none"
        >
          <path
            d="M0,36 C240,56 480,16 720,36 C960,56 1200,16 1440,36 L1440,56 L0,56 Z"
            fill="rgba(197,168,128,0.045)"
          />
        </svg>
        <svg
          className="absolute bottom-0 h-full"
          style={{ width: '200%', animation: 'bvWave2 40s linear infinite' }}
          viewBox="0 0 1440 56"
          preserveAspectRatio="none"
        >
          <path
            d="M0,44 C360,28 720,52 1080,36 C1260,28 1380,46 1440,42 L1440,56 L0,56 Z"
            fill="rgba(197,168,128,0.03)"
          />
        </svg>
      </div>

      <div className="relative mx-auto flex max-w-[1200px] items-center justify-between gap-2 px-4 py-1.5 sm:gap-3 sm:px-6">
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
          showPalettePicker={isKievskaiaStyle(locationSlug)}
        />
      </div>
    </header>
  );
}
