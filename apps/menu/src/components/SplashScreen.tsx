'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

// ─── Ring geometry ────────────────────────────────────────────────────────────
const R    = 88;
const CIRC = 2 * Math.PI * R; // stroke-dasharray длина

// ─── Цвета (светлая тема — точь-в-точь Киевская) ────────────────────────────
const BG_DARK = '#D8CEC0';                        // совпадает с --cm-bg Киевской
const RING_C  = '#C5A880';                        // шампанское золото
const RING_D  = 'rgba(197,168,128,0.2)';          // направляющий круг
const TEXT_C  = '#6B4A28';                        // тёмно-коричневый текст

// ─── Частицы: детерминированные (нет random → нет hydration mismatch) ─────────
const PARTICLES = [
  { l:  7, dl: 0.1, dr: 3.4, s: 2   },
  { l: 16, dl: 1.2, dr: 2.8, s: 1.5 },
  { l: 27, dl: 0.5, dr: 3.6, s: 2.5 },
  { l: 36, dl: 1.9, dr: 3.0, s: 1   },
  { l: 45, dl: 0.3, dr: 2.7, s: 2   },
  { l: 54, dl: 1.0, dr: 3.5, s: 1.5 },
  { l: 63, dl: 0.7, dr: 2.6, s: 2   },
  { l: 72, dl: 1.5, dr: 3.2, s: 1.5 },
  { l: 81, dl: 0.2, dr: 2.9, s: 2   },
  { l: 91, dl: 1.7, dr: 3.3, s: 1   },
  { l: 21, dl: 2.1, dr: 3.0, s: 1.5 },
  { l: 59, dl: 0.4, dr: 2.5, s: 2.5 },
  { l: 86, dl: 0.9, dr: 3.7, s: 1   },
];

const STORAGE_KEY = 'bvh_splash_kiev';

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState(0);
  const [show, setShow]   = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.includes('kievskaia') || sessionStorage.getItem(STORAGE_KEY)) {
      setShow(false);
      return;
    }
    setShow(true);

    const ts = [
      // phase 1 → дерево крутится + кольцо рисуется (cubic-bezier spring)
      setTimeout(() => setPhase(1), 350),
      // phase 2 → текст
      setTimeout(() => setPhase(2), 1800),
      // phase 3 → iris-close: clip-path circle(150%→0%) + overlay fade + сайт "выходит вперёд"
      setTimeout(() => setPhase(3), 2700),
      // unmount — к этому моменту clip-path уже 0%, сплэш невидим
      setTimeout(() => {
        sessionStorage.setItem(STORAGE_KEY, '1');
        setShow(false);
      }, 3750),
    ];
    return () => ts.forEach(clearTimeout);
  }, [pathname]);

  return (
    <>
      {/* ─── Layer 1: сайт (нормальный поток) ─────────────────────────────── */}
      {children}

      {/* Layer 2 не нужен — фон сплэша совпадает с сайтом */}

      {/* ─── Layer 3: сплэш ───────────────────────────────────────────────── */}
      {show === true && (
        <div
          className="fixed inset-0 z-[9999] overflow-hidden"
          style={{
            background: BG_DARK,
            // IRIS CLOSE: clip-path circle сжимается к точке — GPU-accelerated,
            // никакого width/height. cubic-bezier(0.25, 1, 0.5, 1) = premium easing
            clipPath:   phase >= 3 ? 'circle(0% at 50% 50%)' : 'circle(150% at 50% 50%)',
            transition: phase >= 3 ? 'clip-path 0.9s cubic-bezier(0.25, 1, 0.5, 1)' : 'none',
          }}
        >
          {/* CSS-анимация частиц */}
          <style>{`
            @keyframes bvParticle {
              0%   { transform: translateY(0);       opacity: 0;    }
              12%  {                                  opacity: 0.82; }
              88%  {                                  opacity: 0.22; }
              100% { transform: translateY(-100vh);  opacity: 0;    }
            }
          `}</style>

          {/* Мягкое золотое свечение в центре */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 55% 55% at 50% 50%, rgba(197,168,128,0.18) 0%, transparent 70%)',
            }}
          />

          {/* Золотые частицы (только transform → 60fps гарантировано) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {PARTICLES.map((p, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left:   `${p.l}%`,
                  bottom: 0,
                  width:  p.s,
                  height: p.s,
                  borderRadius: '50%',
                  background:  RING_C,
                  boxShadow:   `0 0 ${p.s * 2.5}px ${p.s}px rgba(197,168,128,0.6)`,
                  animation:   `bvParticle ${p.dr}s ${p.dl}s infinite ease-in`,
                }}
              />
            ))}
          </div>

          {/* ── Центральный контент ─────────────────────────────────────────── */}
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">

            {/* Логотип + кольцо — уходит при phase 3 */}
            <motion.div
              className="relative"
              style={{ width: 200, height: 200 }}
              animate={phase >= 3 ? { opacity: 0, scale: 0.88 } : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 1, 1] }}
            >
              {/* Кольцо SVG + glow после прорисовки */}
              <motion.svg
                className="absolute inset-0"
                width="200" height="200" viewBox="0 0 200 200"
                fill="none"
                animate={
                  phase >= 1 && phase < 3
                    ? { filter: 'drop-shadow(0 0 7px rgba(197,168,128,0.75))' }
                    : { filter: 'drop-shadow(0 0 0px rgba(197,168,128,0))' }
                }
                // glow появляется когда кольцо почти дорисовано
                transition={{ duration: 0.8, delay: phase >= 1 ? 1.1 : 0 }}
              >
                {/* Направляющий круг */}
                <circle cx="100" cy="100" r={R} stroke={RING_D} strokeWidth="1" />

                {/* Кольцо рисуется stroke-dashoffset → 0 */}
                <motion.circle
                  cx="100" cy="100" r={R}
                  stroke={RING_C} strokeWidth="1.5" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  transform="rotate(-90 100 100)"
                  initial={{ strokeDashoffset: CIRC }}
                  animate={{ strokeDashoffset: phase >= 1 ? 0 : CIRC }}
                  // cubic-bezier(0.4, 0, 0.2, 1) — Material-style smooth
                  transition={{ duration: 1.3, ease: [0.4, 0, 0.2, 1] }}
                />
              </motion.svg>

              {/* Sparkle — яркая точка мчится по кольцу после прорисовки */}
              {phase >= 1 && (
                <motion.div
                  style={{
                    position: 'absolute',
                    width: 5, height: 5,
                    borderRadius: '50%',
                    background: 'rgba(255,248,220,0.98)',
                    boxShadow: '0 0 10px 4px rgba(197,168,128,0.9)',
                    top:  '50%', left: '50%',
                    marginTop:  -R - 2,  // на вершине кольца
                    marginLeft: -2.5,
                    // pivot = центр кольца (R+2 пикселя вниз от точки)
                    transformOrigin: `2.5px ${R + 2}px`,
                  }}
                  initial={{ rotate: 0, opacity: 0 }}
                  animate={{ rotate: 360, opacity: [0, 1, 1, 0] }}
                  transition={{
                    duration: 0.75,
                    delay:    1.35,  // после прорисовки кольца
                    ease:     'easeInOut',
                    opacity:  { times: [0, 0.08, 0.92, 1] },
                  }}
                />
              )}

              {/* Дерево — крутится при появлении */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="relative overflow-hidden"
                  initial={{ opacity: 0, scale: 0.07, rotate: 360 }}
                  animate={
                    phase >= 1
                      ? { opacity: 1, scale: 1, rotate: 0 }
                      : { opacity: 0, scale: 0.07, rotate: 360 }
                  }
                  // cubic-bezier(0.34, 1.08, 0.64, 1) = упругий spring без лишних колебаний
                  transition={{ duration: 1.0, ease: [0.34, 1.08, 0.64, 1] }}
                >
                  <Image
                    src="/logo-arka.png"
                    alt="Barvikha"
                    width={112} height={112}
                    priority
                    className="object-contain"
                    // multiply: белый фон PNG совпадает с bg → невидим, золото остаётся
                    style={{ mixBlendMode: 'multiply' }}
                  />

                  {/* Shimmer — световой блик скользит по логотипу после появления */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(110deg, transparent 20%, rgba(255,248,220,0.42) 50%, transparent 80%)',
                    }}
                    initial={{ x: '-130%' }}
                    animate={{ x: '130%' }}
                    // стартует через ~200ms после окончания spin
                    transition={{ delay: 1.15, duration: 0.85, ease: 'easeInOut' }}
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Подпись — кремовый текст на тёмном */}
            <AnimatePresence>
              {phase >= 2 && phase < 3 && (
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1,   y: 0  }}
                  exit={{    opacity: 0,   y: -10 }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    fontFamily:    "'Cormorant SC', 'Cormorant Garamond', Georgia, serif",
                    fontSize:       10,
                    fontWeight:     500,
                    color:          TEXT_C,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    marginTop:      22,
                  }}
                >
                  Barvikha Group · Since 2017
                </motion.p>
              )}
            </AnimatePresence>

          </div>
        </div>
      )}
    </>
  );
}
