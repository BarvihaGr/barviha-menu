'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('errors');
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-dim)]">Barvikha Lounge</p>
      <h1 className="text-2xl font-medium text-[var(--foreground)]">{t('wentWrongTitle')}</h1>
      <p className="max-w-sm text-sm text-[var(--muted)]">{t('wentWrongBody')}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-2 rounded-full border border-[var(--border-strong)] px-5 py-2.5 text-sm text-[var(--foreground)] transition hover:bg-[var(--card)]"
      >
        {t('tryAgain')}
      </button>
    </div>
  );
}
