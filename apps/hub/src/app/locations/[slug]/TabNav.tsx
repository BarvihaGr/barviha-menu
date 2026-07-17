'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { TabKey } from '@/lib/auth/permissions';

const TABS: { key: TabKey; href: string; label: string }[] = [
  { key: 'settings', href: '', label: 'Настройки' },
  { key: 'kitchen', href: '/kitchen', label: 'Кухня' },
  { key: 'bar', href: '/bar', label: 'Бар' },
  { key: 'hookah', href: '/hookah', label: 'Кальяны' },
  { key: 'add', href: '/add', label: 'Добавить' },
  { key: 'stop-list', href: '/stop-list', label: 'Стоп-лист' },
  { key: 'archive', href: '/archive', label: 'Архив' },
  { key: 'stats', href: '/stats', label: 'Статистика' },
];

export function TabNav({ slug, visibleTabs }: { slug: string; visibleTabs?: TabKey[] }) {
  const pathname = usePathname();
  const base = `/locations/${slug}`;
  const tabs = visibleTabs ? TABS.filter((tab) => visibleTabs.includes(tab.key)) : TABS;

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-[color:var(--border)] px-4 pt-2 sm:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
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
