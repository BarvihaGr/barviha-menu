'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Не sessionStorage — обычная module-переменная: сбрасывается при полной
// перезагрузке страницы (в т.ч. hard refresh cmd+shift+r), но не мешает
// повторно проигрывать сплэш при обычной SPA-навигации между разделами.
let splashShown = false;

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(!splashShown);
  const [fading, setFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const dismiss = () => {
    setFading(true);
    setTimeout(() => setVisible(false), 700);
  };

  useEffect(() => {
    if (splashShown) return;
    splashShown = true;

    const maxTimer = setTimeout(dismiss, 6000);
    const video = videoRef.current;
    if (video) {
      video.addEventListener('ended', dismiss);
    }

    return () => {
      clearTimeout(maxTimer);
      video?.removeEventListener('ended', dismiss);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="splash"
            // Фон — тот же бежевый, что и у видео. На телефоне (узкий
            // контейнер, видео 16:9) по краям остаются поля этого цвета —
            // сам стык раньше был виден как ровный прямоугольник, потому
            // что край видео обрывался резко. Вместо этого видео зажато в
            // рамку строго по своим пропорциям (aspect-ratio, без лишнего
            // пустого поля внутри неё), а верх/низ этой рамки растушёваны
            // маской-градиентом — край тает в фон плавно, без единой линии.
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: '#DDD2C1',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            animate={{ opacity: fading ? 0 : 1 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            onClick={dismiss}
          >
            <video
              ref={videoRef}
              src="/splash/smesh-dj.mp4"
              autoPlay
              muted
              playsInline
              preload="auto"
              className="h-auto w-full max-h-full"
              style={{
                aspectRatio: '1920 / 1072',
                WebkitMaskImage:
                  'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
                maskImage:
                  'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
