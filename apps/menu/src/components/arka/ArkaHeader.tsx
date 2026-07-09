'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getBookingUrl } from '@/lib/booking';

const NAV = [
  { href: '/arka/menu', label: 'Меню' },
  { href: '/arka/locations', label: 'Локации' },
  { href: '/arka/news', label: 'Новости' },
];

/**
 * Хедер Арки — своя реализация, не импортирует HamburgerMenu/CoffeeHeader.
 * Языки/локация переключаются напрямую, без общего с Киевской компонента,
 * чтобы правки здесь не могли задеть Киевскую (см. timeless-style-site-tz.md).
 */
export function ArkaHeader() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const otherLocale = locale === 'en' ? 'ru' : 'en';

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--arka-border)] bg-[var(--arka-bg)]/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <Link href="/arka" className="flex items-center gap-2.5 shrink-0">
          <Image src="/locations/arka/logo-tree.png" alt="Арка" width={32} height={32} className="h-7 w-7 object-contain" />
          <span
            className="text-[13px] uppercase tracking-[0.28em] text-[var(--arka-text)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Арка
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.2em] text-[var(--arka-muted)] sm:inline">
            Москва · Рублёво
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[11px] uppercase tracking-[0.2em] text-[var(--arka-muted)] transition-colors duration-300 hover:text-[var(--arka-text)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href={pathname}
            locale={otherLocale}
            className="text-[11px] uppercase tracking-[0.15em] text-[var(--arka-muted)] transition-colors duration-300 hover:text-[var(--arka-text)]"
          >
            {otherLocale.toUpperCase()}
          </Link>
          <a
            href={getBookingUrl('arka')}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[var(--arka-accent)] px-5 py-2 text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--arka-accent-text)] transition-transform duration-200 active:scale-95"
          >
            Резерв
          </a>
        </div>
      </div>
    </header>
  );
}
