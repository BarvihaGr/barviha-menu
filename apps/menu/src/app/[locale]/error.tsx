'use client';

import { useEffect } from 'react';

export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-dim)]">Barvikha Lounge</p>
      <h1 className="text-2xl font-medium text-[var(--foreground)]">Что-то пошло не так</h1>
      <p className="max-w-sm text-sm text-[var(--muted)]">
        Не получилось загрузить страницу. Попробуйте ещё раз — обычно это временный сбой.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-2 rounded-full border border-[var(--border-strong)] px-5 py-2.5 text-sm text-[var(--foreground)] transition hover:bg-[var(--card)]"
      >
        Попробовать снова
      </button>
    </div>
  );
}
