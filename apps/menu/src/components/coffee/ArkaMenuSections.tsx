/**
 * Витрина двух шаблонов карточек для боевых страниц «Арки» (/arka/bar,
 * /arka/kitchen, /arka/hookah) — см. ArkaCardTypes.tsx и arka-menu-data.ts.
 * Заменяет CoffeeMenuList только для связки локация «Арка» + одна из этих
 * категорий — остальные локации (в т.ч. Киевская) рендерятся как раньше,
 * см. [categorySlug]/page.tsx и hookah/page.tsx.
 */

import Image from 'next/image';
import type { PhotoEntry } from '@barviha/db';
import type { ArkaMenuEntry, ArkaMenuItem } from '@/lib/arka-menu-data';
import { photoTransformCss } from '@/lib/photo-transform';
import type { Locale } from '@/i18n/routing';
import { ArkaFullCard, ArkaGroupCard } from './ArkaCardTypes';

/**
 * Общее фото на категорию (как «КОФЕ» на timeless.club/menu/bar) — крупная
 * рамка под реальные пропорции фото (3:2, как у карточки «Кальян Барвиха»,
 * см. FeaturedItemCard), заголовок под фото обычным текстом, а не оверлеем
 * на градиенте — на светлых/контрастных кадрах оверлей плохо читался и
 * выглядел баннером, а не частью карточки. Показывается только когда для
 * категории есть кадр в groupPhotos; иначе — обычный <h2>.
 */
function CategoryPhoto({ category, photo }: { category: string; photo: PhotoEntry }) {
  return (
    <>
      <div className="relative mb-5 aspect-[4/3] w-full overflow-hidden rounded-[var(--cm-card-radius,16px)] bg-[var(--cm-surface)]">
        <Image
          src={photo.src}
          alt={category}
          fill
          sizes="(max-width: 640px) 100vw, 800px"
          className="object-cover"
          style={{
            objectPosition: photo.position ? `${photo.position.x}% ${photo.position.y}%` : undefined,
            transform: photoTransformCss(photo.transform),
          }}
        />
      </div>
      <h2 className="mb-4 font-[family-name:var(--font-display)] text-[32px] font-semibold uppercase leading-none tracking-[0.02em] text-[var(--cm-accent)]">
        {category}
      </h2>
    </>
  );
}

function CategoryBlock({
  category,
  items,
  locationSlug,
  groupPhotos,
  locale,
}: {
  category: string;
  items: ArkaMenuItem[];
  locationSlug: string;
  groupPhotos: Record<string, PhotoEntry>;
  locale: Locale;
}) {
  const type1 = items.filter((i) => i.type === 1);
  const type2 = items.filter((i) => i.type === 2);
  const groupPhoto = groupPhotos[category];

  return (
    <section className="py-5 first:pt-0">
      {groupPhoto ? (
        <CategoryPhoto category={category} photo={groupPhoto} />
      ) : (
        <h2 className="mb-4 border-b border-[var(--cm-border)] pb-2 font-[family-name:var(--font-display)] text-[24px] font-semibold uppercase leading-none tracking-[0.04em] text-[var(--cm-accent)]">
          {category}
        </h2>
      )}

      {type1.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
          {type1.map((it, i) => (
            <ArkaFullCard key={`${it.name}-${i}`} item={it} locationSlug={locationSlug} locale={locale} />
          ))}
        </div>
      )}

      {type1.length > 0 && type2.length > 0 && <div className="my-7 h-px w-full bg-[var(--cm-border)]" />}

      {type2.length > 0 && <ArkaGroupCard items={type2} locationSlug={locationSlug} locale={locale} />}
    </section>
  );
}

export function ArkaMenuSections({
  sections,
  locationSlug,
  groupPhotos,
  locale,
}: {
  sections: ArkaMenuEntry[];
  locationSlug: string;
  groupPhotos: Record<string, PhotoEntry>;
  locale: Locale;
}) {
  return (
    <div className="min-w-0">
      {sections.map((entry, idx) => {
        if (entry.kind === 'header') {
          return (
            <div key={idx} className="pt-6 pb-2 first:pt-0">
              <h2 className="font-[family-name:var(--font-display)] text-[32px] font-semibold uppercase leading-none tracking-[0.02em] text-[var(--cm-accent)]">
                {entry.title}
              </h2>
            </div>
          );
        }
        return (
          <CategoryBlock
            key={idx}
            category={entry.category}
            items={entry.items}
            locationSlug={locationSlug}
            groupPhotos={groupPhotos}
            locale={locale}
          />
        );
      })}
    </div>
  );
}
