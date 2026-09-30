import { useTranslations } from 'next-intl';
import type { Location } from '@barviha/db';
import type { Locale } from '@/i18n/routing';
import { LegalFooter } from './LegalFooter';
import { LocationLinks } from './LocationLinks';

interface Props {
  locationName: string;
  /** Открытые сейчас локации — чтобы заглушка не была тупиком. */
  openLocations: Location[];
  locale: Locale;
}

/** Показывается вместо каталога, когда локацию выключили в бэк-офисе (is_active: false). */
export function LocationClosedScreen({ locationName, openLocations, locale }: Props) {
  const t = useTranslations('location');
  return (
    <div className="flex min-h-screen flex-col items-center gap-8 bg-background px-6 pb-10 pt-16 text-center">
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <div className="text-4xl text-gold-dark opacity-40">◈</div>
        <h1 className="text-xl font-light tracking-[0.05em] text-cream">{locationName}</h1>
        <p className="max-w-xs text-sm text-muted">{t('closedMessage')}</p>
        {openLocations.length > 0 && (
          <div className="mt-6 flex w-full flex-col items-center gap-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{t('openNow')}</p>
            <LocationLinks locations={openLocations} locale={locale} />
          </div>
        )}
      </div>
      <LegalFooter />
    </div>
  );
}
