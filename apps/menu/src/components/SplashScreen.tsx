'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const R = 88;
const CIRC = 2 * Math.PI * R;

// Палитра Киевской — слоновая кость + шампанское золото
const BG     = '#F0EAE0';
const RING   = '#C5A880';
const RING_D = 'rgba(197,168,128,0.18)';
const TEXT   = '#6B4A28';
const PORTAL = '#3C2210';

const STORAGE_KEY = 'bvh_splash_kiev';

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState(0);
  const [show, setShow] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.includes('kievskaia') || sessionStorage.getItem(STORAGE_KEY)) {
      setShow(false);
      return;
    }
    setShow(true);

    const ts = [
      setTimeout(() => setPhase(1), 850),   // кольцо рисуется
      setTimeout(() => setPhase(2), 1600),  // текст появляется
      setTimeout(() => setPhase(3), 2600),  // взрыв
      setTimeout(() => {
        sessionStorage.setItem(STORAGE_KEY, '1');
        setShow(false);
      }, 3700),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  return (
    <>
      {children}
      <AnimatePresence>
        {show === true && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[9999] overflow-hidden"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Слоновая кость */}
            <div className="absolute inset-0" style={{ background: BG }} />

            {/* Тёмный портал — расширяется из центра */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                className="rounded-full"
                style={{ background: PORTAL, flexShrink: 0 }}
                initial={{ width: 0, height: 0 }}
                animate={
                  phase >= 3
                    ? { width: '400vmax', height: '400vmax' }
                    : { width: 0, height: 0 }
                }
                transition={
                  phase >= 3
                    ? { duration: 1.1, ease: [0.65, 0, 0.35, 1] }
                    : { duration: 0.01 }
                }
              />
            </div>

            {/* Контент по центру */}
            <div className="absolute inset-0 flex flex-col items-center justify-center select-none">

              {/* Логотип + кольцо */}
              <motion.div
                className="relative"
                style={{ width: 200, height: 200 }}
                animate={
                  phase >= 3
                    ? { opacity: 0, scale: 0.9 }
                    : { opacity: 1, scale: 1 }
                }
                transition={{ duration: 0.55, ease: [0.4, 0, 1, 1] }}
              >
                {/* Кольцо */}
                <svg
                  className="absolute inset-0"
                  width="200" height="200" viewBox="0 0 200 200"
                  fill="none"
                >
                  {/* Направляющий круг */}
                  <circle cx="100" cy="100" r={R} stroke={RING_D} strokeWidth="1" />
                  {/* Анимированная обводка */}
                  <motion.circle
                    cx="100" cy="100" r={R}
                    stroke={RING}
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={CIRC}
                    transform="rotate(-90 100 100)"
                    initial={{ strokeDashoffset: CIRC }}
                    animate={{ strokeDashoffset: phase >= 1 ? 0 : CIRC }}
                    transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                  />
                </svg>

                {/* Дерево */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 1.0,
                      ease: [0.34, 1.05, 0.64, 1], // мягкий spring без перелёта
                    }}
                  >
                    <Image
                      src="/logo-arka.png"
                      alt="Barvikha"
                      width={112}
                      height={112}
                      priority
                      className="object-contain"
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Подпись */}
              <AnimatePresence>
                {phase >= 2 && phase < 3 && (
                  <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 0.6, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    style={{
                      fontFamily: "'Cormorant SC', 'Cormorant Garamond', Georgia, serif",
                      fontSize: 10,
                      fontWeight: 500,
                      color: TEXT,
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      marginTop: 22,
                    }}
                  >
                    Barvikha Group · Since 2017
                  </motion.p>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
