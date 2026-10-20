'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { PhotoEntry } from '@barviha/db';
import { thumbUrl } from '@/lib/thumb';
import { photoTransformCss } from '@/lib/photo-transform';
import { getTick, usePhotoTick, useReducedMotion } from '@/lib/photo-ticker';

/** Длительность растворения — долгая, «как в презентации», но короче тика. */
const FADE_MS = 2200;

/**
 * Фото в карточке списка, когда у позиции их несколько. Все карточки на
 * экране переключаются строго одновременно по общему тику (photo-ticker,
 * раз в 4 с, и только когда гость не листает), переход — медленное
 * растворение на чистом CSS (opacity), без движения и масштаба.
 *
 * Слои стопкой, все непрозрачные: текущий кадр (z2) и под ним следующий
 * (z1, уже загружен). Уходящий кадр (z3) лежит СВЕРХУ и медленно гаснет —
 * так в середине перехода не просвечивает фон и картинка не темнеет, один
 * кадр просто растворяется в другом. Карточка вне экрана замирает на своём
 * кадре и ничего не делает. Превью .w720 вместо оригиналов. При
 * prefers-reduced-motion — статичная обложка.
 */
export function CardPhotoCarousel({ photos, alt, sizes }: { photos: PhotoEntry[]; alt: string; sizes: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  // Кадр, на котором карточку оставили, когда она ушла с экрана.
  const [frozen, setFrozen] = useState(0);
  const reduced = useReducedMotion();
  const tick = usePhotoTick();
  const n = photos.length;

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([e]) => {
        const v = !!e?.isIntersecting;
        if (!v) setFrozen(getTick() % n);
        setVisible(v);
      },
      { threshold: 0.35, rootMargin: '80px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [n]);

  const live = visible && !reduced && n > 1;
  const cur = live ? tick % n : frozen % n;
  const prev = (cur - 1 + n) % n;
  const next = (cur + 1) % n;
  const layers: { i: number; z: number; fading: boolean }[] = [{ i: cur, z: 2, fading: false }];
  if (live) {
    if (prev !== cur) layers.push({ i: prev, z: 3, fading: true });
    if (next !== cur && next !== prev) layers.push({ i: next, z: 1, fading: false });
  }
  // Порядок в DOM — всегда по номеру кадра, стопку задаёт z-index. Если React
  // переставит узел (insertBefore), браузер оборвёт CSS-переход, и уходящий
  // кадр исчезнет рывком вместо плавного растворения.
  layers.sort((a, b) => a.i - b.i);

  const style = (p: PhotoEntry): React.CSSProperties => ({
    filter: 'var(--cm-photo, none)',
    objectPosition: p.position ? `${p.position.x}% ${p.position.y}%` : 'center 35%',
    transform: photoTransformCss(p.transform),
  });

  return (
    <div ref={ref} className="absolute inset-0">
      {layers.map(({ i, z, fading }) => {
        const p = photos[i]!;
        return (
          <div
            key={p.src}
            className="absolute inset-0"
            style={{
              zIndex: z,
              opacity: fading ? 0 : 1,
              // гаснет только уходящий кадр; новый слой под текущим появляется без анимации
              transition: fading ? `opacity ${FADE_MS}ms ease-in-out` : 'none',
              willChange: 'opacity',
            }}
          >
            <Image
              src={thumbUrl(p.src)!}
              alt={fading ? '' : alt}
              fill
              sizes={sizes}
              aria-hidden={fading}
              draggable={false}
              style={style(p)}
              className="object-cover"
            />
          </div>
        );
      })}
      {n > 1 && (
        <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
          {photos.map((p, i) => (
            <span
              key={p.src + i}
              className={`h-1 rounded-full bg-white transition-all duration-1000 ${i === cur ? 'w-3 opacity-90' : 'w-1 opacity-50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
