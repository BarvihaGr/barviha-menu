'use client';

import { useEffect, useState } from 'react';
import { Home, BookOpen, MapPin, ShoppingBag } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { useCart } from '@/store/cart';
import { coffeeAccentStyle } from '@/lib/coffee-design';
import { useKievTheme } from '@/store/kievTheme';
import { KIEV_PALETTES } from './KievThemeProvider';
import { cn } from '@/lib/utils';

interface Props {
  locationSlug: string;
}

/**
 * Нижняя навигация lux-дизайна (по ТЗ «Киевская»): полноширинная панель с
 * 4 табами — Главная / Меню / Контакты / Профиль. Тонкие линейные иконки +
 * подпись Inter; активный таб — золотой (--cm-accent). Тёмная поверхность,
 * тонкая золотая граница сверху.
 */
export function LuxBottomNav({ locationSlug }: Props) {
  const pathname = usePathname();
  const base = `/${locationSlug}`;
  const kievVariant = useKievTheme((s) => s.variant);
  // Для Киевской — динамический стиль на основе текущей палитры
  const navStyle = locationSlug === 'kievskaia'
    ? { ...coffeeAccentStyle(locationSlug), ...KIEV_PALETTES[kievVariant] }
    : coffeeAccentStyle(locationSlug);

  // Счётчик корзины — из localStorage только на клиенте (guard от hydration).
  const rawCount = useCart((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const cartCount = mounted ? rawCount : 0;

  const tabs = [
    { key: 'home', label: 'Главная', icon: Home, href: base, match: (p: string) => p === base, badge: 0 },
    {
      key: 'menu',
      label: 'Меню',
      icon: BookOpen,
      href: `${base}/kitchen`,
      match: (p: string) => p.startsWith(`${base}/menu`) || isCategoryPath(p, base),
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
    <nav
      style={navStyle}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--cm-border)] bg-[var(--cm-bg)]/95 backdrop-blur-md"
    >
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
                'flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors cursor-pointer',
                on ? 'text-[color:var(--cm-accent)]' : 'text-[var(--cm-muted)] hover:text-[var(--cm-text)]',
              )}
            >
              <span className="relative">
                <Icon size={21} strokeWidth={1.5} />
                {t.badge > 0 && (
                  <span className="absolute -right-2.5 -top-1.5 inline-flex min-w-[16px] items-center justify-center rounded-full bg-[color:var(--cm-accent)] px-1 text-[10px] font-semibold text-[#111111]">
                    {t.badge}
                  </span>
                )}
              </span>
              <span className="font-[family-name:var(--font-sans)] text-[11px] tracking-[0.02em]">
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Страница раздела меню (/{slug}/{categorySlug} или /{slug}/hookah) — подсветка таба «Меню». */
function isCategoryPath(p: string, base: string): boolean {
  if (!p.startsWith(`${base}/`)) return false;
  const rest = p.slice(base.length + 1);
  // Исключаем служебные сегменты, которые не относятся к «Меню».
  return !['contacts', 'profile', 'cart', 'item'].some((seg) => rest.startsWith(seg));
}
