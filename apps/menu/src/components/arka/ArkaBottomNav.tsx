'use client';

import { Home, UtensilsCrossed, MapPin, Newspaper } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/arka', label: 'Главная', icon: Home },
  { href: '/arka/menu', label: 'Меню', icon: UtensilsCrossed },
  { href: '/arka/locations', label: 'Локации', icon: MapPin },
  { href: '/arka/news', label: 'Новости', icon: Newspaper },
];

/** Нижняя навигация — только на мобильных (md:hidden), своя, без BarvikhaBottomNav. */
export function ArkaBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--arka-border)] bg-[var(--arka-bg)]/95 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-[560px] items-center justify-between px-6 py-2.5">
        {ITEMS.map((item) => {
          const active = item.href === '/arka' ? pathname === '/arka' : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-2 py-1 text-[9px] uppercase tracking-[0.1em] transition-colors',
                active ? 'text-[var(--arka-accent)]' : 'text-[var(--arka-muted)]',
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
