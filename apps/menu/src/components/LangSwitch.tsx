'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export function LangSwitch({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (next: Locale) => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  return (
    <div className={cn('flex border border-[color:var(--border)] rounded-sm overflow-hidden', className)}>
      {(['ru', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          className={cn(
            'px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition cursor-pointer',
            locale === l ? 'bg-gold text-[#3F1904]' : 'text-muted hover:text-gold',
          )}
          aria-pressed={locale === l}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
