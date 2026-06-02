'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AtSign,
  BadgePercent,
  Disc3,
  Gift,
  Globe,
  Instagram,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { Spotlight, SpotlightKind, SpotlightLink, SpotlightLinkKind } from '@barviha/db';
import type { Locale } from '@/i18n/routing';

interface Props {
  spotlights: Spotlight[];
  /** Акцентный цвет локации — дефолт для слайдов без своего accent. */
  accent: string;
}

const KIND_ICON: Record<SpotlightKind, LucideIcon> = {
  dj: Disc3,
  promo: BadgePercent,
  offer: Gift,
  social: AtSign,
  event: Sparkles,
};

const LINK_ICON: Record<SpotlightLinkKind, LucideIcon> = {
  instagram: Instagram,
  telegram: Send,
  vk: Globe,
  whatsapp: MessageCircle,
  web: Globe,
  phone: Phone,
};

const LINK_LABEL: Record<SpotlightLinkKind, string> = {
  instagram: 'Instagram',
  telegram: 'Telegram',
  vk: 'VK',
  whatsapp: 'WhatsApp',
  web: 'Сайт',
  phone: 'Позвонить',
};

function pick<F extends 'title' | 'subtitle' | 'body' | 'badge' | 'when'>(
  s: Spotlight,
  field: F,
  locale: Locale,
): string | null | undefined {
  if (locale === 'en') return s[`${field}_en`] ?? s[field];
  if (locale === 'zh') return s[`${field}_zh`] ?? s[field];
  if (locale === 'hy') return s[`${field}_hy`] ?? s[field];
  return s[field];
}

/**
 * Крутящаяся карусель «спотлайтов» под меню: DJ-сеты, акции, соцсети.
 *
 * Поведение:
 *  - бесконечная авто-прокрутка по кругу (rAF + нативный скролл, без лагов);
 *  - пауза при наведении / касании, возобновление через паузу;
 *  - свайп влево-вправо пальцем (нативный overflow-scroll);
 *  - тап по карточке (не свайп) открывает красивую модалку с деталями.
 *
 * Эффект «дока MacBook» (увеличение под курсором) — задел на потом; сейчас
 * простая лента. Список дублируется ×2 для бесшовной петли.
 */
export function SpotlightCarousel({ spotlights, accent }: Props) {
  const locale = useLocale() as Locale;
  const t = useTranslations('spotlight');
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const movedRef = useRef(false);
  const startXRef = useRef(0);
  const visibleRef = useRef(true);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState<Spotlight | null>(null);

  // Дублируем список — для бесшовной петли (две одинаковые половины).
  const loop = spotlights.length > 0 ? [...spotlights, ...spotlights] : [];

  const pause = () => {
    pausedRef.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  };
  const resumeSoon = (delay = 1600) => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false;
    }, delay);
  };

  // Авто-прокрутка. Пауза при interaction, при открытой модалке и когда
  // карусель вне экрана (ушли вниз к меню) — чтобы не жечь кадры впустую.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || loop.length === 0) return;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    // Гасим авто-скролл, когда карусели не видно во вьюпорте.
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry?.isIntersecting ?? true;
      },
      { threshold: 0 },
    );
    io.observe(el);

    const SPEED = 28; // px/сек — спокойный «кинопоказ»
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      // scrollLeft трогаем ТОЛЬКО в режиме авто-скролла — чтобы не воевать
      // с нативной инерцией свайпа на iOS (иначе рывки).
      if (!pausedRef.current && !active && visibleRef.current) {
        el.scrollLeft += SPEED * dt;
        // Бесшовная петля: одна половина = ширина первого набора.
        const half = el.scrollWidth / 2;
        if (half > 0) {
          if (el.scrollLeft >= half) el.scrollLeft -= half;
          else if (el.scrollLeft < 0) el.scrollLeft += half;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [loop.length, active]);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  if (spotlights.length === 0) return null;

  return (
    <>
      <div
        ref={scrollerRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 py-1"
        onMouseEnter={pause}
        onMouseLeave={() => resumeSoon(400)}
        onPointerDown={(e) => {
          pause();
          movedRef.current = false;
          startXRef.current = e.clientX;
        }}
        onPointerMove={(e) => {
          if (Math.abs(e.clientX - startXRef.current) > 8) movedRef.current = true;
        }}
        onPointerUp={() => resumeSoon()}
        onPointerCancel={() => resumeSoon()}
        onTouchStart={pause}
        onTouchEnd={() => resumeSoon()}
      >
        {loop.map((s, i) => {
          const Icon = KIND_ICON[s.kind] ?? Sparkles;
          const a = s.accent ?? accent;
          const title = pick(s, 'title', locale) ?? '';
          const subtitle = pick(s, 'subtitle', locale);
          const badge = pick(s, 'badge', locale);
          return (
            <button
              type="button"
              key={`${s.id}-${i}`}
              aria-label={title}
              onClick={() => {
                if (movedRef.current) return; // это был свайп, не тап
                setActive(s);
              }}
              className="group relative shrink-0 w-[230px] sm:w-[270px] aspect-[9/8] overflow-hidden rounded-lg border border-gold/25 text-left transition-transform duration-300 hover:scale-[1.03] hover:border-gold/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {/* Фон: фото или градиент по акценту */}
              {s.image ? (
                <Image
                  src={s.image}
                  alt=""
                  fill
                  sizes="270px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(150deg, ${a}, #1B110A 75%)` }}
                />
              )}
              {/* Затемнение для читаемости + замена brightness-фильтра (дешевле
                  при прокрутке: композитится, а не перерисовывает картинку). */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/55" />
              {/* Тонкая акцентная полоска сверху */}
              <div
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{ background: a, boxShadow: `0 0 12px ${a}` }}
              />

              {/* Верх: иконка типа + бейдж */}
              <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-gold"
                  style={{ color: a }}
                >
                  <Icon size={17} strokeWidth={1.7} />
                </span>
                {badge && (
                  <span
                    className="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-black"
                    style={{ background: a, borderColor: a }}
                  >
                    {badge}
                  </span>
                )}
              </div>

              {/* Низ: заголовок + подзаголовок + хинт */}
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-3">
                <span className="text-[10px] uppercase tracking-[0.25em]" style={{ color: a }}>
                  {t(`kind.${s.kind}`)}
                </span>
                <h3 className="font-[family-name:var(--font-display)] text-base font-semibold leading-tight text-white drop-shadow">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs leading-snug text-white/75 line-clamp-1">{subtitle}</p>
                )}
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-gold/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {t('more')} →
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Модалка с деталями спотлайта */}
      <Dialog.Root open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <AnimatePresence>
          {active && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="fixed inset-0 z-[80] bg-black/75"
                />
              </Dialog.Overlay>
              <Dialog.Content
                asChild
                aria-describedby={undefined}
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <motion.div
                  initial={{ opacity: 0, x: '-50%', y: 'calc(-50% + 16px)', scale: 0.96 }}
                  animate={{ opacity: 1, x: '-50%', y: '-50%', scale: 1 }}
                  exit={{ opacity: 0, x: '-50%', y: 'calc(-50% + 16px)', scale: 0.96 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="fixed left-1/2 top-1/2 z-[90] w-[min(440px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-gold bg-card shadow-2xl"
                >
                  <SpotlightModalBody
                    spotlight={active}
                    accent={active.accent ?? accent}
                    locale={locale}
                    t={t}
                  />
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </>
  );
}

function SpotlightModalBody({
  spotlight: s,
  accent,
  locale,
  t,
}: {
  spotlight: Spotlight;
  accent: string;
  locale: Locale;
  t: ReturnType<typeof useTranslations>;
}) {
  const Icon = KIND_ICON[s.kind] ?? Sparkles;
  const title = pick(s, 'title', locale) ?? '';
  const subtitle = pick(s, 'subtitle', locale);
  const body = pick(s, 'body', locale);
  const when = pick(s, 'when', locale);
  const links = (s.links ?? []).filter((l) => l.href && l.href !== '#');

  return (
    <>
      {/* Шапка-картинка */}
      <div className="relative h-40 w-full overflow-hidden">
        {s.image ? (
          <Image src={s.image} alt="" fill sizes="440px" className="object-cover" style={{ filter: 'brightness(0.7)' }} />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(150deg, ${accent}, #1B110A 80%)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <Dialog.Close asChild>
          <button
            type="button"
            aria-label={t('close')}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/90 transition hover:text-gold cursor-pointer"
          >
            <X size={16} />
          </button>
        </Dialog.Close>
        <div className="absolute left-4 bottom-3 flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40"
            style={{ color: accent }}
          >
            <Icon size={17} strokeWidth={1.7} />
          </span>
          <span className="text-[10px] uppercase tracking-[0.25em]" style={{ color: accent }}>
            {t(`kind.${s.kind}`)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-6 pt-4">
        <Dialog.Title className="font-[family-name:var(--font-display)] text-xl font-semibold leading-tight text-cream">
          {title}
        </Dialog.Title>
        {subtitle && <p className="text-sm text-foreground/90 leading-snug">{subtitle}</p>}

        {when && (
          <div
            className="inline-flex w-fit items-center gap-2 rounded-sm border px-3 py-1.5 text-xs"
            style={{ borderColor: accent, color: accent }}
          >
            {when}
          </div>
        )}

        {body && <p className="text-sm text-muted leading-relaxed">{body}</p>}

        {links.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {links.map((l, i) => (
              <LinkButton key={i} link={l} accent={accent} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function LinkButton({ link, accent }: { link: SpotlightLink; accent: string }) {
  const Icon = LINK_ICON[link.kind] ?? Globe;
  const label = link.label ?? LINK_LABEL[link.kind] ?? link.kind;
  const isTel = link.kind === 'phone';
  return (
    <a
      href={isTel ? `tel:${link.href.replace(/[^+\d]/g, '')}` : link.href}
      target={isTel ? undefined : '_blank'}
      rel={isTel ? undefined : 'noopener noreferrer'}
      className="inline-flex items-center gap-2 rounded-sm border border-[color:var(--border)] bg-background/40 px-3.5 py-2 text-xs text-foreground transition hover:border-gold cursor-pointer"
      style={{ ['--tw-ring-color' as string]: accent }}
    >
      <Icon size={15} style={{ color: accent }} />
      {label}
    </a>
  );
}
