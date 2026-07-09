'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import type { ResolvedMenuItem } from '@barviha/db';
import { pickItemName, pickSubLabel } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ArkaItemCard } from './ArkaItemCard';

interface SectionDef {
  id: string;
  label: string;
  items: ResolvedMenuItem[];
}

interface Props {
  items: ResolvedMenuItem[];
  locale: Locale;
}

/** Группировка по item.sub — своя копия логики CoffeeMenuList.buildFromSub,
 * продублирована намеренно, чтобы ArkaMenuList не импортировал ничего из
 * components/coffee/*. */
function buildFromSub(items: ResolvedMenuItem[], locale: Locale): SectionDef[] {
  const order: string[] = [];
  const map = new Map<string, SectionDef>();
  for (const it of items) {
    if (!it.sub) continue;
    let s = map.get(it.sub);
    if (!s) {
      const label = pickSubLabel(it.sub, it.subLabel ?? it.sub, locale);
      s = { id: it.sub, label, items: [] };
      map.set(it.sub, s);
      order.push(it.sub);
    }
    s.items.push(it);
  }
  return order.map((k) => map.get(k)!);
}

export function ArkaMenuList({ items, locale }: Props) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const chipBarRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const sections: SectionDef[] = useMemo(() => {
    const fromSub = buildFromSub(items, locale);
    return fromSub.length > 0 ? fromSub : [{ id: '__all', label: '', items }];
  }, [items, locale]);

  const hasMultipleSections = sections.length > 1 && sections[0]?.id !== '__all';

  useEffect(() => {
    if (!hasMultipleSections) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const e of entries) {
          if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) best = e;
        }
        if (best) setActiveSection(best.target.id);
      },
      { rootMargin: '-15% 0px -60% 0px', threshold: [0, 0.1, 0.5] },
    );
    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [hasMultipleSections, sections]);

  useEffect(() => {
    if (!activeSection || !chipBarRef.current) return;
    chipBarRef.current
      .querySelector<HTMLElement>(`[data-sec="${activeSection}"]`)
      ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeSection]);

  const jumpTo = (id: string) => {
    const el = sectionRefs.current.get(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 156;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-5 sm:px-8">
      {hasMultipleSections && (
        <div
          ref={chipBarRef}
          className="sticky top-[116px] z-10 -mx-4 mb-6 overflow-x-auto no-scrollbar border-b border-[var(--arka-border)] bg-[var(--arka-bg)]/95 px-4 py-2.5 backdrop-blur-md sm:-mx-8 sm:px-8"
        >
          <div className="flex gap-2">
            {sections.map((s) => (
              <button
                key={s.id}
                data-sec={s.id}
                type="button"
                onClick={() => jumpTo(s.id)}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-full px-3.5 py-1 text-[11px] uppercase tracking-[0.1em] transition-colors duration-300',
                  activeSection === s.id
                    ? 'bg-[var(--arka-surface-2)] text-[var(--arka-text)]'
                    : 'text-[var(--arka-muted)] hover:text-[var(--arka-text)]',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {sections.map(
        (s) =>
          s.items.length > 0 && (
            <div
              key={s.id}
              id={s.id}
              ref={(el) => {
                if (el) sectionRefs.current.set(s.id, el);
                else sectionRefs.current.delete(s.id);
              }}
              className="mb-10"
            >
              {hasMultipleSections && s.label && (
                <h2
                  className="mb-5 text-[24px] uppercase tracking-[0.06em] text-[var(--arka-text)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {s.label}
                </h2>
              )}
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
                {s.items.map((item) => (
                  <ArkaItemCard key={item.id} item={item} name={pickItemName(item, locale)} description={null} />
                ))}
              </div>
            </div>
          ),
      )}
    </div>
  );
}
