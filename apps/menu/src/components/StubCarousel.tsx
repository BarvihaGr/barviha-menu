'use client';

import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarCheck, X } from 'lucide-react';
import { PromoCard, type PromoCardData } from './PromoCard';

export interface StubCard {
  /** Кодовая карточка-афиша (рисуется в коде, не картинкой). */
  card: PromoCardData;
  /** Альт/подпись для доступности. */
  alt: string;
  /** Заголовок в модалке (необязательно). */
  title?: string;
  /** Короткая подпись под заголовком в модалке (необязательно). */
  subtitle?: string;
  /** Ссылка брони. Если задана — в модалке показываем кнопку «Забронировать стол». */
  bookingUrl?: string;
  /** Ссылки на соцсети. Если заданы — в модалке показываем кнопки перехода. */
  links?: Array<{ label: string; href: string }>;
}

/** Все карточки одного формата — горизонтальный баннер 16:9. */
const CARD_ASPECT = '16 / 9';

interface Props {
  /** Карточки слева-направо. */
  items: StubCard[];
}

/**
 * Карусель карточек-спотлайтов: чёрные афиши с золотом, крутятся бесконечной
 * петлёй (rAF + нативный скролл), пауза при наведении/касании/открытой модалке,
 * гасится за вьюпортом. Тап по карточке (не свайп) открывает модалку анимацией
 * переворота: увеличенная афиша + призыв «Забронировать стол» (Restoplace).
 */
export function StubCarousel({ items }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const visibleRef = useRef(true);
  const activeRef = useRef(false);
  // Для отличия тапа от свайпа: запоминаем старт и факт движения пальца/курсора.
  const downXRef = useRef(0);
  const movedRef = useRef(false);
  const [reps, setReps] = useState(4);
  const [active, setActive] = useState<StubCard | null>(null);

  const loop = items.length > 0 ? Array.from({ length: reps }).flatMap(() => items) : [];

  // Пауза авто-скролла, пока открыта модалка.
  useEffect(() => {
    activeRef.current = !!active;
  }, [active]);

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
      if (!pausedRef.current && visibleRef.current && !activeRef.current) {
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
    <>
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
        onPointerDown={(e) => {
          downXRef.current = e.clientX;
          movedRef.current = false;
        }}
        onPointerMove={(e) => {
          if (Math.abs(e.clientX - downXRef.current) > 8) movedRef.current = true;
        }}
      >
        {loop.map((item, i) => (
          <button
            type="button"
            key={`${item.alt}-${i}`}
            aria-label={item.title ?? item.alt}
            onClick={() => {
              if (movedRef.current) return; // это был свайп, не тап
              setActive(item);
            }}
            className="group relative h-[158px] shrink-0 cursor-pointer overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:h-[192px]"
            style={{ aspectRatio: CARD_ASPECT }}
          >
            <PromoCard card={item.card} />
          </button>
        ))}
      </div>

      {/* Модалка с переворотом: афиша крупно + призыв забронировать */}
      <Dialog.Root open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <AnimatePresence>
          {active && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm"
                />
              </Dialog.Overlay>
              <Dialog.Content asChild aria-describedby={undefined} onOpenAutoFocus={(e) => e.preventDefault()}>
                <motion.div
                  initial={{ opacity: 0, rotateY: -105, x: '-50%', y: '-50%', scale: 0.92 }}
                  animate={{ opacity: 1, rotateY: 0, x: '-50%', y: '-50%', scale: 1 }}
                  exit={{ opacity: 0, rotateY: 105, x: '-50%', y: '-50%', scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                  style={{ transformPerspective: 1400 }}
                  className="fixed left-1/2 top-1/2 z-[90] w-[min(430px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gold/40 bg-[#0c0805] shadow-2xl"
                >
                  {/* Афиша (кодовая карточка) */}
                  <div className="relative w-full" style={{ aspectRatio: CARD_ASPECT }}>
                    <PromoCard card={active.card} />
                  </div>

                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Закрыть"
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white/90 transition hover:text-gold cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </Dialog.Close>

                  <div className="flex flex-col gap-3 p-5">
                    {active.title && (
                      <Dialog.Title className="font-[family-name:var(--font-display)] text-lg font-semibold leading-tight text-cream">
                        {active.title}
                      </Dialog.Title>
                    )}
                    {active.subtitle && (
                      <p className="text-sm leading-snug text-muted">{active.subtitle}</p>
                    )}
                    {active.links && active.links.length > 0 && (
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        {active.links.map((l) => (
                          <a
                            key={l.label}
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 rounded-xl border border-gold/45 bg-black/30 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-gold transition hover:border-gold hover:bg-black/50 cursor-pointer"
                          >
                            {l.label}
                          </a>
                        ))}
                      </div>
                    )}
                    {active.bookingUrl && (
                      <a
                        href={active.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-semibold uppercase tracking-[0.14em] text-black transition hover:brightness-110 cursor-pointer"
                      >
                        <CalendarCheck size={17} strokeWidth={2} />
                        Забронировать стол
                      </a>
                    )}
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </>
  );
}
