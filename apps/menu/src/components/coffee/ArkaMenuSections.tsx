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
import { ArkaFullCard, ArkaGroupCard } from './ArkaCardTypes';

/**
 * Общее фото на категорию (как «КОФЕ» на timeless.club/menu/bar) — заголовок
 * не отдельной строкой, а поверх фото, крупно, капсом. Показывается только
 * когда для категории есть кадр в groupPhotos; иначе — обычный <h2>.
 */
function CategoryPhoto({ category, photo }: { category: string; photo: PhotoEntry }) {
  return (
    <div className="relative mb-5 aspect-[16/9] w-full overflow-hidden rounded-[var(--cm-card-radius,16px)] bg-[var(--cm-surface)]">
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
      <h2 className="absolute bottom-4 left-5 font-[family-name:var(--font-display)] text-[30px] font-semibold uppercase leading-none tracking-[0.03em] text-white sm:bottom-6 sm:left-7 sm:text-[42px]">
        {category}
      </h2>
    </div>
  );
}

/** Единственная категория, у которой подпись не на фото, а под ним, стилем
 * заголовка «Винная карта» — по прямой просьбе, не трогать остальные. */
const CAPTION_BELOW_PHOTO = 'Игристые и шампанские вина';

function CategoryBlock({
  category,
  items,
  locationSlug,
  groupPhotos,
}: {
  category: string;
  items: ArkaMenuItem[];
  locationSlug: string;
  groupPhotos: Record<string, PhotoEntry>;
}) {
  const type1 = items.filter((i) => i.type === 1);
  const type2 = items.filter((i) => i.type === 2);
  const groupPhoto = groupPhotos[category];

  return (
    <section className="py-5 first:pt-0">
      {groupPhoto && category === CAPTION_BELOW_PHOTO ? (
        <>
          <div className="relative mb-5 aspect-[16/9] w-full overflow-hidden rounded-[var(--cm-card-radius,16px)] bg-[var(--cm-surface)]">
            <Image
              src={groupPhoto.src}
              alt={category}
              fill
              sizes="(max-width: 640px) 100vw, 800px"
              className="object-cover"
              style={{
                objectPosition: groupPhoto.position ? `${groupPhoto.position.x}% ${groupPhoto.position.y}%` : undefined,
                transform: photoTransformCss(groupPhoto.transform),
              }}
            />
          </div>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-[32px] font-semibold uppercase leading-none tracking-[0.02em] text-[var(--cm-accent)]">
            {category}
          </h2>
        </>
      ) : groupPhoto ? (
        <CategoryPhoto category={category} photo={groupPhoto} />
      ) : (
        <h2 className="mb-4 border-b border-[var(--cm-border)] pb-2 font-[family-name:var(--font-display)] text-[24px] font-semibold uppercase leading-none tracking-[0.04em] text-[var(--cm-accent)]">
          {category}
        </h2>
      )}

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

export function ArkaMenuSections({
  sections,
  locationSlug,
  groupPhotos,
}: {
  sections: ArkaMenuEntry[];
  locationSlug: string;
  groupPhotos: Record<string, PhotoEntry>;
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
          />
        );
      })}
    </div>
  );
}
