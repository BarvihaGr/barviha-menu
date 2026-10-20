'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { PhotoEntry } from '@barviha/db';
import { thumbUrl } from '@/lib/thumb';
import { photoTransformCss } from '@/lib/photo-transform';
import { getTick, usePhotoTick, useReducedMotion } from '@/lib/photo-ticker';

/** Длительность кросс-фейда — заметно дольше, чем «щелчок», но короче тика. */
const FADE_MS = 1400;

/**
 * Фото в карточке списка, когда у позиции их несколько. Все карточки на
 * экране переключаются строго одновременно по общему тику (photo-ticker,
 * раз в 2 с), переход — мягкий кросс-фейд на чистом CSS (opacity), без
 * движения и масштаба. Карточка вне экрана замирает на текущем кадре и не
 * тратит ресурсы. В DOM одновременно не больше трёх слоёв: уходящий кадр,
 * текущий и следующий (заранее подгружен, чтобы смена была без «моргания»).
 * Превью .w720 вместо оригиналов. При prefers-reduced-motion — статичная обложка.
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

  // Слои: текущий кадр (opacity 1), уходящий (opacity 0, с переходом) и
  // следующий (opacity 0, под текущим — чтобы уже лежал загруженный).
  const prev = (cur - 1 + n) % n;
  const next = (cur + 1) % n;
  const layers: { i: number; z: number; shown: boolean }[] = [{ i: cur, z: 2, shown: true }];
  if (live) {
    if (prev !== cur) layers.push({ i: prev, z: 3, shown: false });
    if (next !== cur && next !== prev) layers.push({ i: next, z: 1, shown: false });
  }

  return (
    <div ref={ref} className="absolute inset-0">
      {layers.map(({ i, z, shown }) => {
        const p = photos[i]!;
        return (
          <div
            key={p.src}
            className="absolute inset-0"
            style={{
              zIndex: z,
              opacity: shown ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease-in-out`,
              willChange: 'opacity',
            }}
          >
            <Image
              src={thumbUrl(p.src)!}
              alt={shown ? alt : ''}
              fill
              sizes={sizes}
              aria-hidden={!shown}
              draggable={false}
              style={{
                filter: 'var(--cm-photo, none)',
                objectPosition: p.position ? `${p.position.x}% ${p.position.y}%` : 'center 35%',
                transform: photoTransformCss(p.transform),
              }}
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
              className={`h-1 rounded-full bg-white transition-all duration-700 ${i === cur ? 'w-3 opacity-90' : 'w-1 opacity-50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
