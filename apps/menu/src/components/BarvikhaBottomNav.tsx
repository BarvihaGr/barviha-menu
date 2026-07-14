'use client';

import { Home, BookOpen, MapPin, ShoppingBag } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { useCart } from '@/store/cart';
import { cn } from '@/lib/utils';
import { useIsClient } from '@/lib/use-is-client';

interface Props {
  locationSlug: string;
}

export function BarvikhaBottomNav({ locationSlug }: Props) {
  const pathname = usePathname();
  const base = `/${locationSlug}`;

  const rawCount = useCart((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const mounted = useIsClient();
  const cartCount = mounted ? rawCount : 0;

  const tabs = [
    {
      key: 'home',
      label: 'Главная',
      icon: Home,
      href: base,
      match: (p: string) => p === base,
      badge: 0,
    },
    {
      key: 'menu',
      label: 'Меню',
      icon: BookOpen,
      href: `${base}/kitchen`,
      match: (p: string) => isMenuPath(p, base),
      badge: 0,
    },
    {
      key: 'contacts',
      label: 'Контакты',
      icon: MapPin,
      href: `${base}/contacts`,
      match: (p: string) => p.startsWith(`${base}/contacts`),
      badge: 0,
    },
    {
      key: 'cart',
      label: 'Корзина',
      icon: ShoppingBag,
      href: `${base}/cart`,
      match: (p: string) => p.startsWith(`${base}/cart`),
      badge: cartCount,
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/96 backdrop-blur-md">
      <div
        className="mx-auto flex max-w-[680px] items-stretch justify-between px-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {tabs.map((t) => {
          const on = t.match(pathname);
          const Icon = t.icon;
          return (
            <Link
              key={t.key}
              href={t.href}
              aria-current={on ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-3 transition-colors cursor-pointer',
                on ? 'text-foreground' : 'text-muted hover:text-foreground',
              )}
            >
              <span className="relative">
                <Icon size={20} strokeWidth={on ? 2 : 1.5} />
                {t.badge > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 inline-flex min-w-[16px] items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background">
                    {t.badge}
                  </span>
                )}
              </span>
              <span
                className="text-[10px] tracking-[0.04em]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: on ? 500 : 400 }}
              >
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function isMenuPath(p: string, base: string): boolean {
  if (!p.startsWith(`${base}/`)) return false;
  const rest = p.slice(base.length + 1);
  return !['contacts', 'cart', 'item'].some((seg) => rest.startsWith(seg));
}
