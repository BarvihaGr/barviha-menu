'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '', label: 'Настройки' },
  { href: '/kitchen', label: 'Кухня' },
  { href: '/bar', label: 'Бар' },
  { href: '/hookah', label: 'Кальяны' },
  { href: '/add', label: 'Добавить' },
  { href: '/stop-list', label: 'Стоп-лист' },
  { href: '/archive', label: 'Архив' },
] as const;

export function TabNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/locations/${slug}`;

  return (
    <div className="flex gap-1 border-b border-[color:var(--border)] px-8 pt-2">
      {TABS.map((tab) => {
        const href = base + tab.href;
        const active = tab.href === '' ? pathname === base : pathname.startsWith(href);
        return (
          <Link
            key={tab.href}
            href={href}
            className={`rounded-t-lg px-4 py-2 text-sm transition-colors ${
              active
                ? 'border border-b-0 border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text)]'
                : 'text-[color:var(--muted)] hover:text-[color:var(--text-soft)]'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
