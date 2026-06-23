'use client';

import { useKievTheme } from '@/store/kievTheme';

// Две палитры Киевской: переменные --cm-* каскадируют через display:contents
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
  // Точь-в-точь стандартная тёмная тема Барвихи (globals.css :root)
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

interface Props { children: React.ReactNode }

export function KievThemeProvider({ children }: Props) {
  const variant = useKievTheme((s) => s.variant);
  return (
    <div style={PALETTES[variant] as React.CSSProperties} className="contents">
      {children}
    </div>
  );
}
