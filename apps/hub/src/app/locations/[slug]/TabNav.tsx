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
  { href: '/stats', label: 'Статистика' },
] as const;

export function TabNav({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/locations/${slug}`;

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-[color:var(--border)] px-4 pt-2 sm:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {TABS.map((tab) => {
        const href = base + tab.href;
        const active = tab.href === '' ? pathname === base : pathname.startsWith(href);
        return (
          <Link
            key={tab.href}
            href={href}
            className={`shrink-0 whitespace-nowrap rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? 'glitch-box border border-b-0 border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--accent)]'
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
