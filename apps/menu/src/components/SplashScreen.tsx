'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

// ─── Palette ───────────────────────────────────────────────
const BG       = '#070605';
const BARK_LOW = '#5C4A30';
const BARK_HI  = '#C5A880';
const GOLD     = '#C5A880';
const GOLD_B   = '#F0DFB0';

// ─── Tree geometry (viewBox 300×300) ──────────────────────
const TRUNK_D = 'M150,254 C146,232 154,212 150,192 C147,176 152,162 150,148';

type Tier = 'front' | 'mid' | 'back';
type Branch = { id: string; d: string; w: number; delay: number; dur: number; tip: [number, number]; tier: Tier; leaves: { dx: number; dy: number; r: number }[] };

// Глубина: передние ветки крупнее/чётче, задние — мельче и слегка размыты
const TIER_STYLE: Record<Tier, { scale: number; opacity: number; blur: number }> = {
  front: { scale: 1.1, opacity: 1, blur: 0 },
  mid: { scale: 1, opacity: 0.94, blur: 0 },
  back: { scale: 0.86, opacity: 0.8, blur: 0.7 },
};

const LEAF_CLUSTER = [
  { dx: 0, dy: -9, r: 6.5 },
  { dx: -10, dy: 4, r: 5 },
  { dx: 9, dy: 5, r: 5.5 },
  { dx: -3, dy: -3, r: 4 },
];

const BRANCHES: Branch[] = [
  { id: 'll', d: 'M150,226 C121,223 96,211 68,189', w: 2.2, delay: 0.55, dur: 0.75, tip: [68, 189], tier: 'front', leaves: LEAF_CLUSTER },
  { id: 'lr', d: 'M150,226 C179,223 204,211 232,189', w: 2.2, delay: 0.6, dur: 0.75, tip: [232, 189], tier: 'front', leaves: LEAF_CLUSTER },
  { id: 'ml', d: 'M150,199 C125,189 102,169 82,143', w: 1.9, delay: 0.78, dur: 0.7, tip: [82, 143], tier: 'mid', leaves: LEAF_CLUSTER },
  { id: 'mr', d: 'M150,199 C175,189 198,169 218,143', w: 1.9, delay: 0.83, dur: 0.7, tip: [218, 143], tier: 'mid', leaves: LEAF_CLUSTER },
  { id: 'ul', d: 'M150,173 C133,156 118,133 104,105', w: 1.5, delay: 1.0, dur: 0.65, tip: [104, 105], tier: 'back', leaves: LEAF_CLUSTER },
  { id: 'ur', d: 'M150,173 C167,156 182,133 196,105', w: 1.5, delay: 1.05, dur: 0.65, tip: [196, 105], tier: 'back', leaves: LEAF_CLUSTER },
  { id: 'top', d: 'M150,151 C150,129 150,109 150,81', w: 1.7, delay: 0.7, dur: 0.7, tip: [150, 81], tier: 'mid', leaves: LEAF_CLUSTER },
];

function leafPath(cx: number, cy: number, r: number) {
  return `M ${cx},${cy - r} L ${cx + r},${cy} L ${cx},${cy + r} L ${cx - r},${cy} Z`;
}

const ORBIT_D = 'M 8,165 A 142,56 0 1 1 292,165 A 142,56 0 1 1 8,165 Z';

const PARTICLES = [
  { l: 6, dl: 0.4, dr: 4.8, s: 1.5 }, { l: 14, dl: 1.8, dr: 3.9, s: 1 },
  { l: 23, dl: 0.7, dr: 4.5, s: 2 }, { l: 31, dl: 2.2, dr: 4.2, s: 1.5 },
  { l: 40, dl: 0.3, dr: 5.0, s: 1 }, { l: 49, dl: 1.4, dr: 4.1, s: 2 },
  { l: 58, dl: 0.9, dr: 4.7, s: 1 }, { l: 67, dl: 1.9, dr: 3.8, s: 2 },
  { l: 76, dl: 0.5, dr: 4.4, s: 1.5 }, { l: 85, dl: 1.6, dr: 4.9, s: 1 },
  { l: 93, dl: 0.2, dr: 4.3, s: 2 }, { l: 18, dl: 2.5, dr: 3.7, s: 1.5 },
];

const TITLE_CHARS = 'BARVIKHA'.split('');
let splashShown = false;

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState(0);
  const [show, setShow] = useState<boolean | null>(null);
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);

  // pointer-driven parallax tilt
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const rotateX = useSpring(mvY, { stiffness: 80, damping: 16 });
  const rotateY = useSpring(mvX, { stiffness: 80, damping: 16 });

  useEffect(() => {
    if (!pathname.includes('kievskaia') || splashShown) {
      setShow(false);
      return;
    }
    splashShown = true;
    setShow(true);
    const ts = [
      setTimeout(() => setPhase(1), 700),
      setTimeout(() => setPhase(2), 2950),
      setTimeout(() => setPhase(3), 3950),
      setTimeout(() => setPhase(4), 5350),
      setTimeout(() => setShow(false), 6550),
    ];
    return () => ts.forEach(clearTimeout);
  }, [pathname]);

  useEffect(() => {
    if (show !== true) return;
    const onMove = (clientX: number, clientY: number) => {
      const el = rootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nx = (clientX - r.left) / r.width - 0.5;
      const ny = (clientY - r.top) / r.height - 0.5;
      mvX.set(nx * 16);
      mvY.set(ny * -14);
    };
    const onPointer = (e: PointerEvent) => onMove(e.clientX, e.clientY);
    window.addEventListener('pointermove', onPointer);
    return () => window.removeEventListener('pointermove', onPointer);
  }, [show, mvX, mvY]);

  return (
    <>
      {children}

      {show === true && (
        <div
          ref={rootRef}
          className="fixed inset-0 z-[9999] overflow-hidden"
          style={{
            background: `radial-gradient(ellipse 60% 60% at 50% 45%, #14100a 0%, ${BG} 100%)`,
            clipPath: phase >= 4 ? 'circle(0% at 50% 50%)' : 'circle(150% at 50% 50%)',
            transition: phase >= 4 ? 'clip-path 1.3s cubic-bezier(0.4,0,0.2,1)' : 'none',
          }}
        >
          <style>{`
            @keyframes bvParticle {
              0%   { transform: translateY(0);      opacity: 0;    }
              12%  {                                 opacity: 0.45; }
              88%  {                                 opacity: 0.12; }
              100% { transform: translateY(-100vh); opacity: 0;    }
            }
            @keyframes bvDrift1 {
              0%, 100% { transform: translate(-6%, -4%) scale(1); }
              50%      { transform: translate(5%, 4%) scale(1.15); }
            }
            @keyframes bvDrift2 {
              0%, 100% { transform: translate(6%, 5%) scale(1.1); }
              50%      { transform: translate(-5%, -3%) scale(0.95); }
            }
          `}</style>

          {/* Дрейфующий ауреольный фон (aurora mesh) */}
          <div className="absolute inset-0 pointer-events-none" style={{ mixBlendMode: 'screen' }}>
            <div style={{
              position: 'absolute', left: '20%', top: '15%', width: '60%', height: '60%',
              background: 'radial-gradient(circle, rgba(197,168,128,0.16) 0%, transparent 70%)',
              filter: 'blur(40px)', animation: 'bvDrift1 9s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', left: '15%', top: '25%', width: '55%', height: '55%',
              background: 'radial-gradient(circle, rgba(232,213,163,0.10) 0%, transparent 70%)',
              filter: 'blur(46px)', animation: 'bvDrift2 11s ease-in-out infinite',
            }} />
          </div>

          {/* Виньетка */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 62% 62% at 50% 50%, transparent 30%, rgba(0,0,0,0.75) 100%)',
          }} />

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

          {/* ──── 3D сцена ──────────────────────────────────── */}
          <div className="absolute inset-0 flex items-center justify-center select-none" style={{ perspective: 1400 }}>
            {/* Кинематографичный отъезд камеры на старте роста */}
            <motion.div
              style={{ position: 'relative', width: 320, height: 320, transformStyle: 'preserve-3d' }}
              initial={{ scale: 1.22, y: 22 }}
              animate={phase >= 1 ? { scale: 1, y: 0 } : { scale: 1.22, y: 22 }}
              transition={{ duration: 1.9, ease: [0.16, 1, 0.3, 1] }}
            >
            {/* Автономный «дышащий» наклон — живость на любом устройстве */}
            <motion.div
              style={{ position: 'relative', width: 320, height: 320, transformStyle: 'preserve-3d' }}
              animate={phase >= 1 && phase < 4 ? { rotateY: [-4, 4, -4], rotateX: [1.5, -1.5, 1.5] } : { rotateY: 0, rotateX: 0 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Указательный параллакс поверх автономного движения */}
              <motion.div
                style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', rotateX, rotateY }}
              >
                <svg width="320" height="320" viewBox="0 0 300 300" fill="none" className="absolute inset-0" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="barkGrad" x1="0" y1="260" x2="0" y2="80" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor={BARK_LOW} />
                      <stop offset="100%" stopColor={BARK_HI} />
                    </linearGradient>
                  </defs>

                  {/* ── Падающее семя и вспышка удара — рождение дерева ── */}
                  <motion.circle
                    cx={150} r={2.6} fill={GOLD_B}
                    style={{ filter: 'drop-shadow(0 0 6px rgba(240,223,176,0.9))' }}
                    initial={{ cy: 10, opacity: 0 }}
                    animate={{ cy: [10, 254], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 0.55, delay: 0.05, ease: 'easeIn', times: [0, 0.82, 0.92, 1] }}
                  />
                  <motion.circle
                    cx={150} cy={254} r={3} fill="none" stroke={GOLD_B} strokeWidth="1.1"
                    style={{ transformOrigin: '150px 254px' }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1, 3], opacity: [0, 0.9, 0] }}
                    transition={{ delay: 0.58, duration: 0.55, ease: 'easeOut' }}
                  />
                  <motion.circle
                    cx={150} cy={254} r={9} fill={GOLD_B}
                    style={{ transformOrigin: '150px 254px', filter: 'blur(3px)' }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.4], opacity: [0, 0.8, 0] }}
                    transition={{ delay: 0.58, duration: 0.4, ease: 'easeOut' }}
                  />

                  {/* ── Орбитальное кольцо (эллипс, имитация 3D-наклона) ── */}
                  <motion.path
                    d={ORBIT_D} stroke={GOLD} strokeWidth="0.6" fill="none" strokeDasharray="3 10"
                    style={{ transformOrigin: '150px 165px' }}
                    initial={{ opacity: 0 }}
                    animate={phase >= 1 ? { opacity: 0.4, rotate: 360 } : { opacity: 0 }}
                    transition={{
                      opacity: { delay: 0.4, duration: 1 },
                      rotate: { delay: 0.4, duration: 70, ease: 'linear', repeat: Infinity },
                    }}
                  />
                  {phase >= 1 && (
                    <>
                      <circle r="2.2" fill={GOLD_B} opacity="0.9">
                        <animateMotion dur="6s" repeatCount="indefinite" path={ORBIT_D} />
                      </circle>
                      <circle r="1.6" fill={GOLD} opacity="0.7">
                        <animateMotion dur="9s" begin="-3s" repeatCount="indefinite" path={ORBIT_D} />
                      </circle>
                    </>
                  )}

                  {/* ── Набросок ветвей растворяется, когда проявляется настоящий герб ── */}
                  <motion.g
                    initial={{ opacity: 1 }}
                    animate={phase >= 1 ? { opacity: 0 } : { opacity: 1 }}
                    transition={{ delay: 1.9, duration: 0.9, ease: 'easeInOut' }}
                  >
                  {/* ── Ствол ── */}
                  <motion.path
                    d={TRUNK_D} stroke="url(#barkGrad)" strokeWidth="3.4" strokeLinecap="round" fill="none"
                    pathLength={1}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={phase >= 1 ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                    transition={{ duration: 0.95, ease: [0.34, 0.01, 0.2, 1] }}
                  />

                  {/* ── Ветки (с глубиной: передний/задний план) ── */}
                  {BRANCHES.map((b) => {
                    const t = TIER_STYLE[b.tier];
                    return (
                      <motion.path
                        key={b.id}
                        d={b.d} stroke="url(#barkGrad)" strokeWidth={b.w * t.scale} strokeLinecap="round" fill="none"
                        pathLength={1}
                        style={t.blur ? { filter: `blur(${t.blur}px)` } : undefined}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={phase >= 1 ? { pathLength: 1, opacity: t.opacity } : { pathLength: 0, opacity: 0 }}
                        transition={{ delay: b.delay, duration: b.dur, ease: [0.34, 0.01, 0.2, 1] }}
                      />
                    );
                  })}

                  {/* ── Листья — распускаются каскадом, каждый со вспышкой-искрой ── */}
                  {phase >= 1 && BRANCHES.map((b) => {
                    const t = TIER_STYLE[b.tier];
                    return b.leaves.map((lf, li) => {
                      const x = b.tip[0] + lf.dx;
                      const y = b.tip[1] + lf.dy;
                      const r = lf.r * t.scale;
                      const leafDelay = b.delay + b.dur - 0.15 + li * 0.07;
                      return (
                        <g key={`${b.id}-leaf-${li}`}>
                          <motion.circle
                            cx={x} cy={y} r={r} fill="none" stroke={GOLD_B} strokeWidth="0.8"
                            style={{ transformOrigin: `${x}px ${y}px` }}
                            initial={{ scale: 0.3, opacity: 0 }}
                            animate={{ scale: [0.3, 2.6], opacity: [0, 0.6, 0] }}
                            transition={{ delay: leafDelay, duration: 0.5, ease: 'easeOut' }}
                          />
                          <motion.path
                            d={leafPath(x, y, r)}
                            fill={GOLD_B}
                            style={{
                              transformOrigin: `${x}px ${y}px`,
                              filter: t.blur
                                ? `blur(${t.blur}px) drop-shadow(0 0 5px rgba(240,223,176,0.65))`
                                : 'drop-shadow(0 0 5px rgba(240,223,176,0.65))',
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: t.opacity }}
                            transition={{ delay: leafDelay, duration: 0.55, ease: [0.18, 1.4, 0.4, 1] }}
                          />
                        </g>
                      );
                    });
                  })}

                  {/* ── Лёгкая пульсация кроны после распускания ── */}
                  {phase >= 1 && phase < 4 && (
                    <motion.g
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.5, 0] }}
                      transition={{ delay: 2.4, duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {BRANCHES.map((b) => (
                        <circle key={`glow-${b.id}`} cx={b.tip[0]} cy={b.tip[1]} r="14" fill={GOLD_B} opacity="0.12" />
                      ))}
                    </motion.g>
                  )}
                  </motion.g>
                </svg>

                {/* ── Настоящий герб Barvikha — проявляется на месте наброска ── */}
                <motion.div
                  className="absolute pointer-events-none overflow-hidden"
                  style={{ width: 232, height: 150, top: '50%', left: '50%', marginTop: -108, marginLeft: -116 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={phase >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                  transition={{ delay: 1.95, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* кроп: в исходном файле под кроной зашит белый текст-лого — обрезаем его,
                      у нас уже есть собственный золотой заголовок ниже */}
                  <Image
                    src="/logo-arka.png" alt="Barvikha" fill priority
                    style={{
                      objectFit: 'cover', objectPosition: '50% 0%',
                      filter: 'drop-shadow(0 0 22px rgba(197,168,128,0.4)) drop-shadow(0 0 4px rgba(240,223,176,0.5))',
                    }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Световой блик, скользящий по кроне после полного распускания */}
            {phase >= 1 && phase < 4 && (
              <motion.div
                className="pointer-events-none"
                style={{
                  position: 'absolute', inset: -40, mixBlendMode: 'screen',
                  background: 'linear-gradient(115deg, transparent 42%, rgba(255,248,220,0.55) 50%, transparent 58%)',
                }}
                initial={{ x: '-140%', opacity: 0 }}
                animate={{ x: '140%', opacity: [0, 1, 1, 0] }}
                transition={{ delay: 2.1, duration: 1.1, ease: 'easeInOut', times: [0, 0.15, 0.85, 1] }}
              />
            )}
            </motion.div>

            {/* Текст */}
            <AnimatePresence>
              {phase >= 2 && phase < 4 && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  style={{ position: 'absolute', top: 'calc(50% + 168px)', left: 0, right: 0, textAlign: 'center' }}
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

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.28em', perspective: 400 }}>
                    {TITLE_CHARS.map((char, i) => (
                      <motion.span key={i}
                        initial={{ opacity: 0, rotateX: -90, y: 6 }}
                        animate={{ opacity: 1, rotateX: 0, y: 0 }}
                        transition={{ delay: 0.06 * i, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                        style={{
                          display: 'inline-block', transformOrigin: '50% 100%',
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
