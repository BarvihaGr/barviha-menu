import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { LegalFooter } from '@/components/LegalFooter';
import { LocationLinks } from '@/components/LocationLinks';
import { getActiveLocations } from '@/lib/active-locations';
import { pageAlternates } from '@/lib/seo';

// Список открытых локаций меняется тумблером в бэк-офисе — без пересборки.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('rootTitle'),
    description: t('rootDescription'),
    alternates: pageAlternates(locale, ''),
  };
}

/**
 * Корень сайта. Раньше был жёсткий редирект на Киевскую — пока она выключена
 * в бэк-офисе, гость с голой ссылки попадал в тупик-заглушку. Теперь: одна
 * открытая локация — сразу в неё; несколько — выбор; ни одной — сообщение.
 */
export default async function LocaleRoot({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const locations = await getActiveLocations();
  const [only] = locations;
  if (only && locations.length === 1) {
    redirect({ href: `/${only.slug}`, locale: locale as Locale });
  }

  const t = await getTranslations('picker');
  const tLocation = await getTranslations('location');

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 bg-background px-6 pb-10 pt-16 text-center">
      <header className="flex flex-col items-center gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Barvikha Lounge</p>
        <h1 className="text-2xl font-light tracking-[0.05em] text-cream">
          {locations.length > 0 ? t('title') : t('subtitle')}
        </h1>
        {locations.length > 0 && <p className="text-sm text-muted">{t('subtitle')}</p>}
      </header>

      {locations.length > 0 ? (
        <LocationLinks locations={locations} locale={locale as Locale} />
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="max-w-xs text-sm text-muted">{tLocation('closedMessage')}</p>
          <a
            href="https://barvikhagroup.ru"
            className="rounded-full border border-border-strong px-5 py-2.5 text-sm text-cream transition hover:bg-card"
          >
            {t('mainSite')}
          </a>
        </div>
      )}

      <LegalFooter className="mt-auto" />
    </div>
  );
}
