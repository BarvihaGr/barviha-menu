'use client';

/**
 * Витрина концептов главной страницы Arca.
 *
 * Отдельная «песочница» (НЕ трогает прод-главную) — открывается по
 * /ru/concepts. Пять самостоятельных вариантов редизайна home-экрана,
 * собранных по дизайн-брифу «тяжёлый люкс, который смотрится легко»:
 * рекламная строка, навигация по категориям и кнопки решены по-разному
 * в каждом концепте. Переключение — вкладками сверху.
 *
 * Все ассеты — настоящие (hero.mp4, logo-tree, спилы, фото блюд),
 * чтобы оценивать визуал «как в бою», а не на заглушках.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowUpRight, ChevronRight, Disc3, Flame, Sparkles } from 'lucide-react';

// ── Общие данные ───────────────────────────────────────────────
const HERO = {
  video: '/locations/arka/hero.mp4',
  poster: '/locations/arka/poster.jpg',
  logo: '/locations/arka/logo-tree.png',
};

const NAME = 'Arca';
const CITY = 'BARVIKHA · RUBLYOVO';

interface Cat {
  title: string;
  n: string;
  count: number;
  img: string;
  slice: string;
}
const CATS: Cat[] = [
  { title: 'Кальянная', n: '01', count: 18, img: '/menu/hookah-hookah-old-money.webp', slice: '/wood/slice-3d-0.webp' },
  {
    title: 'Кухня',
    n: '02',
    count: 64,
    img: '/menu/kitchen-hot-goviazhi-rebra-kopchenye-s-sousom-iz-elovyh-shis.webp',
    slice: '/wood/slice-3d-1.webp',
  },
  { title: 'Бар', n: '03', count: 120, img: '/menu/bar-cocktails-old-fashioned.webp', slice: '/wood/slice-3d-2.webp' },
];

interface Ev {
  eyebrow: string;
  title: string;
  when: string;
  img: string;
}
const EVENTS: Ev[] = [
  { eyebrow: 'СЕГОДНЯ', title: 'DJ Veronika — Deep Set', when: 'ПТ · 22:00', img: '/menu-photos/p3.webp' },
  { eyebrow: 'УЖИН', title: 'Сет-дегустация шефа', when: 'СБ · 20:00', img: '/menu-photos/p5.webp' },
  { eyebrow: 'ЛАУНЖ', title: 'Старая школа: виски & сигары', when: 'ВС · 19:00', img: '/menu-photos/p1.webp' },
];

// ── Каркас телефона ────────────────────────────────────────────
function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[390px] max-w-full">
      <div
        className="relative overflow-hidden rounded-[2.6rem] border border-[#3a2a1d] bg-[#160C06]"
        style={{ height: '800px', boxShadow: '0 40px 90px -25px rgba(0,0,0,0.85), inset 0 0 0 2px rgba(0,0,0,0.6)' }}
      >
        {/* динамик */}
        <div className="pointer-events-none absolute left-1/2 top-2.5 z-50 h-1.5 w-24 -translate-x-1/2 rounded-full bg-black/70" />
        <div className="no-scrollbar h-full overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}

function HeroVideo({ className = '', poster = true }: { className?: string; poster?: boolean }) {
  return (
    <video
      className={className}
      src={HERO.video}
      poster={poster ? HERO.poster : undefined}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
    />
  );
}

// ════════════════════════════════════════════════════════════════
//  A. CINEMATIC MINIMAL
// ════════════════════════════════════════════════════════════════
function ConceptCinematic() {
  return (
    <div className="min-h-full bg-[#1B110A] pb-10">
      {/* HERO: full-bleed видео, имя низом-слева, edge-CTA */}
      <section className="relative h-[62%] min-h-[470px] w-full overflow-hidden">
        <HeroVideo className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B110A] via-[#1B110A]/20 to-transparent" />
        <div className="absolute inset-x-0 top-0 flex justify-center pt-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HERO.logo} alt="" className="h-16 w-auto opacity-95 drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)]" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-7">
          <div className="text-[10px] uppercase tracking-[0.4em] text-[#C49262]">{CITY}</div>
          <h1
            className="mt-1 leading-[0.95] text-[#F4E9D5]"
            style={{ fontFamily: 'var(--font-display)', fontSize: '58px', letterSpacing: '-0.02em', fontWeight: 500 }}
          >
            {NAME}
          </h1>
          <div className="mt-4 inline-flex items-center gap-2 border-b border-[#C49262]/60 pb-1 text-[12px] uppercase tracking-[0.28em] text-[#F4E9D5]/90">
            Смотреть меню <ArrowRight size={13} className="text-[#C49262]" />
          </div>
        </div>
      </section>

      {/* PROMO: бегущая строка-маркиза под золотой линией */}
      <section className="mt-1 border-y border-[#C49262]/25 bg-[#160C06] py-3">
        <div className="relative overflow-hidden">
          <motion.div
            className="flex shrink-0 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
          >
            {[0, 1].map((dup) => (
              <span key={dup} className="flex items-center">
                {EVENTS.map((e, i) => (
                  <span key={i} className="flex items-center text-[11px] uppercase tracking-[0.3em] text-[#F4E9D5]/75">
                    <span className="mx-4 text-[#C49262]">✦</span>
                    <span className="text-[#C49262]">{e.eyebrow}</span>
                    <span className="mx-2">·</span>
                    {e.title}
                    <span className="mx-2 text-[#C49262]/60">{e.when}</span>
                  </span>
                ))}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* NAV: нумерованный серифный список 01/02/03 с волосяными линиями */}
      <section className="px-6 pt-7">
        <div className="mb-2 text-[10px] uppercase tracking-[0.4em] text-[#C49262]/70">Меню</div>
        <ul>
          {CATS.map((c, i) => (
            <li key={c.title}>
              <button
                className="group flex w-full items-center gap-4 border-t border-[#C49262]/15 py-5 text-left"
                style={{ paddingLeft: i === 1 ? '14px' : 0 }}
              >
                <span
                  className="text-[#C49262]/50"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '15px', letterSpacing: '0.1em' }}
                >
                  {c.n}
                </span>
                <span
                  className="flex-1 text-[#F4E9D5]"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 500 }}
                >
                  {c.title}
                </span>
                <ChevronRight size={20} className="text-[#C49262] transition-transform group-hover:translate-x-1" />
              </button>
            </li>
          ))}
          <li className="border-t border-[#C49262]/15" />
        </ul>

        {/* Кнопки: одна заливная бронза + одна контурная */}
        <div className="mt-8 flex flex-col gap-3">
          <button className="rounded-sm bg-[#C49262] py-3.5 text-[12px] font-semibold uppercase tracking-[0.25em] text-[#1B110A]">
            Забронировать стол
          </button>
          <button className="rounded-sm border border-[#C49262]/50 py-3.5 text-[12px] uppercase tracking-[0.25em] text-[#F4E9D5]/90">
            Позвать официанта
          </button>
        </div>
      </section>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  B. TACTILE WOOD / CRAFT
// ════════════════════════════════════════════════════════════════
function ConceptCraft() {
  const [openSeal, setOpenSeal] = useState(false);
  return (
    <div className="min-h-full bg-gradient-to-b from-[#241710] to-[#140C06] pb-10">
      {/* HERO: тёмный, лого «выжигается», имя проявляется снизу */}
      <section className="relative flex h-[46%] min-h-[360px] flex-col items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{ background: 'radial-gradient(circle at 50% 42%, rgba(196,146,98,0.28), transparent 62%)' }}
        />
        <motion.img
          src={HERO.logo}
          alt=""
          className="relative h-32 w-auto"
          initial={{ opacity: 0, filter: 'brightness(0.2) blur(3px)', scale: 0.92 }}
          animate={{ opacity: 1, filter: 'brightness(1) blur(0px)', scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: 'drop-shadow(0 6px 26px rgba(0,0,0,0.7))' }}
        />
        <motion.h1
          className="relative mt-2 text-[#E5C490]"
          style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 500, letterSpacing: '0.04em' }}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          {NAME}
        </motion.h1>
        <motion.div
          className="relative mt-1 text-[9px] uppercase tracking-[0.4em] text-[#C49262]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ delay: 1.3 }}
        >
          {CITY}
        </motion.div>
      </section>

      {/* PROMO: восковая печать «сегодня», раскрывается по тапу */}
      <section className="flex justify-center px-6">
        <button onClick={() => setOpenSeal((v) => !v)} className="flex w-full flex-col items-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#C49262]/70 text-[#C49262]"
            style={{
              background: 'radial-gradient(circle at 38% 30%, #3a2818, #1c120a)',
              boxShadow: '0 4px 18px rgba(0,0,0,0.5), inset 0 0 10px rgba(196,146,98,0.25)',
            }}
          >
            <Flame size={22} />
          </div>
          <AnimatePresence initial={false}>
            {openSeal && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden text-center"
              >
                <div className="mt-3 text-[9px] uppercase tracking-[0.35em] text-[#C49262]">Сегодня в Arca</div>
                <div className="mt-1 text-[#F4E9D5]" style={{ fontFamily: 'var(--font-display)', fontSize: '18px' }}>
                  {EVENTS[0]!.title}
                </div>
                <div className="text-[11px] tracking-[0.2em] text-[#F4E9D5]/55">{EVENTS[0]!.when}</div>
              </motion.div>
            )}
          </AnimatePresence>
          {!openSeal && (
            <div className="mt-2 text-[9px] uppercase tracking-[0.3em] text-[#C49262]/70">Сегодня · нажмите</div>
          )}
        </button>
      </section>

      {/* NAV: три спила-«коина» с выжженным названием, веером */}
      <section className="px-3 pt-8">
        <div className="flex items-end justify-center gap-1">
          {CATS.map((c, i) => {
            const cfg = [
              { y: 10, rot: -6, scale: 0.9 },
              { y: -14, rot: 1, scale: 1.08 },
              { y: 8, rot: 6, scale: 0.9 },
            ][i]!;
            return (
              <button key={c.title} className="group relative w-1/3" style={{ transform: `translateY(${cfg.y}px)` }}>
                <div
                  className="relative"
                  style={{ transform: `rotate(${cfg.rot}deg) scale(${cfg.scale})`, filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.55))' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.slice} alt="" className="w-full select-none transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-center uppercase text-[#EAD09C] group-hover:text-[#F8E8C2]"
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 300,
                        fontSize: 'clamp(9px,2.6vw,13px)',
                        letterSpacing: '0.3em',
                        textIndent: '0.3em',
                        textShadow: '0 1px 3px rgba(8,4,2,0.8)',
                      }}
                    >
                      {c.title}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Кнопки: восковой «коин» + контурная */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#C49262]/70 text-[#C49262]"
            style={{ background: 'radial-gradient(circle at 38% 30%, #3a2818, #1c120a)' }}
          >
            <Sparkles size={18} />
          </button>
          <button className="rounded-full border border-[#C49262]/60 px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-[#F4E9D5]/90">
            Позвать кальянного мастера
          </button>
        </div>
      </section>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  C. EDITORIAL MAGAZINE
// ════════════════════════════════════════════════════════════════
function ConceptEditorial() {
  return (
    <div className="min-h-full bg-[#1B110A] pb-10">
      {/* HERO: letterbox-сплит — видео сверху в тонких линиях, имя в нижней полосе */}
      <section className="px-5 pt-12">
        <div className="border-y border-[#F4E9D5]/15">
          <div className="relative h-[230px] w-full overflow-hidden">
            <HeroVideo className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/15" />
          </div>
        </div>
        <div className="pt-5">
          <div className="text-[10px] uppercase tracking-[0.4em] text-[#C49262]">{CITY}</div>
          <h1
            className="mt-1 leading-[0.92] text-[#F4E9D5]"
            style={{ fontFamily: 'var(--font-display)', fontSize: '52px', letterSpacing: '-0.02em', fontWeight: 500 }}
          >
            {NAME}
          </h1>
          <p className="mt-2 max-w-[280px] text-[13px] leading-relaxed text-[#F4E9D5]/55">
            Лаунж, кухня и бар на Рублёвке. Дым, медь и неспешные вечера.
          </p>
        </div>
      </section>

      {/* PROMO: редакционные карточки события (без кнопок, тапается вся) */}
      <section className="mt-7 px-5">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C49262]/70">Афиша</span>
          <span className="h-px flex-1 bg-[#C49262]/20" />
        </div>
        <div className="flex flex-col gap-3">
          {EVENTS.slice(0, 2).map((e) => (
            <button key={e.title} className="group flex items-stretch gap-3 text-left">
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.img} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="flex flex-1 flex-col justify-center border-b border-[#C49262]/15 pb-2">
                <div className="text-[9px] uppercase tracking-[0.3em] text-[#C49262]">{e.eyebrow}</div>
                <div className="text-[#F4E9D5]" style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500 }}>
                  {e.title}
                </div>
                <div className="text-[11px] tracking-[0.15em] text-[#F4E9D5]/45">{e.when}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* NAV: full-bleed фото-плитки, название низом-слева */}
      <section className="mt-8 flex flex-col gap-2 px-5">
        {CATS.map((c) => (
          <button key={c.title} className="group relative h-36 w-full overflow-hidden rounded-sm text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.img} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
              <div>
                <div className="text-[9px] uppercase tracking-[0.3em] text-[#C49262]">{c.n}</div>
                <div className="text-[#F4E9D5]" style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 500 }}>
                  {c.title}
                </div>
              </div>
              {/* кнопка: текст с подчёркиванием */}
              <span className="mb-1 inline-flex items-center gap-1 border-b border-[#C49262]/70 pb-0.5 text-[10px] uppercase tracking-[0.2em] text-[#F4E9D5] opacity-0 transition-opacity group-hover:opacity-100">
                Открыть <ArrowUpRight size={12} />
              </span>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  D. MODERN GALLERY
// ════════════════════════════════════════════════════════════════
function ConceptGallery() {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % EVENTS.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="min-h-full bg-[#160C06] pb-10">
      {/* HERO: видео внутри букв (masked type) */}
      <section className="relative h-[330px] w-full overflow-hidden">
        <HeroVideo className="absolute inset-0 h-full w-full object-cover" />
        {/* перекрытие фоном с «дыркой» по форме слова → видео видно в буквах */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 390 330" preserveAspectRatio="xMidYMid slice">
          <defs>
            <mask id="arca-mask">
              <rect width="390" height="330" fill="#fff" />
              <text
                x="195"
                y="186"
                textAnchor="middle"
                fill="#000"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
                fontSize="118"
                letterSpacing="-4"
              >
                ARCA
              </text>
            </mask>
          </defs>
          <rect width="390" height="330" fill="#160C06" mask="url(#arca-mask)" />
        </svg>
        <div className="absolute inset-x-0 bottom-5 text-center text-[10px] uppercase tracking-[0.5em] text-[#C49262]">
          {CITY}
        </div>
      </section>

      {/* PROMO: один кинематографичный слайд, медленная смена */}
      <section className="relative mx-5 mt-1 h-28 overflow-hidden rounded-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={EVENTS[slide]!.img} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 to-black/20" />
            <div className="absolute inset-0 flex flex-col justify-center px-5">
              <div className="text-[9px] uppercase tracking-[0.3em] text-[#C49262]">{EVENTS[slide]!.eyebrow}</div>
              <div className="text-[#F4E9D5]" style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 500 }}>
                {EVENTS[slide]!.title}
              </div>
              <div className="text-[11px] tracking-[0.15em] text-[#F4E9D5]/55">{EVENTS[slide]!.when}</div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="absolute bottom-2 right-3 flex gap-1.5">
          {EVENTS.map((_, i) => (
            <span key={i} className={`h-1 rounded-full transition-all ${i === slide ? 'w-4 bg-[#C49262]' : 'w-1 bg-[#F4E9D5]/30'}`} />
          ))}
        </div>
      </section>

      {/* NAV: горизонтальные snap-карточки «глав» с подглядыванием следующей */}
      <section className="mt-7">
        <div className="mb-3 px-5 text-[10px] uppercase tracking-[0.4em] text-[#C49262]/70">Выберите зал</div>
        <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
          {CATS.map((c) => (
            <button key={c.title} className="group relative h-64 w-[230px] shrink-0 snap-center overflow-hidden rounded-lg text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.img} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
              <div className="absolute left-4 top-4 text-[10px] uppercase tracking-[0.3em] text-[#C49262]">{c.n}</div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="text-[#F4E9D5]" style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500 }}>
                  {c.title}
                </div>
                <div className="text-[11px] tracking-[0.15em] text-[#F4E9D5]/50">{c.count} позиций</div>
              </div>
            </button>
          ))}
          <div className="w-2 shrink-0" />
        </div>

        {/* Кнопки: ghost + заливная бронза */}
        <div className="mt-7 flex gap-3 px-5">
          <button className="flex-1 rounded-md bg-[#C49262] py-3.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#160C06]">
            Заказать
          </button>
          <button className="flex-1 rounded-md py-3.5 text-[12px] uppercase tracking-[0.2em] text-[#F4E9D5]/80 transition hover:bg-white/5">
            Бронь стола
          </button>
        </div>
      </section>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  E. ART-DECO LOUNGE
// ════════════════════════════════════════════════════════════════
function ConceptDeco() {
  return (
    <div className="min-h-full bg-[#140C06] pb-10">
      {/* HERO: тихий кадр + тонкая геометрическая золотая рамка */}
      <section className="px-5 pt-12">
        <div className="relative p-2">
          {/* двойная деко-рамка с уголками */}
          <div className="pointer-events-none absolute inset-0 border border-[#C49262]/50" />
          <div className="pointer-events-none absolute inset-1.5 border border-[#C49262]/25" />
          {(['left-0 top-0', 'right-0 top-0', 'left-0 bottom-0', 'right-0 bottom-0'] as const).map((pos) => (
            <span key={pos} className={`pointer-events-none absolute ${pos} h-4 w-4`}>
              <span className="absolute inset-0 border-[#E5C490]" style={{ borderWidth: pos.includes('top') ? '1.5px 0 0 0' : '0 0 1.5px 0' }} />
            </span>
          ))}
          <div className="relative h-[300px] w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HERO.poster} alt="" className="ken-burns absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#140C06] via-transparent to-[#140C06]/40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={HERO.logo} alt="" className="h-14 w-auto opacity-90" />
              <div className="mt-3 flex items-center gap-3">
                <span className="h-px w-8 bg-[#C49262]/60" />
                <h1 className="text-[#F1D9B0]" style={{ fontFamily: 'var(--font-display)', fontSize: '34px', fontWeight: 500, letterSpacing: '0.14em' }}>
                  ARCA
                </h1>
                <span className="h-px w-8 bg-[#C49262]/60" />
              </div>
              <div className="mt-1 text-[9px] uppercase tracking-[0.45em] text-[#C49262]">{CITY}</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROMO: ряд минималистичных контурных пилюль */}
      <section className="mt-6 px-5">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {EVENTS.map((e) => (
            <button
              key={e.title}
              className="flex shrink-0 items-center gap-2 rounded-full border border-[#C49262]/45 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[#F4E9D5]/85"
            >
              <Disc3 size={12} className="text-[#C49262]" />
              {e.eyebrow}
              <span className="text-[#C49262]/60">{e.when}</span>
            </button>
          ))}
        </div>
      </section>

      {/* NAV: центрированный серифный «оглавление-индекс» с цифрами и деко-линиями */}
      <section className="mt-9 px-8">
        {CATS.map((c, i) => (
          <div key={c.title}>
            {i > 0 && (
              <div className="flex items-center justify-center gap-2 py-1">
                <span className="h-px w-10 bg-[#C49262]/25" />
                <span className="h-1 w-1 rotate-45 bg-[#C49262]/50" />
                <span className="h-px w-10 bg-[#C49262]/25" />
              </div>
            )}
            <button className="group flex w-full flex-col items-center py-3">
              <span
                className="text-[#F4E9D5] transition-colors group-hover:text-[#F1D9B0]"
                style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 500, letterSpacing: '0.06em' }}
              >
                {c.title}
              </span>
              <span className="mt-0.5 text-[10px] uppercase tracking-[0.35em] text-[#C49262]/70">{c.count} позиций</span>
            </button>
          </div>
        ))}

        {/* Кнопки: контур с деко-уголками + восковой коин */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <button className="relative w-full max-w-[260px] py-3.5 text-center text-[11px] uppercase tracking-[0.3em] text-[#F1D9B0]">
            <span className="absolute inset-0 border border-[#C49262]/50" />
            <span className="absolute inset-x-3 inset-y-[5px] border-y border-[#C49262]/20" />
            <span className="relative">Забронировать вечер</span>
          </button>
        </div>
      </section>
    </div>
  );
}

// ── Описания концептов (правая колонка) ────────────────────────
interface ConceptMeta {
  id: string;
  label: string;
  ru: string;
  tagline: string;
  Comp: () => React.JSX.Element;
  hero: string;
  promo: string;
  nav: string;
  buttons: string;
  why: string;
}
const CONCEPTS: ConceptMeta[] = [
  {
    id: 'cinematic',
    label: 'Cinematic Minimal',
    ru: 'Киноминимализм',
    tagline: 'Заглавный кадр фильма. Максимум воздуха, почти нет «интерфейса».',
    Comp: ConceptCinematic,
    hero: 'Full-bleed видео на весь экран, имя крупным серифом низом-слева, тонкий edge-CTA «Смотреть меню».',
    promo: 'Бегущая строка-маркиза между двумя золотыми волосяными линиями — как титр в кино, а не баннер.',
    nav: 'Нумерованный серифный список 01 / 02 / 03 с волосяными разделителями и лёгким асимметричным сдвигом центра.',
    buttons: 'Одна заливная бронзовая кнопка (главное действие) + одна контурная. Строго один «филл» на экран.',
    why: 'Самый безопасный «тяжёлый люкс, который лёгкий»: дорого, потому что сдержанно. Рекомендую как базовый.',
  },
  {
    id: 'craft',
    label: 'Tactile Wood / Craft',
    ru: 'Дерево и ремесло',
    tagline: 'Ваша нынешняя ДНК — спилы и клеймо, доведённая до люкса.',
    Comp: ConceptCraft,
    hero: 'Тёмный экран, логотип «выжигается» (burn-in), название проявляется снизу. Тёплый ореол.',
    promo: 'Восковая печать-коин «Сегодня»: по тапу аккуратно раскрывается в детали события.',
    nav: 'Три спила-коина с выжженными названиями, расставленные веером (не ровный ряд).',
    buttons: 'Круглый восковой «коин» для фирменных действий + контурная капсула.',
    why: 'Держит вашу идентичность, но дисциплинируется типографикой и воздухом — чтобы читалось как bespoke, а не сувенир.',
  },
  {
    id: 'editorial',
    label: 'Editorial Magazine',
    ru: 'Журнальная вёрстка',
    tagline: 'Меню как разворот люксового глянца.',
    Comp: ConceptEditorial,
    hero: 'Letterbox-сплит: видео в тонкой рамке сверху, имя и слоган в спокойной нижней полосе.',
    promo: 'Редакционные карточки афиши (фото + золотой надзаголовок + серифное имя + дата). Без кнопок — тапается вся.',
    nav: 'Full-bleed фото-плитки в столбик, название низом-слева, золотая линия.',
    buttons: 'Текстовые кнопки с подчёркиванием, проявляющимся по наведению — самые «невесомые».',
    why: 'Фото-богатый, типографика ведёт. «Condé Nast встречает Hermès». Хорош, если есть сильные фото.',
  },
  {
    id: 'gallery',
    label: 'Modern Gallery',
    ru: 'Современная галерея',
    tagline: 'Молодой люкс, уровень Awwwards.',
    Comp: ConceptGallery,
    hero: 'Masked-type: видео проигрывается ВНУТРИ букв слова ARCA. Приём — ровно один раз.',
    promo: 'Один кинематографичный слайд с медленной авто-сменой (без крикливых точек).',
    nav: 'Горизонтальные snap-карточки «залов» с подглядыванием следующей — каждая как обложка главы.',
    buttons: 'Ghost-кнопка + заливная бронза. Чёткая иерархия первично/вторично.',
    why: 'Самый дизайн-форвардный. Если хотите выглядеть современно и смело — это он. Гимик с буквами — дозированно.',
  },
  {
    id: 'deco',
    label: 'Art-Deco Lounge',
    ru: 'Ар-деко лаунж',
    tagline: 'Speakeasy 1920-х: латунь, геометрия, тёплый свет.',
    Comp: ConceptDeco,
    hero: 'Тихий кадр (ken-burns) в тонкой геометрической золотой рамке с уголками, имя по центру меж линий.',
    promo: 'Ряд минималистичных контурных пилюль — свайпом, вторично и спокойно.',
    nav: 'Центрированный серифный «индекс-оглавление» с числом позиций и деко-разделителями (ромб + линии).',
    buttons: 'Контур с деко-уголками + восковой коин для фирменных моментов.',
    why: 'Самый «лаунжевый» и тёплый. Единственное место, где лёгкая симметрия уместна. Следить за «бюджетом орнамента».',
  },
];

// ── Корневая витрина ───────────────────────────────────────────
export default function ConceptsPage() {
  const [active, setActive] = useState(0);
  // Deep-link: /ru/concepts?c=3 открывает 4-й концепт (для шеринга/скринов).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('c');
    const n = p ? Number(p) : NaN;
    if (!Number.isNaN(n) && n >= 0 && n < CONCEPTS.length) setActive(n);
  }, []);
  const c = CONCEPTS[active]!;
  const Comp = c.Comp;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-8">
      <header className="mx-auto max-w-6xl">
        <div className="text-[11px] uppercase tracking-[0.4em] text-[#C49262]">Barvikha · Arca</div>
        <h1 className="mt-1 text-[#F4E9D5]" style={{ fontFamily: 'var(--font-display)', fontSize: '34px', fontWeight: 500 }}>
          Концепты главной страницы
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#F4E9D5]/55">
          Пять самостоятельных направлений редизайна home-экрана. У каждого по-своему решены{' '}
          <span className="text-[#C49262]">рекламная строка</span>,{' '}
          <span className="text-[#C49262]">навигация по категориям</span> и{' '}
          <span className="text-[#C49262]">кнопки</span>. Это песочница — прод-главная не тронута.
        </p>
      </header>

      {/* Вкладки */}
      <nav className="mx-auto mt-6 flex max-w-6xl flex-wrap gap-2">
        {CONCEPTS.map((cc, i) => (
          <button
            key={cc.id}
            onClick={() => setActive(i)}
            className={`rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition ${
              i === active
                ? 'border-[#C49262] bg-[#C49262] text-[#1B110A]'
                : 'border-[#C49262]/30 text-[#F4E9D5]/75 hover:border-[#C49262]/70'
            }`}
          >
            <span className="mr-1.5 opacity-60">{String(i + 1).padStart(2, '0')}</span>
            {cc.label}
          </button>
        ))}
      </nav>

      {/* Контент: телефон + описание */}
      <div className="mx-auto mt-8 grid max-w-6xl items-start gap-10 lg:grid-cols-[auto_1fr]">
        <AnimatePresence mode="wait">
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <Phone>
              <Comp />
            </Phone>
          </motion.div>
        </AnimatePresence>

        <motion.aside
          key={`${c.id}-desc`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:pt-4"
        >
          <div className="text-[11px] uppercase tracking-[0.35em] text-[#C49262]">{c.ru}</div>
          <h2 className="mt-1 text-[#F4E9D5]" style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 500 }}>
            {c.label}
          </h2>
          <p className="mt-2 text-sm italic leading-relaxed text-[#F4E9D5]/70">{c.tagline}</p>

          <dl className="mt-6 space-y-4">
            {[
              ['Hero', c.hero],
              ['Рекламная строка', c.promo],
              ['Навигация', c.nav],
              ['Кнопки', c.buttons],
            ].map(([k, v]) => (
              <div key={k} className="border-t border-[#C49262]/15 pt-3">
                <dt className="text-[10px] uppercase tracking-[0.3em] text-[#C49262]/80">{k}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-[#F4E9D5]/80">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 rounded-sm border border-[#C49262]/25 bg-[#C49262]/[0.06] p-4">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#C49262]">Почему это люкс</div>
            <p className="mt-1.5 text-sm leading-relaxed text-[#F4E9D5]/85">{c.why}</p>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
