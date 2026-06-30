'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

// ─── Geometry ──────────────────────────────────────────────
const CX = 150; const CY = 150;
const D_IN  = 86;   // inner diamond circumradius
const D_OUT = 138;  // outer dashed diamond circumradius

function dPath(r: number) {
  return `M ${CX},${CY - r} L ${CX + r},${CY} L ${CX},${CY + r} L ${CX - r},${CY} Z`;
}
const DIN_PERIM  = 4 * D_IN  * Math.SQRT2;  // ≈487
const DOUT_PERIM = 4 * D_OUT * Math.SQRT2;  // ≈780

// Rays
const R0      = 65;   // start (just outside logo r=60)
const R_MAJ   = 134;  // major tip
const R_MIN   = 105;  // minor tip
const LEN_MAJ = R_MAJ - R0; // 69
const LEN_MIN = R_MIN - R0; // 40

const MAJ_DEG = [0, 45, 90, 135, 180, 225, 270, 315];
const MIN_DEG = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

// Diamond pulse (expands from center, replaces sonar circles)
const PULSE = dPath(60);

// ─── Palette ───────────────────────────────────────────────
const BG     = '#0A0806';
const GOLD   = '#C5A880';
const GOLD_B = '#E8D5A3';
const CREAM  = '#D8CEC0';

// ─── Particles ─────────────────────────────────────────────
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

// Corner ornament paths (32×32 viewBox)
const CORNERS = [
  { style: { top: 22, left: 22 },   path: 'M 24,2 L 2,2 L 2,24'   },
  { style: { top: 22, right: 22 },  path: 'M 8,2 L 30,2 L 30,24'  },
  { style: { bottom: 22, left: 22 }, path: 'M 24,30 L 2,30 L 2,8'  },
  { style: { bottom: 22, right: 22 }, path: 'M 8,30 L 30,30 L 30,8' },
];

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
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 2200),
      setTimeout(() => setPhase(3), 3200),
      setTimeout(() => setPhase(4), 4500),
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
            transition: phase >= 4 ? 'clip-path 1.2s cubic-bezier(0.4,0,0.2,1)' : 'none',
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

          {/* Тёмная виньетка */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 62% 62% at 50% 50%, transparent 32%, rgba(0,0,0,0.72) 100%)',
          }} />

          {/* Дышащее свечение */}
          <motion.div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 48% 44% at 50% 50%, rgba(197,168,128,0.22) 0%, transparent 70%)' }}
            animate={{ opacity: phase >= 1 && phase < 4 ? [0.6, 1, 0.6] : 0.6 }}
            transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
          />

          {/* Частицы */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {PARTICLES.map((p, i) => (
              <div key={i} style={{
                position: 'absolute', left: `${p.l}%`, bottom: 0,
                width: p.s, height: p.s, borderRadius: '50%', background: GOLD,
                boxShadow: `0 0 ${p.s * 3}px ${p.s * 1.5}px rgba(197,168,128,0.4)`,
                animation: `bvParticle ${p.dr}s ${p.dl}s infinite ease-in`,
              }} />
            ))}
          </div>

          {/* Угловые орнаменты */}
          {phase >= 1 && CORNERS.map((c, i) => (
            <motion.div key={i}
              className="absolute pointer-events-none"
              style={{ ...c.style, width: 32, height: 32 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 + i * 0.08, duration: 0.9 }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <motion.path
                  d={c.path}
                  stroke={GOLD} strokeWidth="0.8" strokeLinecap="round"
                  strokeDasharray="44"
                  initial={{ strokeDashoffset: 44 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ delay: 1.6 + i * 0.08, duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
                />
              </svg>
            </motion.div>
          ))}

          {/* ──── Основной контент ──────────────────────────── */}
          <div className="absolute inset-0 flex items-center justify-center select-none">
            <div style={{ position: 'relative', width: 300, height: 300 }}>

              <motion.svg
                width="300" height="300" viewBox="0 0 300 300"
                fill="none" className="absolute inset-0"
              >
                {/* ── Основные лучи (8) ──────────────────────── */}
                {MAJ_DEG.map((deg, i) => {
                  const r = deg * Math.PI / 180;
                  return (
                    <motion.line key={`mj${i}`}
                      x1={CX + R0 * Math.cos(r)}     y1={CY + R0 * Math.sin(r)}
                      x2={CX + R_MAJ * Math.cos(r)}  y2={CY + R_MAJ * Math.sin(r)}
                      stroke={GOLD_B} strokeWidth="0.85" strokeLinecap="round"
                      strokeDasharray={LEN_MAJ}
                      initial={{ strokeDashoffset: LEN_MAJ }}
                      animate={{ strokeDashoffset: phase >= 1 ? 0 : LEN_MAJ }}
                      transition={{ delay: 0.45 + i * 0.04, duration: 0.95, ease: [0.4, 0, 0.2, 1] }}
                    />
                  );
                })}

                {/* ── Вспомогательные лучи (8) ───────────────── */}
                {MIN_DEG.map((deg, i) => {
                  const r = deg * Math.PI / 180;
                  return (
                    <motion.line key={`mn${i}`}
                      x1={CX + R0 * Math.cos(r)}     y1={CY + R0 * Math.sin(r)}
                      x2={CX + R_MIN * Math.cos(r)}  y2={CY + R_MIN * Math.sin(r)}
                      stroke={GOLD} strokeWidth="0.5" strokeLinecap="round"
                      strokeDasharray={LEN_MIN}
                      initial={{ strokeDashoffset: LEN_MIN }}
                      animate={{ strokeDashoffset: phase >= 1 ? 0 : LEN_MIN }}
                      transition={{ delay: 0.62 + i * 0.04, duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
                    />
                  );
                })}

                {/* ── Точки на кончиках основных лучей ──────── */}
                {phase >= 1 && MAJ_DEG.map((deg, i) => {
                  const r = deg * Math.PI / 180;
                  return (
                    <motion.circle key={`dt${i}`}
                      cx={CX + R_MAJ * Math.cos(r)} cy={CY + R_MAJ * Math.sin(r)}
                      r="1.8" fill={GOLD_B}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.85 }}
                      transition={{ delay: 1.45 + i * 0.04, duration: 0.5 }}
                    />
                  );
                })}

                {/* ── Внутренняя бриллиантовая рамка ────────── */}
                <motion.path
                  d={dPath(D_IN)}
                  stroke={GOLD_B} strokeWidth="1.0" fill="none" strokeLinecap="round"
                  strokeDasharray={DIN_PERIM}
                  initial={{ strokeDashoffset: DIN_PERIM }}
                  animate={{ strokeDashoffset: phase >= 1 ? 0 : DIN_PERIM }}
                  transition={{ delay: 0.3, duration: 1.3, ease: [0.4, 0, 0.2, 1] }}
                />

                {/* ── Внешняя рамка — пунктир, вращается ────── */}
                <motion.path
                  d={dPath(D_OUT)}
                  stroke={GOLD} strokeWidth="0.6" fill="none"
                  strokeDasharray="4 12"
                  style={{ transformOrigin: '50% 50%' }}
                  initial={{ opacity: 0 }}
                  animate={phase >= 1 ? { opacity: 0.45, rotate: 360 } : { opacity: 0 }}
                  transition={{
                    opacity: { delay: 0.8, duration: 1.2, ease: 'easeOut' },
                    rotate:  { delay: 0.8, duration: 100, ease: 'linear', repeat: Infinity },
                  }}
                />

                {/* ── Бриллиантовый пульс 1 (вместо сонар-круга) */}
                {phase >= 1 && phase < 4 && (
                  <motion.path
                    d={PULSE} fill="none" stroke={GOLD_B} strokeWidth="1.5"
                    style={{ transformOrigin: '50% 50%' }}
                    initial={{ scale: 1, opacity: 0.35 }}
                    animate={{ scale: 2.3, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 3.8, delay: 2.0, ease: 'easeOut' }}
                  />
                )}

                {/* ── Бриллиантовый пульс 2 (смещение) ─────── */}
                {phase >= 1 && phase < 4 && (
                  <motion.path
                    d={PULSE} fill="none" stroke={GOLD} strokeWidth="1"
                    style={{ transformOrigin: '50% 50%' }}
                    initial={{ scale: 1, opacity: 0.22 }}
                    animate={{ scale: 2.3, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 3.8, delay: 3.9, ease: 'easeOut' }}
                  />
                )}
              </motion.svg>

              {/* Sparkle 1 — орбита по кончикам лучей */}
              {phase >= 1 && (
                <motion.div style={{
                  position: 'absolute', width: 4, height: 4, borderRadius: '50%',
                  background: GOLD_B, boxShadow: '0 0 10px 4px rgba(232,213,163,0.9)',
                  top: '50%', left: '50%',
                  marginTop: -(R_MAJ + 2), marginLeft: -2,
                  transformOrigin: `2px ${R_MAJ + 2}px`,
                }}
                  initial={{ rotate: 0, opacity: 0 }}
                  animate={{ rotate: 360, opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.3, delay: 1.2, ease: 'easeInOut', opacity: { times: [0, 0.07, 0.93, 1] } }}
                />
              )}

              {/* Sparkle 2 — орбита по внутренней рамке в обратную сторону */}
              {phase >= 1 && (
                <motion.div style={{
                  position: 'absolute', width: 3, height: 3, borderRadius: '50%',
                  background: GOLD_B, boxShadow: '0 0 8px 3px rgba(232,213,163,0.8)',
                  top: '50%', left: '50%',
                  marginTop: -(D_IN + 1), marginLeft: -1.5,
                  transformOrigin: `1.5px ${D_IN + 1}px`,
                }}
                  initial={{ rotate: 0, opacity: 0 }}
                  animate={{ rotate: -360, opacity: [0, 0.9, 0.9, 0] }}
                  transition={{ duration: 1.0, delay: 1.85, ease: 'easeInOut', opacity: { times: [0, 0.06, 0.94, 1] } }}
                />
              )}

              {/* Burst-волна когда монетка встала */}
              {phase >= 1 && (
                <motion.div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: 120, height: 120, marginTop: -60, marginLeft: -60,
                  borderRadius: '50%', border: '1.5px solid rgba(197,168,128,0.8)',
                  pointerEvents: 'none',
                }}
                  initial={{ scale: 1, opacity: 0 }}
                  animate={{ scale: 1.95, opacity: [0, 0.75, 0] }}
                  transition={{ delay: 2.05, duration: 1.4, ease: 'easeOut', opacity: { times: [0, 0.07, 1] } }}
                />
              )}

              {/* Логотип */}
              <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1200px' }}>
                <motion.div
                  style={{ position: 'relative', width: 120, height: 120 }}
                  initial={{ opacity: 0, rotateY: 180 }}
                  animate={phase >= 1 ? { opacity: 1, rotateY: 0 } : { opacity: 0, rotateY: 180 }}
                  transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    overflow: 'hidden', position: 'relative', background: CREAM,
                    boxShadow: `0 0 0 1px rgba(197,168,128,0.5),
                                0 0 28px rgba(197,168,128,0.38),
                                0 0 80px rgba(197,168,128,0.12)`,
                  }}>
                    <Image src="/logo-arka.png" alt="Barvikha" width={120} height={120} priority
                      className="object-contain w-full h-full" style={{ mixBlendMode: 'multiply' }} />
                    <motion.div className="absolute inset-0"
                      style={{ background: 'linear-gradient(110deg, transparent 20%, rgba(255,248,220,0.52) 50%, transparent 80%)' }}
                      initial={{ x: '-130%' }} animate={{ x: '130%' }}
                      transition={{ delay: 1.85, duration: 1.0, ease: 'easeInOut' }}
                    />
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Текст — абсолютно, не сдвигает кольца */}
            <AnimatePresence>
              {phase >= 2 && phase < 4 && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  style={{ position: 'absolute', top: 'calc(50% + 154px)', left: 0, right: 0, textAlign: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 14 }}>
                    <motion.div
                      style={{ height: '0.5px', width: 60, background: `linear-gradient(to right, transparent, ${GOLD})` }}
                      initial={{ scaleX: 0, transformOrigin: 'right' }} animate={{ scaleX: 1 }}
                      transition={{ duration: 0.75, delay: 0.1 }}
                    />
                    <span style={{ color: GOLD, fontSize: 6.5, opacity: 0.75, lineHeight: 1 }}>◆</span>
                    <motion.div
                      style={{ height: '0.5px', width: 60, background: `linear-gradient(to left, transparent, ${GOLD})` }}
                      initial={{ scaleX: 0, transformOrigin: 'left' }} animate={{ scaleX: 1 }}
                      transition={{ duration: 0.75, delay: 0.1 }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.28em' }}>
                    {TITLE_CHARS.map((char, i) => (
                      <motion.span key={i}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.06 * i, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                        style={{
                          fontFamily: "'Cormorant SC', 'Cormorant Garamond', Georgia, serif",
                          fontSize: 28, fontWeight: 600, color: GOLD_B, letterSpacing: '0.05em',
                          textTransform: 'uppercase', lineHeight: 1,
                          textShadow: '0 0 24px rgba(232,213,163,0.6), 0 0 8px rgba(232,213,163,0.35)',
                        }}
                      >{char}</motion.span>
                    ))}
                  </div>

                  {phase >= 3 && (
                    <>
                      <motion.div
                        initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 0.3 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        style={{ height: '0.5px', width: 90, background: GOLD, margin: '10px auto 8px' }}
                      />
                      <motion.p
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.55, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                        style={{
                          fontFamily: "'Cormorant SC', 'Cormorant Garamond', Georgia, serif",
                          fontSize: 8.5, fontWeight: 400, color: GOLD, letterSpacing: '0.45em',
                          textTransform: 'uppercase', marginTop: 0,
                        }}
                      >Since · 2017</motion.p>
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
