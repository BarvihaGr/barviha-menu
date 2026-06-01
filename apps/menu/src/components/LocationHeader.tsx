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
        Мобильная раскладка — 2 ряда:
          Ряд 1: BARVIKHA GROUP мини-лого по центру.
          Ряд 2: локация (слева) ↔ переключатель языка (справа).
        Десктоп (≥sm) — один ряд: локация | лого | язык.
       */}

      {/* Mobile only: лого ряд — узкий вертикально */}
      <div className="flex sm:hidden justify-center px-3 pt-1.5 pb-0">
        <Link href={homeHref} className="flex cursor-pointer" aria-label={t('name')}>
          <Image
            src="/logo.png"
            alt={t('name')}
            width={427}
            height={57}
            priority
            className="h-[18px] w-auto"
          />
        </Link>
      </div>

      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-2 px-3 pt-0.5 pb-0 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:px-5 sm:pt-3.5 sm:pb-1">
        <div className="flex items-center min-w-0">
          <LocationSwitcher locations={locations} currentSlug={locationSlug} />
        </div>
        <Link
          href={homeHref}
          className="hidden sm:flex justify-center cursor-pointer"
          aria-label={t('name')}
        >
          <Image
            src="/logo.png"
            alt={t('name')}
            width={427}
            height={57}
            priority
            className="h-6 w-auto"
          />
        </Link>
        <div className="flex justify-end shrink-0">
          <LangSwitch />
        </div>
      </div>
      {/* Бейдж локации — кнопка, открывает модалку с адресом/телефоном/маршрутом */}
      <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-2 px-5 pt-0.5 pb-1 sm:pb-2.5 sm:-mt-1">
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
