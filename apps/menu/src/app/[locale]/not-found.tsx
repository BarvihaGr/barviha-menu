import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function LocaleNotFound() {
  const t = useTranslations('errors');
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-dim)]">Barvikha Lounge</p>
      <h1 className="text-2xl font-medium text-[var(--foreground)]">{t('notFoundTitle')}</h1>
      <p className="max-w-sm text-sm text-[var(--muted)]">{t('notFoundBody')}</p>
      <Link
        href="/"
        className="mt-2 rounded-full border border-[var(--border-strong)] px-5 py-2.5 text-sm text-[var(--foreground)] transition hover:bg-[var(--card)]"
      >
        {t('home')}
      </Link>
    </div>
  );
}
