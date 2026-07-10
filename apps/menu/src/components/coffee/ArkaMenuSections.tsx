/**
 * Витрина двух шаблонов карточек для боевых страниц «Арки» (/arka/bar,
 * /arka/kitchen, /arka/hookah) — см. ArkaCardTypes.tsx и arka-menu-data.ts.
 * Заменяет CoffeeMenuList только для связки локация «Арка» + одна из этих
 * категорий — остальные локации (в т.ч. Киевская) рендерятся как раньше,
 * см. [categorySlug]/page.tsx и hookah/page.tsx.
 */

import type { ArkaMenuEntry, ArkaMenuItem } from '@/lib/arka-menu-data';
import { ArkaFullCard, ArkaGroupCard } from './ArkaCardTypes';

function CategoryBlock({
  category,
  items,
  locationSlug,
}: {
  category: string;
  items: ArkaMenuItem[];
  locationSlug: string;
}) {
  const type1 = items.filter((i) => i.type === 1);
  const type2 = items.filter((i) => i.type === 2);

  return (
    <section className="py-8 first:pt-0">
      <h2 className="mb-4 font-[family-name:var(--font-display)] text-[20px] font-semibold uppercase leading-none tracking-[0.03em] text-[var(--cm-text-soft)]">
        {category}
      </h2>

      {type1.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
          {type1.map((it, i) => (
            <ArkaFullCard key={`${it.name}-${i}`} item={it} locationSlug={locationSlug} />
          ))}
        </div>
      )}

      {type1.length > 0 && type2.length > 0 && <div className="my-7 h-px w-full bg-[var(--cm-border)]" />}

      {type2.length > 0 && <ArkaGroupCard items={type2} locationSlug={locationSlug} />}
    </section>
  );
}

export function ArkaMenuSections({ sections, locationSlug }: { sections: ArkaMenuEntry[]; locationSlug: string }) {
  return (
    <div className="min-w-0">
      {sections.map((entry, idx) => {
        if (entry.kind === 'header') {
          return (
            <div key={idx} className="pt-10 pb-2 first:pt-0">
              <h2 className="font-[family-name:var(--font-display)] text-[32px] font-semibold uppercase leading-none tracking-[0.02em] text-[var(--cm-accent)]">
                {entry.title}
              </h2>
            </div>
          );
        }
        return <CategoryBlock key={idx} category={entry.category} items={entry.items} locationSlug={locationSlug} />;
      })}
    </div>
  );
}
