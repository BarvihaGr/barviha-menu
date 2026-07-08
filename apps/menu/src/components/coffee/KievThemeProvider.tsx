'use client';

import { useEffect } from 'react';
import { useKievTheme } from '@/store/kievTheme';

export const KIEV_PALETTES = {
  ivory: {
    '--cm-bg': '#F0EAE0',
    '--cm-surface': '#E4D9CC',
    '--cm-surface-2': '#D9CCBD',
    '--cm-text': '#3C2210',
    '--cm-text-soft': '#6B4A28',
    '--cm-muted': 'rgba(60, 34, 16, 0.52)',
    '--cm-muted-dim': 'rgba(60, 34, 16, 0.36)',
    '--cm-border': 'rgba(140, 101, 64, 0.18)',
    '--cm-logo-invert': '0',
    // Акцент (золото #C5A880) не меняется между вариантами — тёмный текст
    // держит контраст в обоих случаях (в ivory --cm-bg почти совпадал с
    // акцентом и был нечитаем, ~1.9:1).
    '--cm-accent-text': '#1A1A1A',
    // Цена окрашена в цвет акцента (золото) поверх cm-bg — тот же слабый
    // контраст, что и у активного таба. Тёмный текст читается на обоих фонах.
    '--cm-accent-on-bg': '#3C2210',
  },
  arka: {
    '--cm-bg': '#6B5242',
    '--cm-surface': '#7C6454',
    '--cm-surface-2': '#8C7464',
    '--cm-text': '#F4E9D5',
    '--cm-text-soft': '#E5C490',
    '--cm-muted': 'rgba(244, 233, 213, 0.62)',
    '--cm-muted-dim': 'rgba(244, 233, 213, 0.38)',
    '--cm-border': 'rgba(196, 146, 98, 0.14)',
    '--cm-logo-invert': '1',
    '--cm-accent-text': '#1A1A1A',
    // Фон arka тёмный — здесь, в отличие от ivory, цена должна быть светлой.
    '--cm-accent-on-bg': '#F4E9D5',
  },
} as const;

export function KievThemeProvider({ children }: { children: React.ReactNode }) {
  const variant = useKievTheme((s) => s.variant);

  useEffect(() => {
    const palette = KIEV_PALETTES[variant];

    // На .coffee-theme div — основные CSS vars (для контента внутри дерева)
    const el = document.querySelector('.coffee-theme') as HTMLElement | null;
    if (el) {
      Object.entries(palette).forEach(([k, v]) => el.style.setProperty(k, v));
    }

    // На :root — для порталов Radix (HamburgerMenu, FilterDrawer),
    // header и LuxBottomNav с их собственными inline-style
    Object.entries(palette).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v),
    );

    const bodyBg = variant === 'arka' ? '#584030' : '#F0EAE0';
    document.body.style.setProperty('background', bodyBg);

    return () => {
      Object.keys(palette).forEach((k) =>
        document.documentElement.style.removeProperty(k),
      );
      document.body.style.removeProperty('background');
    };
  }, [variant]);

  // display:contents → vars наследуются детьми (порталы получают через themeStyle)
  return (
    <div style={KIEV_PALETTES[variant] as React.CSSProperties} className="contents">
      {children}
    </div>
  );
}
