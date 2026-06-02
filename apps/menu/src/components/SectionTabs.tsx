'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  /** Готовая подпись таба (если есть, переопределяет i18nKey). */
  label?: string;
  /** Ключ перевода под `sections.*` (если нет готового `label`). */
  i18nKey?: string;
}

interface Props {
  sections: TabItem[];
  active: string | null; // null = «Все»
  onChange: (next: string | null) => void;
}

/**
 * Горизонтальная лента табов подсекций категории.
 *
 * Первый таб — «Все» (фильтр снят). Дальше — каждая подсекция.
 * На мобиле скроллится горизонтально (overflow-x).
 * Активный — золотая заливка; неактивный — золотая обводка + золотой текст.
 *
 * Не рендерится, если у категории меньше 2 подсекций — таб «Все» один не нужен.
 */
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
        'shrink-0 rounded-full border px-3.5 py-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.2em] font-medium transition cursor-pointer whitespace-nowrap',
        on
          ? 'border-gold bg-gold text-[#2A1B11]'
          : 'border-gold/40 bg-gold/5 text-gold hover:bg-gold/15 hover:border-gold',
      )}
    >
      {label}
    </button>
  );
}
