'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

// ─── Ring geometry ─────────────────────────────────────────
const CX = 150;
const CY = 150;
const R1 = 68;    // inner   — ярче всего
const R2 = 96;    // middle  — sparkle бежит
const R3 = 126;   // outer   — с засечками
const R4 = 143;   // accent  — пунктир, медленно вращается
const C1 = 2 * Math.PI * R1;
const C2 = 2 * Math.PI * R2;
const C3 = 2 * Math.PI * R3;

// ─── Palette ────────────────────────────────────────────────
const BG     = '#0A0806';
const GOLD   = '#C5A880';
const GOLD_B = '#E8D5A3';
const GOLD_D = 'rgba(197,168,128,0.09)';
const CREAM  = '#D8CEC0';

// ─── Particles ──────────────────────────────────────────────
const PARTICLES = [
  { l:  6, dl: 0.4, dr: 4.8, s: 1.5 },
  { l: 14, dl: 1.8, dr: 3.9, s: 1   },
  { l: 23, dl: 0.7, dr: 4.5, s: 2   },
  { l: 31, dl: 2.2, dr: 4.2, s: 1.5 },
  { l: 40, dl: 0.3, dr: 5.0, s: 1   },
  { l: 49, dl: 1.4, dr: 4.1, s: 2   },
  { l: 58, dl: 0.9, dr: 4.7, s: 1   },
  { l: 67, dl: 1.9, dr: 3.8, s: 2   },
  { l: 76, dl: 0.5, dr: 4.4, s: 1.5 },
  { l: 85, dl: 1.6, dr: 4.9, s: 1   },
  { l: 93, dl: 0.2, dr: 4.3, s: 2   },
  { l: 18, dl: 2.5, dr: 3.7, s: 1.5 },
  { l: 36, dl: 0.6, dr: 4.6, s: 1   },
  { l: 53, dl: 1.2, dr: 5.1, s: 2   },
  { l: 71, dl: 2.0, dr: 4.0, s: 1   },
  { l: 88, dl: 0.8, dr: 4.5, s: 1.5 },
];

// 24 засечки с тремя уровнями (major / medium / minor)
const TICK_ANGLES = Array.from({ length: 24 }, (_, i) => i * 15);
const TITLE_CHARS = 'BARVIKHA'.split('');

let splashShown = false;

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState(0);
  const [show,  setShow]  = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.includes('kievskaia') || splashShown) {
      setShow(false);
      return;
    }
    splashShown = true;
    setShow(true);

    const ts = [
      setTimeout(() => setPhase(1), 300),   // кольца + логотип
      setTimeout(() => setPhase(2), 2200),  // буквы
      setTimeout(() => setPhase(3), 3200),  // тэглайн
      setTimeout(() => setPhase(4), 4500),  // iris-close
      setTimeout(() => setShow(false), 5700),
    ];
    return () => ts.forEach(clearTimeout);
  }, [pathname]);

  return (
    <>
      {children}

      {show === true && (
        <div
          className="fixed inset-0 z-[9999] overflow-hidden"
          style={{
            background: `radial-gradient(ellipse 55% 55% at 50% 50%, #130F0A 0%, ${BG} 100%)`,
            clipPath:   phase >= 4 ? 'circle(0% at 50% 50%)' : 'circle(150% at 50% 50%)',
            transition: phase >= 4
              ? 'clip-path 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
              : 'none',
          }}
        >
          <style>{`
            @keyframes bvParticle {
              0%   { transform: translateY(0);      opacity: 0;    }
              12%  {                                 opacity: 0.45; }
              88%  {                                 opacity: 0.12; }
              100% { transform: translateY(-100vh); opacity: 0;    }
            }
          `}</style>

          {/* Тёмная виньетка — взгляд фокусируется на центре */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 65% 65% at 50% 50%, transparent 35%, rgba(0,0,0,0.7) 100%)',
            }}
          />

          {/* Дышащее центральное свечение */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 50% 46% at 50% 50%, rgba(197,168,128,0.2) 0%, transparent 70%)',
            }}
            animate={{ opacity: phase >= 1 && phase < 4 ? [0.65, 1, 0.65] : 0.65 }}
            transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
          />

          {/* Золотые частицы */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {PARTICLES.map((p, i) => (
              <div
                key={i}
                style={{
                  position:     'absolute',
                  left:         `${p.l}%`,
                  bottom:       0,
                  width:        p.s,
                  height:       p.s,
                  borderRadius: '50%',
                  background:   GOLD,
                  boxShadow:    `0 0 ${p.s * 3}px ${p.s * 1.5}px rgba(197,168,128,0.4)`,
                  animation:    `bvParticle ${p.dr}s ${p.dl}s infinite ease-in`,
                }}
              />
            ))}
          </div>

          {/* ──── Основной контент ──────────────────────────── */}
          <div className="absolute inset-0 flex items-center justify-center select-none">

            {/* Блок с кольцами и логотипом */}
            <div style={{ position: 'relative', width: 300, height: 300 }}>
              <motion.svg
                width="300" height="300" viewBox="0 0 300 300"
                fill="none"
                className="absolute inset-0"
              >
                {/* Направляющие */}
                <circle cx={CX} cy={CY} r={R1} stroke={GOLD_D} strokeWidth="0.5" />
                <circle cx={CX} cy={CY} r={R2} stroke={GOLD_D} strokeWidth="0.5" />
                <circle cx={CX} cy={CY} r={R3} stroke={GOLD_D} strokeWidth="0.5" />

                {/* Пунктирное акцентное кольцо — медленно вращается как безель */}
                <motion.circle
                  cx={CX} cy={CY} r={R4}
                  stroke={GOLD}
                  strokeWidth="0.6"
                  fill="none"
                  strokeDasharray="3 13"
                  style={{ transformOrigin: '50% 50%' }}
                  initial={{ opacity: 0 }}
                  animate={
                    phase >= 1
                      ? { opacity: 0.4, rotate: 360 }
                      : { opacity: 0,   rotate: 0   }
                  }
                  transition={{
                    opacity: { delay: 0.7, duration: 1.4, ease: 'easeOut' },
                    rotate:  { delay: 0.7, duration: 100, ease: 'linear', repeat: Infinity },
                  }}
                />

                {/* Внутреннее кольцо */}
                <motion.circle
                  cx={CX} cy={CY} r={R1}
                  stroke={GOLD_B} strokeWidth="1.5" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={C1}
                  transform={`rotate(-90 ${CX} ${CY})`}
                  initial={{ strokeDashoffset: C1 }}
                  animate={{ strokeDashoffset: phase >= 1 ? 0 : C1 }}
                  transition={{ duration: 1.2, delay: 0, ease: [0.4, 0, 0.2, 1] }}
                />

                {/* Среднее кольцо */}
                <motion.circle
                  cx={CX} cy={CY} r={R2}
                  stroke={GOLD} strokeWidth="1" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={C2}
                  transform={`rotate(90 ${CX} ${CY})`}
                  initial={{ strokeDashoffset: C2 }}
                  animate={{ strokeDashoffset: phase >= 1 ? 0 : C2 }}
                  transition={{ duration: 1.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
                />

                {/* Внешнее кольцо */}
                <motion.circle
                  cx={CX} cy={CY} r={R3}
                  stroke={GOLD} strokeWidth="0.75" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={C3}
                  transform={`rotate(-90 ${CX} ${CY})`}
                  initial={{ strokeDashoffset: C3 }}
                  animate={{ strokeDashoffset: phase >= 1 ? 0 : C3 }}
                  transition={{ duration: 1.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                />

                {/* Сонар-волна 1 */}
                {phase >= 1 && phase < 4 && (
                  <motion.circle
                    cx={CX} cy={CY}
                    fill="none"
                    stroke={GOLD_B}
                    strokeWidth="2"
                    initial={{ r: R1, opacity: 0.3 }}
                    animate={{ r: [R1, R1 + 54], opacity: [0.3, 0] }}
                    transition={{ repeat: Infinity, duration: 3.8, delay: 1.8, ease: 'easeOut' }}
                  />
                )}

                {/* Сонар-волна 2 (со смещением — создаёт ритм) */}
                {phase >= 1 && phase < 4 && (
                  <motion.circle
                    cx={CX} cy={CY}
                    fill="none"
                    stroke={GOLD}
                    strokeWidth="1.2"
                    initial={{ r: R1, opacity: 0.2 }}
                    animate={{ r: [R1, R1 + 54], opacity: [0.2, 0] }}
                    transition={{ repeat: Infinity, duration: 3.8, delay: 3.7, ease: 'easeOut' }}
                  />
                )}

                {/* Засечки — 24 штуки, три уровня */}
                {phase >= 1 && TICK_ANGLES.map((angle, i) => {
                  const rad      = (angle - 90) * Math.PI / 180;
                  const isMajor  = i % 6 === 0;
                  const isMedium = i % 3 === 0 && !isMajor;
                  const len      = isMajor ? 9 : isMedium ? 5 : 3;
                  return (
                    <motion.line
                      key={angle}
                      x1={CX + R3 * Math.cos(rad)}
                      y1={CY + R3 * Math.sin(rad)}
                      x2={CX + (R3 + len) * Math.cos(rad)}
                      y2={CY + (R3 + len) * Math.sin(rad)}
                      stroke={isMajor ? GOLD_B : GOLD}
                      strokeWidth={isMajor ? '1.2' : isMedium ? '0.7' : '0.45'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isMajor ? 0.85 : isMedium ? 0.5 : 0.28 }}
                      transition={{ delay: 1.35 + i * 0.025, duration: 0.4 }}
                    />
                  );
                })}
              </motion.svg>

              {/* Sparkle — мчится по среднему кольцу */}
              {phase >= 1 && (
                <motion.div
                  style={{
                    position:     'absolute',
                    width: 4, height: 4,
                    borderRadius: '50%',
                    background:   GOLD_B,
                    boxShadow:    `0 0 10px 4px rgba(232,213,163,0.9)`,
                    top:  '50%',
                    left: '50%',
                    marginTop:  -(R2 + 1.5),
                    marginLeft: -2,
                    transformOrigin: `2px ${R2 + 1.5}px`,
                  }}
                  initial={{ rotate: 0, opacity: 0 }}
                  animate={{ rotate: 360, opacity: [0, 1, 1, 0] }}
                  transition={{
                    duration: 0.82,
                    delay:    1.3,
                    ease:     'easeInOut',
                    opacity:  { times: [0, 0.07, 0.93, 1] },
                  }}
                />
              )}

              {/* Второй sparkle — по внешнему кольцу, в обратную сторону */}
              {phase >= 1 && (
                <motion.div
                  style={{
                    position:     'absolute',
                    width: 3, height: 3,
                    borderRadius: '50%',
                    background:   GOLD_B,
                    boxShadow:    `0 0 8px 3px rgba(232,213,163,0.8)`,
                    top:  '50%',
                    left: '50%',
                    marginTop:  -(R3 + 0.75),
                    marginLeft: -1.5,
                    transformOrigin: `1.5px ${R3 + 0.75}px`,
                  }}
                  initial={{ rotate: 0, opacity: 0 }}
                  animate={{ rotate: -360, opacity: [0, 0.9, 0.9, 0] }}
                  transition={{
                    duration: 1.1,
                    delay:    1.9,
                    ease:     'easeInOut',
                    opacity:  { times: [0, 0.06, 0.94, 1] },
                  }}
                />
              )}

              {/* Burst-волна когда монетка встала на место */}
              {phase >= 1 && (
                <motion.div
                  style={{
                    position:     'absolute',
                    top: '50%', left: '50%',
                    width:        120,
                    height:       120,
                    marginTop:    -60,
                    marginLeft:   -60,
                    borderRadius: '50%',
                    border:       '1.5px solid rgba(197,168,128,0.8)',
                    pointerEvents: 'none',
                  }}
                  initial={{ scale: 1,   opacity: 0 }}
                  animate={{ scale: 1.95, opacity: [0, 0.75, 0] }}
                  transition={{
                    delay:   2.05,
                    duration: 1.4,
                    ease:    'easeOut',
                    opacity: { times: [0, 0.07, 1] },
                  }}
                />
              )}

              {/* Логотип — медальон с золотым свечением */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ perspective: '1200px' }}
              >
                <motion.div
                  style={{ position: 'relative', width: 120, height: 120 }}
                  initial={{ opacity: 0, rotateY: 180 }}
                  animate={
                    phase >= 1
                      ? { opacity: 1, rotateY: 0 }
                      : { opacity: 0, rotateY: 180 }
                  }
                  transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div style={{
                    width:        '100%',
                    height:       '100%',
                    borderRadius: '50%',
                    overflow:     'hidden',
                    position:     'relative',
                    background:   CREAM,
                    boxShadow:    `0 0 0 1px rgba(197,168,128,0.5),
                                   0 0 28px rgba(197,168,128,0.38),
                                   0 0 80px rgba(197,168,128,0.12)`,
                  }}>
                    <Image
                      src="/logo-arka.png"
                      alt="Barvikha"
                      width={120} height={120}
                      priority
                      className="object-contain w-full h-full"
                      style={{ mixBlendMode: 'multiply' }}
                    />
                    {/* Shimmer — блик на медальоне */}
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(110deg, transparent 20%, rgba(255,248,220,0.52) 50%, transparent 80%)',
                      }}
                      initial={{ x: '-130%' }}
                      animate={{ x: '130%' }}
                      transition={{ delay: 1.85, duration: 1.0, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Текстовый блок — абсолютно, не сдвигает кольца */}
            <AnimatePresence>
              {phase >= 2 && phase < 4 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{    opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  style={{
                    position:  'absolute',
                    top:       'calc(50% + 154px)',
                    left:      0,
                    right:     0,
                    textAlign: 'center',
                  }}
                >
                  {/* Декоративные линии + ромб */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 14 }}>
                    <motion.div
                      style={{
                        height:     '0.5px',
                        width:      60,
                        background: `linear-gradient(to right, transparent, ${GOLD})`,
                      }}
                      initial={{ scaleX: 0, transformOrigin: 'right' }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.75, delay: 0.1 }}
                    />
                    <span style={{ color: GOLD, fontSize: 6.5, opacity: 0.75, lineHeight: 1 }}>◆</span>
                    <motion.div
                      style={{
                        height:     '0.5px',
                        width:      60,
                        background: `linear-gradient(to left, transparent, ${GOLD})`,
                      }}
                      initial={{ scaleX: 0, transformOrigin: 'left' }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.75, delay: 0.1 }}
                    />
                  </div>

                  {/* BARVIKHA — буква за буквой */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.28em' }}>
                    {TITLE_CHARS.map((char, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1,  y: 0  }}
                        transition={{
                          delay:    0.06 * i,
                          duration: 0.7,
                          ease:     [0.25, 0.1, 0.25, 1],
                        }}
                        style={{
                          fontFamily:   "'Cormorant SC', 'Cormorant Garamond', Georgia, serif",
                          fontSize:      28,
                          fontWeight:    600,
                          color:         GOLD_B,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          lineHeight:    1,
                          textShadow:   '0 0 24px rgba(232,213,163,0.6), 0 0 8px rgba(232,213,163,0.35)',
                        }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </div>

                  {/* Тэглайн */}
                  {phase >= 3 && (
                    <>
                      <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1,  opacity: 0.3 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        style={{
                          height:     '0.5px',
                          width:      90,
                          background: GOLD,
                          margin:     '10px auto 8px',
                        }}
                      />
                      <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 0.55, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                        style={{
                          fontFamily:   "'Cormorant SC', 'Cormorant Garamond', Georgia, serif",
                          fontSize:      8.5,
                          fontWeight:    400,
                          color:         GOLD,
                          letterSpacing: '0.45em',
                          textTransform: 'uppercase',
                          marginTop:     0,
                        }}
                      >
                        Since · 2017
                      </motion.p>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </>
  );
}
