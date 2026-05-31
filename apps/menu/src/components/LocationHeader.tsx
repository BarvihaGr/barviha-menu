'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { Location } from '@barviha/db';
import { Link, usePathname } from '@/i18n/navigation';
import { LangSwitch } from './LangSwitch';
import { LocationSwitcher } from './LocationSwitcher';

interface Props {
  locationName: string;
  locationAddress: string | null;
  locationSlug: string;
  locations: Location[];
}

export function LocationHeader({ locationName, locationAddress, locationSlug, locations }: Props) {
  const t = useTranslations('brand');
  const pathname = usePathname();
  const homeHref = `/${locationSlug}`;
  const isHome = pathname === homeHref;

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-[color:var(--border)]">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-4">
        <div className="flex items-center">
          <LocationSwitcher locations={locations} currentSlug={locationSlug} />
        </div>
        <Link href={homeHref} className="flex justify-center cursor-pointer" aria-label={t('name')}>
          <Image
            src="/logo.png"
            alt={t('name')}
            width={427}
            height={57}
            priority
            className="h-5 sm:h-6 w-auto"
          />
        </Link>
        <div className="flex justify-end">
          <LangSwitch />
        </div>
      </div>
      {isHome && locationAddress && (
        <div className="mx-auto max-w-[1200px] px-5 pb-3 text-center sm:text-left text-[10px] tracking-[0.2em] uppercase text-muted">
          {locationName} · {locationAddress}
        </div>
      )}
    </header>
  );
}
