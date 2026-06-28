'use client';

import Image from 'next/image';
import type { Location } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import { coffeeAccentStyle, getCoffeeAccent } from '@/lib/coffee-design';
import { useKievTheme } from '@/store/kievTheme';
import { KIEV_PALETTES } from './KievThemeProvider';
import { HamburgerMenu } from '../HamburgerMenu';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

interface Props {
  locationSlug: string;
  locations: Location[];
}

export function CoffeeHeader({ locationSlug, locations }: Props) {
  const homeHref = `/${locationSlug}`;
  const kievVariant = useKievTheme((s) => s.variant);
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const LANG_LABELS: Record<Locale, string> = { ru: 'RU', en: 'EN', zh: '中', hy: 'ՀՅ' };
  // Для Киевской — динамический стиль (сливается база + текущая палитра)
  const kievPalette = KIEV_PALETTES[kievVariant] as React.CSSProperties;
  const headerStyle = locationSlug === 'kievskaia'
    ? { ...coffeeAccentStyle(locationSlug), ...kievPalette }
    : coffeeAccentStyle(locationSlug);
  // themeStyle для HamburgerMenu портала — акцент + палитра Киевской
  const portalStyle: React.CSSProperties = locationSlug === 'kievskaia'
    ? { ['--cm-accent' as string]: getCoffeeAccent(locationSlug), ...kievPalette }
    : { ['--cm-accent' as string]: getCoffeeAccent(locationSlug) };

  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--cm-border)] bg-[var(--cm-bg)]/95 backdrop-blur-md"
      style={headerStyle}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-2 px-4 py-3.5 sm:gap-3 sm:px-6">
        <Link
          href={homeHref}
          className="flex min-w-0 items-center gap-2.5 cursor-pointer"
          aria-label="Barvikha Group"
        >
          <Image
            src="/logo-barvikha.png"
            alt="Барвиха"
            width={150}
            height={93}
            priority
            className="hidden h-9 w-auto shrink-0 sm:block"
            style={{ filter: 'invert(var(--cm-logo-invert, 0))' }}
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
          themeStyle={portalStyle}
          showPalettePicker={locationSlug === 'kievskaia'}
        />
      </div>
    </header>
  );
}
