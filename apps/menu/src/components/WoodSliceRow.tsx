'use client';

import { Link } from '@/i18n/navigation';

/**
 * Три деревянных «спила-бруска» — кнопки Кальяны / Кухня / Бар.
 * База, к которой вернулись: реалистичный срез из фото (slice.png), с
 * объёмом-торцом и тёплым цветом, ЗАПЕЧЁННЫМИ прямо в webp
 * (public/wood/slice-3d-*.webp). В рантайме НЕТ фильтров (blur/drop-shadow,
 * framer-motion) — именно они вешали GPU. Только дешёвый transform на hover.
 * Название — выжжено по дереву чётким клеймом.
 */
export interface WoodSliceItem {
  href: string;
  title: string;
}

interface Props {
  items: WoodSliceItem[];
  locationSlug?: string;
}

// запечённые варианты: торец + грейдинг + отражение уже внутри картинки
const SRC = ['/wood/slice-3d-0.webp', '/wood/slice-3d-1.webp', '/wood/slice-3d-2.webp'];

export function WoodSliceRow({ items }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-3xl items-end justify-center gap-3 px-1 sm:gap-6 sm:px-4">
      {items.slice(0, 3).map((it, i) => (
        <Link
          key={it.href}
          href={it.href}
          prefetch
          aria-label={it.title}
          className="group relative flex w-1/3 flex-col items-center focus:outline-none"
        >
          <div className="relative w-full transition-transform duration-200 ease-out group-hover:scale-[1.04] group-active:scale-[0.98]">
            {/* мягкая статичная тень-подложка: один радиальный градиент, без blur */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-[16%] bottom-[1%] h-[11%] rounded-[50%]"
              style={{
                background:
                  'radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.5), rgba(0,0,0,0) 70%)',
              }}
            />
            {/* сам спил — объёмный брусок, статичное фото */}
            <img
              src={SRC[i % SRC.length]}
              alt=""
              aria-hidden
              draggable={false}
              loading="lazy"
              className="relative block h-auto w-full select-none"
            />
            {/* название — выжжено по дереву (чёткое клеймо) */}
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              style={{ paddingBottom: '14%' }}
            >
              <span
                className="text-center uppercase"
                style={{
                  fontWeight: 800,
                  fontSize: 'clamp(11px, 3vw, 21px)',
                  letterSpacing: '0.08em',
                  color: '#24130a',
                  textShadow:
                    '0 1px 0 rgba(248,230,188,0.32), 0 0 1px rgba(15,8,3,1), 0 0 2px rgba(40,22,8,0.45)',
                }}
              >
                {it.title}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
