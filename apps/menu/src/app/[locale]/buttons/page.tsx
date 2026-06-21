'use client';

/**
 * BUTTONS — витрина вариантов внешнего вида кнопок-категорий.
 *
 * Открывается по /ru/buttons. Отдельный макет ТОЛЬКО под кнопки:
 *  - никаких «пеньков»/спилов и теней-следов вниз;
 *  - фон — тёплая «ржавчина»: несколько коричневых + золото, лёгкие мазки;
 *  - кнопки — аккуратные, элегантные: вышивка, сургуч, гравировка, камея…
 *
 * Каждый вариант пронумерован. Владелец выбирает номер — его и ставим
 * в продакшн (Кальяны / Кухня / Бар).
 */

import { Flame, Utensils, Wine, type LucideIcon } from 'lucide-react';

const CATS: { label: string; Icon: LucideIcon }[] = [
  { label: 'Кальяны', Icon: Flame },
  { label: 'Кухня', Icon: Utensils },
  { label: 'Бар', Icon: Wine },
];

const SERIF = 'var(--font-display)';

// ── Фон «ржавчина»: коричневые + золото мазками ────────────────
function RustBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {/* слои тёплых пятен */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            'radial-gradient(60% 50% at 12% 18%, rgba(176,108,56,0.55), transparent 60%)',
            'radial-gradient(55% 45% at 82% 26%, rgba(120,74,40,0.50), transparent 60%)',
            'radial-gradient(50% 50% at 38% 82%, rgba(196,146,98,0.32), transparent 60%)',
            'radial-gradient(55% 50% at 75% 72%, rgba(86,52,28,0.55), transparent 58%)',
            'linear-gradient(135deg, #3a2417 0%, #281708 55%, #190e06 100%)',
          ].join(','),
        }}
      />
      {/* мазки кистью — мягкая турбулентность */}
      <svg className="absolute inset-0 h-full w-full" style={{ opacity: 0.55, mixBlendMode: 'soft-light' }}>
        <filter id="rust-brush">
          <feTurbulence type="fractalNoise" baseFrequency="0.010 0.022" numOctaves="4" seed="7" stitchTiles="stitch" />
          <feColorMatrix
            values="0 0 0 0 0.72  0 0 0 0 0.50  0 0 0 0 0.26  0 0 0 0.9 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#rust-brush)" />
      </svg>
      {/* тонкое золотое зерно */}
      <svg className="absolute inset-0 h-full w-full" style={{ opacity: 0.16, mixBlendMode: 'overlay' }}>
        <filter id="rust-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.7 0.7" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0.85  0 0 0 0 0.66  0 0 0 0 0.38  0 0 0 0.5 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#rust-grain)" />
      </svg>
      {/* виньетка */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 120% at 50% 40%, transparent 55%, rgba(12,7,3,0.55) 100%)' }} />
    </div>
  );
}

// Базовый диаметр (как текущие кнопки + ~10%)
const D = 116;

// ════════════════════════════════════════════════════════════════
//  ВАРИАНТЫ КНОПОК
// ════════════════════════════════════════════════════════════════

// 01 — Вышивка: атласный шов + строчка-пунктир по контуру
function V01({ label }: { label: string }) {
  return (
    <button className="group relative transition-transform duration-300 hover:scale-[1.05]" style={{ width: D, height: D }}>
      <svg viewBox="0 0 116 116" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="emb-fill" cx="42%" cy="36%" r="70%">
            <stop offset="0%" stopColor="#5a3c22" />
            <stop offset="100%" stopColor="#321f10" />
          </radialGradient>
          <pattern id="satin" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="transparent" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(229,196,144,0.16)" strokeWidth="2" />
          </pattern>
        </defs>
        <circle cx="58" cy="58" r="52" fill="url(#emb-fill)" />
        <circle cx="58" cy="58" r="52" fill="url(#satin)" />
        {/* двойная строчка-вышивка */}
        <circle cx="58" cy="58" r="47" fill="none" stroke="#E5C490" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" opacity="0.92" />
        <circle cx="58" cy="58" r="43" fill="none" stroke="#C49262" strokeWidth="1.2" strokeDasharray="3 5" strokeLinecap="round" opacity="0.7" />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-center"
        style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15, color: '#F1D9B0', textShadow: '0 1px 0 rgba(0,0,0,0.6), 0 0 6px rgba(229,196,144,0.3)' }}
      >
        {label}
      </span>
    </button>
  );
}

// 02 — Сургучная печать: восковой медальон с тиснением
function V02({ label }: { label: string }) {
  return (
    <button className="group relative transition-transform duration-300 hover:scale-[1.05]" style={{ width: D, height: D }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 38% 30%, #6a4524, #3c2412 55%, #24140a)',
          boxShadow: 'inset 0 2px 6px rgba(255,224,170,0.25), inset 0 -6px 12px rgba(0,0,0,0.55), 0 4px 14px rgba(0,0,0,0.4)',
        }}
      />
      <div className="absolute inset-[7px] rounded-full border border-[#E5C490]/40" style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }} />
      <span
        className="absolute inset-0 flex items-center justify-center text-center"
        style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15, color: '#E9CF9B', textShadow: '0 1px 1px rgba(0,0,0,0.7), 0 -1px 1px rgba(255,224,170,0.25)' }}
      >
        {label}
      </span>
    </button>
  );
}

// 03 — Латунная гравировка: пластина с фаской, имя «вырезано»
function V03({ label }: { label: string }) {
  return (
    <button className="group relative transition-transform duration-300 hover:scale-[1.04]" style={{ height: D * 0.62, minWidth: D }}>
      <div
        className="flex h-full items-center justify-center rounded-[6px] px-6"
        style={{
          background: 'linear-gradient(135deg, #8a6636 0%, #c8a064 28%, #f0d8a8 50%, #b98e54 70%, #6f4d27 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -2px 3px rgba(0,0,0,0.4), 0 3px 10px rgba(0,0,0,0.4)',
        }}
      >
        <span
          className="text-center uppercase"
          style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 15, letterSpacing: '0.12em', color: '#3a2412', textShadow: '0 1px 0 rgba(255,236,200,0.5), 0 -1px 1px rgba(0,0,0,0.35)' }}
        >
          {label}
        </span>
      </div>
    </button>
  );
}

// 04 — Тонкая капсула: волосяной золотой контур, трекинг-капс
function V04({ label }: { label: string }) {
  return (
    <button
      className="group relative flex items-center justify-center rounded-full px-7 transition-colors duration-300 hover:bg-[#C49262]/10"
      style={{ height: D * 0.5, minWidth: D, border: '1px solid rgba(196,146,98,0.6)' }}
    >
      <span
        className="uppercase"
        style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 14, letterSpacing: '0.26em', textIndent: '0.26em', color: '#F4E9D5' }}
      >
        {label}
      </span>
    </button>
  );
}

// 05 — Камея-медальон: двойное тонкое кольцо + ромбы
function V05({ label }: { label: string }) {
  return (
    <button className="group relative transition-transform duration-300 hover:scale-[1.05]" style={{ width: D, height: D }}>
      <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 50% 40%, #45301d, #1f130a)' }} />
      <div className="absolute inset-[6px] rounded-full border border-[#C49262]/70" />
      <div className="absolute inset-[11px] rounded-full border border-[#C49262]/30" />
      {(['top-[3px]', 'bottom-[3px]'] as const).map((p) => (
        <span key={p} className={`absolute left-1/2 ${p} h-1.5 w-1.5 -translate-x-1/2 rotate-45`} style={{ background: '#E5C490', boxShadow: '0 0 4px rgba(229,196,144,0.7)' }} />
      ))}
      <span
        className="absolute inset-0 flex items-center justify-center text-center"
        style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 15, letterSpacing: '0.04em', color: '#EAD09C' }}
      >
        {label}
      </span>
    </button>
  );
}

// 06 — Тиснёная карточка: бронзовая карточка с выпуклым золотым тиснением
function V06({ label }: { label: string }) {
  return (
    <button className="group relative transition-transform duration-300 hover:scale-[1.04]" style={{ height: D * 0.6, minWidth: D }}>
      <div
        className="absolute inset-0 rounded-[10px]"
        style={{
          background: 'linear-gradient(160deg, #5a3d22, #34211200 120%), linear-gradient(160deg, #4a3420, #281910)',
          boxShadow: 'inset 0 1px 1px rgba(255,224,170,0.2), inset 0 -2px 4px rgba(0,0,0,0.4), 0 3px 9px rgba(0,0,0,0.4)',
          border: '1px solid rgba(196,146,98,0.3)',
        }}
      />
      <span
        className="absolute inset-0 flex items-center justify-center uppercase"
        style={{
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: '0.14em',
          textIndent: '0.14em',
          color: '#EAD09C',
          textShadow: '0 1px 0 rgba(0,0,0,0.55), 0 -1px 0 rgba(255,236,200,0.25)',
        }}
      >
        {label}
      </span>
    </button>
  );
}

// 07 — Монограмма с иконкой: тонкое кольцо, иконка над именем
function V07({ label, Icon }: { label: string; Icon: LucideIcon }) {
  return (
    <button className="group relative transition-transform duration-300 hover:scale-[1.05]" style={{ width: D, height: D }}>
      <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 50% 38%, #40291800, #1c1109)' }} />
      <div className="absolute inset-[5px] rounded-full border border-[#C49262]/55" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <Icon size={20} strokeWidth={1.5} className="text-[#E5C490]" />
        <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 13, letterSpacing: '0.16em' }} className="uppercase text-[#F4E9D5]">
          {label}
        </span>
      </div>
    </button>
  );
}

// 08 — Ар-деко жетон: срезанные углы + двойная линия
function V08({ label }: { label: string }) {
  const clip = 'polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)';
  return (
    <button className="group relative transition-transform duration-300 hover:scale-[1.04]" style={{ height: D * 0.62, minWidth: D }}>
      <div className="absolute inset-0" style={{ clipPath: clip, background: 'linear-gradient(160deg, #3a2616, #20140b)' }} />
      <div className="absolute inset-0" style={{ clipPath: clip, border: '1px solid rgba(196,146,98,0.7)' }} />
      <div className="absolute inset-[5px]" style={{ clipPath: clip, border: '1px solid rgba(196,146,98,0.25)' }} />
      <span
        className="absolute inset-0 flex items-center justify-center uppercase"
        style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 14, letterSpacing: '0.22em', textIndent: '0.22em', color: '#F1D9B0' }}
      >
        {label}
      </span>
    </button>
  );
}

// 09 — Нить-контур: только золотая строчка, без заливки
function V09({ label }: { label: string }) {
  return (
    <button className="group relative transition-transform duration-300 hover:scale-[1.05]" style={{ width: D, height: D }}>
      <svg viewBox="0 0 116 116" className="absolute inset-0 h-full w-full">
        <ellipse
          cx="58"
          cy="58"
          rx="50"
          ry="44"
          fill="none"
          stroke="#E5C490"
          strokeWidth="1.6"
          strokeDasharray="6 5"
          strokeLinecap="round"
          opacity="0.85"
        />
        <ellipse cx="58" cy="58" rx="45" ry="39" fill="none" stroke="#C49262" strokeWidth="0.8" strokeDasharray="2 5" opacity="0.5" />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-center uppercase"
        style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 14, letterSpacing: '0.12em', color: '#F4E9D5', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
      >
        {label}
      </span>
    </button>
  );
}

// ── Реестр вариантов ───────────────────────────────────────────
const VARIANTS: { n: string; name: string; desc: string; Btn: (p: { label: string; Icon: LucideIcon }) => React.JSX.Element }[] = [
  { n: '01', name: 'Вышивка', desc: 'Атласный шов + строчка-пунктир по кругу. Прямо «вышито».', Btn: ({ label }) => <V01 label={label} /> },
  { n: '02', name: 'Сургучная печать', desc: 'Восковой медальон с тиснением и золотым ободком.', Btn: ({ label }) => <V02 label={label} /> },
  { n: '03', name: 'Латунная гравировка', desc: 'Пластина латуни с фаской, имя «вырезано».', Btn: ({ label }) => <V03 label={label} /> },
  { n: '04', name: 'Тонкая капсула', desc: 'Волосяной золотой контур, широкий трекинг. Минимум.', Btn: ({ label }) => <V04 label={label} /> },
  { n: '05', name: 'Камея-медальон', desc: 'Двойное тонкое кольцо + ромбики сверху/снизу.', Btn: ({ label }) => <V05 label={label} /> },
  { n: '06', name: 'Тиснёная карточка', desc: 'Дебоссинг — имя мягко вдавлено в поверхность.', Btn: ({ label }) => <V06 label={label} /> },
  { n: '07', name: 'Монограмма с иконкой', desc: 'Тонкое кольцо, иконка над именем.', Btn: ({ label, Icon }) => <V07 label={label} Icon={Icon} /> },
  { n: '08', name: 'Ар-деко жетон', desc: 'Срезанные углы + двойная геометрическая линия.', Btn: ({ label }) => <V08 label={label} /> },
  { n: '09', name: 'Нить-контур', desc: 'Только золотая строчка, без заливки. Самый лёгкий.', Btn: ({ label }) => <V09 label={label} /> },
];

export default function ButtonsPage() {
  return (
    <div className="relative min-h-screen px-4 py-10 sm:px-8">
      <RustBackground />

      <header className="mx-auto max-w-6xl">
        <div className="text-[11px] uppercase tracking-[0.4em] text-[#E5C490]">Barvikha · Arca</div>
        <h1 className="mt-1 text-[#F4E9D5]" style={{ fontFamily: SERIF, fontSize: 34, fontWeight: 500 }}>
          Кнопки-категории — варианты
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#F4E9D5]/70">
          Без пеньков и теней-следов. Фон — тёплая «ржавчина» (коричневые + золото, мазками). Кнопки аккуратные,
          элегантные — вышивка, сургуч, гравировка, камея. Размер ≈ как сейчас, +10%. Выбери{' '}
          <span className="text-[#E5C490]">номер</span> — его и поставим.
        </p>
      </header>

      <div className="mx-auto mt-8 grid max-w-6xl gap-5 sm:grid-cols-2">
        {VARIANTS.map((v) => (
          <div
            key={v.n}
            className="relative overflow-hidden rounded-xl border border-[#C49262]/25 p-6"
            style={{ background: 'rgba(20,11,5,0.18)', backdropFilter: 'blur(1px)' }}
          >
            <div className="mb-5 flex items-center gap-3">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold text-[#1B110A]"
                style={{ background: '#E5C490' }}
              >
                {v.n}
              </span>
              <div>
                <div className="text-[15px] text-[#F4E9D5]" style={{ fontFamily: SERIF, fontWeight: 500 }}>
                  {v.name}
                </div>
                <div className="text-[11px] leading-tight text-[#F4E9D5]/55">{v.desc}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 py-2">
              {CATS.map((c) => (
                <v.Btn key={c.label} label={c.label} Icon={c.Icon} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="mx-auto mt-10 max-w-6xl text-center text-[12px] text-[#F4E9D5]/50">
        Напиши номер варианта (например «ставим 02») — вставлю его в кнопки-категории на главной.
      </footer>
    </div>
  );
}
