'use client';

/**
 * ARKA LAB — рабочий холст для макета главной Арки.
 *
 * Отдельная песочница: открывается по /ru/arka-lab, ни с чем не связана —
 * не импортирует ничего из coffee/* (экосистема Киевской) и не трогает
 * боевой /arka. Свои токены цвета/типографики заданы прямо здесь, чтобы
 * правки макета Арки никогда не задевали Киевскую и наоборот.
 */

const HERO = {
  video: '/locations/arka/hero.mp4',
  poster: '/locations/arka/poster.jpg',
  logo: '/locations/arka/logo-tree.png',
};

const NAME = 'Арка';
const CITY = 'BARVIKHA · RUBLYOVO';

// ── Свои токены Арки (не шарятся с Киевской) ──────────────────
const BG = '#1B110A';
const SURFACE = '#241710';
const ACCENT = '#C49262';
const TEXT = '#F4E9D5';

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[390px] max-w-full">
      <div
        className="relative overflow-hidden rounded-[2.6rem] border border-[#3a2a1d]"
        style={{ height: '800px', background: BG, boxShadow: '0 40px 90px -25px rgba(0,0,0,0.85), inset 0 0 0 2px rgba(0,0,0,0.6)' }}
      >
        <div className="pointer-events-none absolute left-1/2 top-2.5 z-50 h-1.5 w-24 -translate-x-1/2 rounded-full bg-black/70" />
        <div className="no-scrollbar h-full overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}

function DropZone({ label }: { label: string }) {
  return (
    <div
      className="mx-5 my-3 flex h-24 items-center justify-center rounded-md border border-dashed text-[10px] uppercase tracking-[0.3em]"
      style={{ borderColor: `${ACCENT}55`, color: `${ACCENT}99` }}
    >
      {label}
    </div>
  );
}

export default function ArkaLabPage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-8" style={{ background: SURFACE }}>
      <header className="mx-auto max-w-6xl">
        <div className="text-[11px] uppercase tracking-[0.4em]" style={{ color: ACCENT }}>
          Arka · Lab
        </div>
        <h1 className="mt-1" style={{ fontFamily: 'var(--font-display)', fontSize: '34px', fontWeight: 500, color: TEXT }}>
          Рабочий холст макета Арки
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: `${TEXT}88` }}>
          Изолированная песочница — не связана с боевым /arka и с экосистемой Киевской.
          Меняй свободно, ничего вокруг не сломается.
        </p>
      </header>

      <div className="mx-auto mt-8 max-w-6xl">
        <Phone>
          <div className="relative h-[280px] w-full overflow-hidden">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={HERO.video}
              poster={HERO.poster}
              muted
              playsInline
              preload="auto"
            />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${BG}, transparent)` }} />
            <div className="absolute inset-x-0 bottom-0 px-6 pb-6">
              <div className="text-[10px] uppercase tracking-[0.4em]" style={{ color: ACCENT }}>
                {CITY}
              </div>
              <h2
                className="mt-1 leading-[0.95]"
                style={{ fontFamily: 'var(--font-display)', fontSize: '48px', letterSpacing: '-0.02em', fontWeight: 500, color: TEXT }}
              >
                {NAME}
              </h2>
            </div>
          </div>

          <DropZone label="Рекламная строка" />
          <DropZone label="Навигация по категориям" />
          <DropZone label="Кнопки / CTA" />
        </Phone>
      </div>
    </div>
  );
}
