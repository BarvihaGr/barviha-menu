/**
 * Токены «Арки» — полностью отдельное пространство имён (`--arka-*`), без
 * пересечения с `--cm-*` (Coffeemania/Киевская). Сделано намеренно: любые
 * правки дизайна Арки не должны иметь ни единой точки соприкосновения с
 * компонентами/токенами Киевской — см. apps/menu/docs/timeless-style-site-tz.md.
 *
 * Цвет — тот же тёплый бронзовый цветокор, что обкатан в песочнице /arka-lab.
 */
export const ARKA_THEME_STYLE: React.CSSProperties = {
  ['--arka-bg' as string]: '#1B110A',
  ['--arka-surface' as string]: '#241710',
  ['--arka-surface-2' as string]: '#2E2015',
  ['--arka-text' as string]: '#F4E9D5',
  ['--arka-text-soft' as string]: '#E8D4B0',
  ['--arka-muted' as string]: 'rgba(244, 233, 213, 0.60)',
  ['--arka-muted-dim' as string]: 'rgba(244, 233, 213, 0.40)',
  ['--arka-border' as string]: 'rgba(196, 146, 98, 0.20)',
  ['--arka-accent' as string]: '#C49262',
  ['--arka-accent-text' as string]: '#1B110A',
};

export const ARKA_ACCENT = '#C49262';
