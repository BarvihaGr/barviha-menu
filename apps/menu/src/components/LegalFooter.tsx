import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/** Документы лежат на основном сайте сети — оператор тот же, меню отдельных не заводит. */
const MAIN_SITE = 'https://barvikhagroup.ru';
const LEGAL_LINKS = [
  { key: 'privacy', href: `${MAIN_SITE}/privacy` },
  { key: 'cookies', href: `${MAIN_SITE}/cookies` },
  { key: 'terms', href: `${MAIN_SITE}/terms` },
  { key: 'pdRequest', href: `${MAIN_SITE}/pd-request` },
] as const;

/**
 * Юридический подвал: оператор сайта, «не оферта», 18+ и ссылки на документы.
 * Цвета — через токены темы (--muted/--border), поэтому одинаково читается и
 * на бежевой Арке, и на светлой/тёмной Киевской без своих стилей под каждую.
 */
export function LegalFooter({ className }: { className?: string }) {
  const t = useTranslations('legal');
  return (
    <footer
      className={cn(
        'mx-auto w-full max-w-[720px] border-t border-border px-2 pt-5 text-center text-xs leading-relaxed text-muted',
        className,
      )}
    >
      <div className="flex items-center justify-center gap-2">
        <span className="rounded-full border border-border-strong px-1.5 py-px text-xs font-medium tracking-wide">
          18+
        </span>
        <span>© {new Date().getFullYear()} Barvikha Lounge</span>
      </div>
      <p className="mt-2">{t('adults')}</p>
      <p className="mt-1.5">{t('notOffer')}</p>
      <nav className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        {LEGAL_LINKS.map((l) => (
          <a
            key={l.key}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-border-strong underline-offset-2 transition hover:text-cream"
          >
            {t(l.key)}
          </a>
        ))}
      </nav>
      <p className="mt-3">{t('operator')}</p>
      <a href="mailto:info@barvikhagroup.ru" className="mt-1 inline-block transition hover:text-cream">
        info@barvikhagroup.ru
      </a>
    </footer>
  );
}
