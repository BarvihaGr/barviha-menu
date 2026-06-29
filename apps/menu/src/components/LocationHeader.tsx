'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { Location } from '@barviha/db';
import { Link } from '@/i18n/navigation';
import { HamburgerMenu } from './HamburgerMenu';

interface Props {
  locationSlug: string;
  locations: Location[];
}

export function LocationHeader({ locationSlug, locations }: Props) {
  const t = useTranslations('brand');
  const homeHref = `/${locationSlug}`;

  return (
    <header className="relative sticky top-0 z-30 overflow-hidden bg-gradient-to-b from-[var(--background)]/40 via-[var(--background)]/15 to-transparent">
      {/* Золотые волны */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Волна 1 — крупная, светлое золото, медленная */}
        <div
          className="absolute top-0 bottom-0 left-0"
          style={{ width: '200%', animation: 'wave-flow 20s linear infinite', willChange: 'transform' }}
        >
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-full" fill="none">
            <path
              d="M0 38 C150 14 450 62 600 38 C750 14 1050 62 1200 38"
              stroke="#E5C490"
              strokeWidth="2.8"
              strokeOpacity="0.7"
            />
          </svg>
        </div>
        {/* Волна 2 — обратная фаза, основное золото */}
        <div
          className="absolute top-0 bottom-0 left-0"
          style={{ width: '200%', animation: 'wave-flow 13s linear infinite reverse', willChange: 'transform' }}
        >
          <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-full" fill="none">
            <path
              d="M0 26 C150 50 450 2 600 26 C750 50 1050 2 1200 26"
              stroke="#C49262"
              strokeWidth="2"
              strokeOpacity="0.6"
            />
          </svg>
        </div>
        {/* Волна 3 — более частая, быстрее, глубокое золото */}
        <div
          className="absolute top-0 bottom-0 left-0"
          style={{ width: '200%', animation: 'wave-flow 8s linear infinite', willChange: 'transform' }}
        >
          <svg viewBox="0 0 800 60" preserveAspectRatio="none" className="w-full h-full" fill="none">
            <path
              d="M0 32 C100 12 300 52 400 32 C500 12 700 52 800 32"
              stroke="#D4A86A"
              strokeWidth="1.4"
              strokeOpacity="0.45"
            />
          </svg>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1200px] items-center grid-cols-[1fr_auto_1fr] gap-1.5 sm:gap-4 px-3 sm:px-5 pt-2 sm:pt-3.5 pb-1.5 sm:pb-2.5">
        <div />
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
        <div className="flex justify-end">
          <HamburgerMenu locationSlug={locationSlug} locations={locations} variant="dark" />
        </div>
      </div>
    </header>
  );
}
