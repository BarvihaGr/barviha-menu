'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { PhotoEntry } from '@barviha/db';
import { thumbUrl } from '@/lib/thumb';
import { photoTransformCss } from '@/lib/photo-transform';
import { useScrollIdle } from '@/lib/use-scroll-idle';

/** Пауза между кадрами в карточке списка. */
const STEP_MS = 2600;

/**
 * Фото в карточке списка, когда у позиции их несколько: гость остановил
 * скролл, карточка на экране — через пару секунд кадр мягко сменяется на
 * следующий (кросс-фейд), и так по кругу. Пока листают или карточка не видна —
 * стоит на месте. Грузятся только текущий и следующий кадр (превью .w720),
 * остальные подтягиваются по мере показа. Уважает prefers-reduced-motion.
 */
export function CardPhotoCarousel({ photos, alt, sizes }: { photos: PhotoEntry[]; alt: string; sizes: string }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const idle = useScrollIdle();
  // Небольшой разнобой между карточками, чтобы весь экран не переключался в такт
  // (считается в эффекте: в рендере случайные числа запрещены React Compiler).
  const offsetRef = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting), { threshold: 0.7 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !idle || photos.length < 2) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (offsetRef.current === null) offsetRef.current = Math.floor(Math.random() * 900);
    const id = setTimeout(() => setIndex((i) => (i + 1) % photos.length), STEP_MS + offsetRef.current);
    // после первого шага разнобой больше не нужен
    offsetRef.current = 0;
    return () => clearTimeout(id);
  }, [visible, idle, index, photos.length]);

  const active = photos[index % photos.length]!;
  const next = photos.length > 1 ? photos[(index + 1) % photos.length]! : null;

  const style = (p: PhotoEntry): React.CSSProperties => ({
    filter: 'var(--cm-photo, none)',
    objectPosition: p.position ? `${p.position.x}% ${p.position.y}%` : 'center 35%',
    transform: photoTransformCss(p.transform),
  });

  return (
    <div ref={ref} className="absolute inset-0">
      {/* следующий кадр — под текущим, невидимый: подгружается заранее, смена без «моргания» */}
      {next && next.src !== active.src && (
        <Image
          key={`pre-${next.src}`}
          src={thumbUrl(next.src)!}
          alt=""
          fill
          sizes={sizes}
          aria-hidden
          style={{ ...style(next), opacity: 0 }}
          className="object-cover"
        />
      )}
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={active.src}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <Image
            src={thumbUrl(active.src)!}
            alt={alt}
            fill
            sizes={sizes}
            style={style(active)}
            className="object-cover transition duration-500 group-hover:scale-[1.05]"
          />
        </motion.div>
      </AnimatePresence>
      {/* точки — сколько фото и какое сейчас */}
      <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
        {photos.map((p, i) => (
          <span
            key={p.src + i}
            className={`h-1 rounded-full bg-white transition-all duration-300 ${i === index % photos.length ? 'w-3 opacity-90' : 'w-1 opacity-50'}`}
          />
        ))}
      </div>
    </div>
  );
}
