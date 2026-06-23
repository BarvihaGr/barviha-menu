'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LangSwitch } from './LangSwitch';

interface Props {
  locationSlug: string;
}

export function LocationHeader({ locationSlug }: Props) {
  const t = useTranslations('brand');
  const homeHref = `/${locationSlug}`;

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-b from-[var(--background)]/40 via-[var(--background)]/15 to-transparent">
      <div className="mx-auto grid max-w-[1200px] items-center grid-cols-[1fr_auto_1fr] gap-1.5 sm:gap-4 px-2 sm:px-5 pt-2 sm:pt-3.5 pb-1.5 sm:pb-2.5">
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
        <div className="flex justify-end shrink-0">
          <LangSwitch />
        </div>
      </div>
    </header>
  );
}
