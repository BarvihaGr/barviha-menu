'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { Location } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import { LangSwitch } from './LangSwitch';
import { LocationSwitcher } from './LocationSwitcher';
import { LocationInfoModal } from './LocationInfoModal';

interface Props {
  locationName: string;
  locationAddress: string | null;
  locationPhone: string | null;
  locationSlug: string;
  locations: Location[];
  /** Акцентный цвет локации — для полосы и индикатора. */
  accent: string;
}

export function LocationHeader({
  locationName,
  locationAddress,
  locationPhone,
  locationSlug,
  locations,
  accent,
}: Props) {
  const t = useTranslations('brand');
  const homeHref = `/${locationSlug}`;

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-b from-[var(--background)]/40 via-[var(--background)]/15 to-transparent">
      {/*
        Один ряд везде: локация | лого BARVIKHA GROUP | язык.
        На мобиле всё сжато (меньше padding/text), на десктопе — крупнее.
        АРКА бейдж — отдельной строкой под этим рядом.
       */}
      <div className="mx-auto grid max-w-[1200px] items-center grid-cols-[1fr_auto_1fr] gap-1.5 sm:gap-4 px-2 sm:px-5 pt-2 sm:pt-3.5 pb-0.5 sm:pb-1">
        <div className="flex items-center min-w-0">
          <LocationSwitcher locations={locations} currentSlug={locationSlug} />
        </div>
        <Link href={homeHref} className="flex justify-center cursor-pointer" aria-label={t('name')}>
          <Image
            src="/logo.png"
            alt={t('name')}
            width={427}
            height={57}
            priority
            className="h-[18px] sm:h-6 w-auto"
          />
        </Link>
        <div className="flex justify-end shrink-0">
          <LangSwitch />
        </div>
      </div>

      {/* АРКА бейдж под общим рядом — на мобиле вплотную, на десктопе с привычным отступом */}
      <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-2 px-3 sm:px-5 pt-1 sm:pt-0 pb-1.5 sm:pb-2.5 sm:-mt-1">
        <LocationInfoModal
          locationName={locationName}
          address={locationAddress}
          phone={locationPhone}
          accent={accent}
        />
      </div>
    </header>
  );
}
