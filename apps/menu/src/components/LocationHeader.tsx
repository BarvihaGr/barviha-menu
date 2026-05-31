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
  /** Акцентный цвет локации — для полосы и индикатора. */
  accent: string;
}

export function LocationHeader({
  locationName,
  locationAddress,
  locationSlug,
  locations,
  accent,
}: Props) {
  const t = useTranslations('brand');
  const pathname = usePathname();
  const homeHref = `/${locationSlug}`;
  const isHome = pathname === homeHref;

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-[color:var(--border)]">
      {/* Акцентная полоса локации — мгновенно различает 27 точек */}
      <div className="h-1 w-full" style={{ background: accent, boxShadow: `0 0 12px ${accent}` }} />
      <div className="mx-auto grid max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-3.5">
        <div className="flex items-center">
          <LocationSwitcher locations={locations} currentSlug={locationSlug} accent={accent} />
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
      {/* Название локации видно всегда (на всех страницах), с акцентной точкой */}
      <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-2 px-5 pb-2.5">
        <span
          className="inline-block h-2 w-2 rounded-full shrink-0"
          style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
        />
        <span className="text-[11px] tracking-[0.25em] uppercase text-cream font-medium">
          {locationName}
        </span>
        {isHome && locationAddress && (
          <span className="text-[10px] tracking-[0.15em] uppercase text-muted hidden sm:inline">
            · {locationAddress}
          </span>
        )}
      </div>
    </header>
  );
}
