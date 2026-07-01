'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label?: string;
  i18nKey?: string;
}

interface Props {
  sections: TabItem[];
  active: string | null;
  onChange: (next: string | null) => void;
}

export function SectionTabs({ sections, active, onChange }: Props) {
  const t = useTranslations('sections');

  if (sections.length < 2) return null;

  const label = (s: TabItem): string => s.label ?? (s.i18nKey ? t(s.i18nKey) : s.id);

  return (
    <div className="-mx-4 sm:mx-0 overflow-x-auto no-scrollbar">
      <div className="flex gap-2 px-4 sm:px-0">
        <Tab label={t('all')} on={active === null} onClick={() => onChange(null)} />
        {sections.map((s) => (
          <Tab key={s.id} label={label(s)} on={active === s.id} onClick={() => onChange(s.id)} />
        ))}
      </div>
    </div>
  );
}

function Tab({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        'shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer',
        on
          ? 'bg-foreground text-background'
          : 'text-muted hover:text-foreground',
      )}
    >
      {label}
    </button>
  );
}
