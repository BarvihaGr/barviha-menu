'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export interface StubCard {
  /** Путь к картинке-карточке в /public. */
  src: string;
  /** Альт для доступности. */
  alt: string;
  /** Как вписывать: 'cover' для карточек 16:9, 'contain' для широких баннеров. */
  fit?: 'cover' | 'contain';
}

interface Props {
  /** Карточки слева-направо. */
  items: StubCard[];
}

/**
 * Временная заглушка вместо карусели спотлайтов: чёрные карточки с золотой
 * надписью, крутятся бесконечной петлёй (rAF + нативный скролл), пауза при
 * наведении/касании, гасится когда уезжает из вьюпорта. Без модалок и драга —
 * только лента. Удалить вместе с возвратом SpotlightCarousel.
 */
export function StubCarousel({ items }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const visibleRef = useRef(true);
  const [reps, setReps] = useState(4);

  const loop = items.length > 0 ? Array.from({ length: reps }).flatMap(() => items) : [];

  // Бесконечная авто-прокрутка (период = ширина одного набора).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || loop.length === 0) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );
    io.observe(el);

    const SPEED = 42; // px/сек — спокойное движение
    let raf = 0;
    let last = performance.now();
    let pos = el.scrollLeft; // float-аккумулятор (моб. scrollLeft целочисленный)

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      if (!pausedRef.current && visibleRef.current) {
        pos += SPEED * dt;
        const period = el.scrollWidth / reps;
        if (period > 0) {
          if (pos >= period) pos -= period;
          else if (pos < 0) pos += period;
        }
        el.scrollLeft = pos;
      } else {
        pos = el.scrollLeft;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [loop.length, reps]);

  // Подбираем число повторов, чтобы лента всегда была шире контейнера.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || items.length === 0) return;
    const measure = () => {
      const oneSet = el.scrollWidth / reps;
      if (!oneSet || !el.clientWidth) return;
      const needed = Math.min(8, Math.max(2, Math.ceil(el.clientWidth / oneSet) + 1));
      if (needed !== reps) setReps(needed);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [reps, items.length]);

  if (items.length === 0) return null;

  return (
    <div
      ref={scrollerRef}
      className="no-scrollbar flex select-none gap-3 overflow-x-auto px-4 py-1 sm:gap-4 sm:px-6"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      onTouchStart={() => {
        pausedRef.current = true;
      }}
      onTouchEnd={() => {
        pausedRef.current = false;
      }}
    >
      {loop.map((item, i) => (
        <div
          key={`${item.src}-${i}`}
          className="relative aspect-[16/9] w-[280px] shrink-0 overflow-hidden rounded-2xl bg-[#0a0705] shadow-[0_8px_24px_rgba(0,0,0,0.55)] sm:w-[340px]"
        >
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="(max-width: 640px) 280px, 340px"
            className={item.fit === 'contain' ? 'object-contain' : 'object-cover'}
          />
        </div>
      ))}
    </div>
  );
}
