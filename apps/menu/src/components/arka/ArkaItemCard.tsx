import Image from 'next/image';
import type { ResolvedMenuItem } from '@barviha/db';
import { formatPrice, capitalizeRu } from '@/lib/utils';
import { photoTransformCss } from '@/lib/photo-transform';

interface Props {
  item: ResolvedMenuItem;
  name: string;
  description: string | null;
}

/**
 * Карточка позиции Арки — острые углы, фото/название/описание/цена, без
 * кнопки «в корзину» (у Timeless меню — витрина для чтения за столом, не
 * магазин). Своя реализация, не CoffeeItemCard.
 */
export function ArkaItemCard({ item, name, description }: Props) {
  const displayName = capitalizeRu(name.replace(/,.*$/, ''));
  const weightStr = item.weight != null ? `${item.weight} г` : null;

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--arka-surface)]">
        {item.photo ? (
          <Image
            src={item.photo}
            alt={displayName}
            fill
            sizes="(max-width: 640px) 50vw, 33vw"
            style={{
              objectPosition: item.photo_position ? `${item.photo_position.x}% ${item.photo_position.y}%` : 'center 35%',
              transform: photoTransformCss(item.photo_transform),
            }}
            className="object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-3xl text-[var(--arka-muted-dim)]">
            ◍
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <h3
          className="text-[13px] uppercase leading-snug tracking-[0.04em] text-[var(--arka-text)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {displayName}
        </h3>

        {description && (
          <p className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-[var(--arka-muted)]">
            {description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
          <span className="text-[10.5px] text-[var(--arka-muted-dim)]">{weightStr ?? ''}</span>
          <span className="text-[13.5px] font-medium text-[var(--arka-accent)]">
            {formatPrice(item.price)}
          </span>
        </div>
      </div>
    </article>
  );
}
