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
    <header className="sticky top-0 z-30 bg-background/10 backdrop-blur-sm">
      <div className="mx-auto grid max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-3.5">
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
      {/* Бейдж локации — кнопка, открывает модалку с адресом/телефоном/маршрутом */}
      <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-2 px-5 pb-2.5">
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
