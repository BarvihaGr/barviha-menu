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
            // Фон — тот же бежевый, что и у самого видео (не чёрный). Видео —
            // object-contain (целиком, дерево никогда не обрезается по бокам
            // на узких/телефонных экранах), а поля вокруг совпадают по цвету
            // с фоном видео — граница не видна, бежевый как будто продолжается.
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#DDD2C1', overflow: 'hidden' }}
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
              className="h-full w-full object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
