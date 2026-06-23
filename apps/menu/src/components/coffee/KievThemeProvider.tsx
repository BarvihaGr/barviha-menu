'use client';

import { useEffect } from 'react';
import { useKievTheme } from '@/store/kievTheme';

const PALETTES = {
  ivory: {
    '--cm-bg': '#F2EAE0',
    '--cm-surface': '#E8DDD0',
    '--cm-surface-2': '#FFFFFF',
    '--cm-text': '#2A1A0E',
    '--cm-text-soft': '#4A3426',
    '--cm-muted': 'rgba(42, 26, 14, 0.55)',
    '--cm-muted-dim': 'rgba(42, 26, 14, 0.35)',
    '--cm-border': 'rgba(155, 122, 80, 0.22)',
    '--cm-logo-invert': '1',
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
    '--cm-logo-invert': '0',
  },
} as const;

export function KievThemeProvider({ children }: { children: React.ReactNode }) {
  const variant = useKievTheme((s) => s.variant);

  useEffect(() => {
    const palette = PALETTES[variant];

    // Перезаписываем CSS-переменные прямо на .coffee-theme div
    // (server-rendered inline style, background-color: var(--cm-bg) живёт там же)
    const el = document.querySelector('.coffee-theme') as HTMLElement | null;
    if (el) {
      Object.entries(palette).forEach(([k, v]) => el.style.setProperty(k, v));
    }

    // body:has(.coffee-theme) тоже ставит фон — перебиваем
    const bodyBg = variant === 'arka' ? '#584030' : '#F2EAE0';
    document.body.style.setProperty('background', bodyBg);

    return () => {
      document.body.style.removeProperty('background');
    };
  }, [variant]);

  // display:contents → vars наследуются детьми (порталы получают через themeStyle)
  return (
    <div style={PALETTES[variant] as React.CSSProperties} className="contents">
      {children}
    </div>
  );
}
