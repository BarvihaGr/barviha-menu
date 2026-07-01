'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

const BG = '#F5E6D3';
const BROWN = '#2C0A00';

let splashShown = false;

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(!splashShown);
  const [phase, setPhase] = useState(0);
  // 0 = капля падает
  // 1 = логотип появляется (после удара)
  // 2 = текст бренда появляется
  // 3 = затухание

  useEffect(() => {
    if (splashShown) return;
    splashShown = true;

    const timers = [
      setTimeout(() => setPhase(1), 750),
      setTimeout(() => setPhase(2), 1350),
      setTimeout(() => setPhase(3), 3300),
      setTimeout(() => setVisible(false), 4100),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <>
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="splash"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: BG,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            animate={phase === 3 ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            onClick={() => {
              setPhase(3);
              setTimeout(() => setVisible(false), 800);
            }}
          >
            {/* Падающая капля */}
            <motion.div
              style={{
                position: 'absolute',
                left: '50%',
                marginLeft: -18,
                pointerEvents: 'none',
              }}
              initial={{ y: '-55vh' }}
              animate={{ y: phase === 0 ? 0 : 0 }}
              transition={{ duration: 0.65, ease: [0.4, 0, 0.85, 0.9] }}
            >
              <motion.div
                animate={phase >= 1 ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.18 }}
              >
                <svg width="36" height="48" viewBox="0 0 36 48" fill={BROWN}>
                  <path d="M18 0 C18 0 0 20 0 31 C0 40.941 8.059 48 18 48 C27.941 48 36 40.941 36 31 C36 20 18 0 18 0Z" />
                </svg>
              </motion.div>
            </motion.div>

            {/* Круги-волны при ударе */}
            {phase >= 1 && (
              <>
                <motion.div
                  style={{
                    position: 'absolute',
                    borderRadius: '50%',
                    border: `1.5px solid ${BROWN}`,
                    width: 40,
                    height: 40,
                    pointerEvents: 'none',
                  }}
                  initial={{ scale: 1, opacity: 0.65 }}
                  animate={{ scale: 11, opacity: 0 }}
                  transition={{ duration: 1.0, ease: 'easeOut' }}
                />
                <motion.div
                  style={{
                    position: 'absolute',
                    borderRadius: '50%',
                    border: `1px solid ${BROWN}`,
                    width: 40,
                    height: 40,
                    pointerEvents: 'none',
                  }}
                  initial={{ scale: 1, opacity: 0.4 }}
                  animate={{ scale: 7, opacity: 0 }}
                  transition={{ duration: 0.75, ease: 'easeOut', delay: 0.1 }}
                />
              </>
            )}

            {/* Логотип + текст бренда */}
            {phase >= 1 && (
              <motion.div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 24,
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
                initial={{ scale: 0.55, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Логотип дерева (кроп: убираем текст внизу logo-arka.png) */}
                <div
                  style={{
                    width: 168,
                    height: 108,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Image
                    src="/logo-arka.png"
                    alt="Barvikha"
                    fill
                    priority
                    style={{ objectFit: 'cover', objectPosition: '50% 0%' }}
                  />
                </div>

                {/* Название бренда */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                >
                  <div
                    style={{
                      fontFamily: "'Cormorant SC', 'Cormorant Garamond', serif",
                      fontSize: 20,
                      fontWeight: 500,
                      letterSpacing: '0.24em',
                      color: BROWN,
                      lineHeight: 1.2,
                    }}
                  >
                    BARVIKHA GROUP
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 10,
                      letterSpacing: '0.32em',
                      color: BROWN,
                      opacity: 0.5,
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    SINCE · 2017
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Подсказка «тап для пропуска» */}
            {phase >= 2 && (
              <motion.div
                style={{
                  position: 'absolute',
                  bottom: 48,
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  color: BROWN,
                  opacity: 0,
                  fontFamily: 'Inter, sans-serif',
                }}
                animate={{ opacity: 0.35 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                TAP TO SKIP
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
