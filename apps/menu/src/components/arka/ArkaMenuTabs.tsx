import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { slug: 'hookah', label: 'Кальяны' },
  { slug: 'bar', label: 'Бар' },
  { slug: 'kitchen', label: 'Кухня' },
] as const;

interface Props {
  active: (typeof SECTIONS)[number]['slug'];
}

/** Верхние табы разделов меню — капс + пилюли + счётчик позиции, как у Timeless. */
export function ArkaMenuTabs({ active }: Props) {
  const index = SECTIONS.findIndex((s) => s.slug === active);

  return (
    <div className="sticky top-[60px] z-20 -mx-4 border-b border-[var(--arka-border)] bg-[var(--arka-bg)]/95 px-4 py-3 backdrop-blur-md sm:-mx-8 sm:px-8">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {SECTIONS.map((s) => (
            <Link
              key={s.slug}
              href={`/arka/menu/${s.slug}`}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-[12px] uppercase tracking-[0.15em] transition-all duration-300',
                s.slug === active
                  ? 'bg-[var(--arka-accent)] font-medium text-[var(--arka-accent-text)]'
                  : 'text-[var(--arka-muted)] hover:text-[var(--arka-text)]',
              )}
            >
              {s.label}
            </Link>
          ))}
        </div>
        <span className="shrink-0 text-[10px] tracking-[0.2em] text-[var(--arka-muted-dim)]">
          {index + 1}/{SECTIONS.length}
        </span>
      </div>
    </div>
  );
}
