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
  // null, пока не определили формат экрана — рендерим видео только после
  // этого, чтобы не подгружать/не мигать не тем форматом при гидрации.
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const dismiss = () => {
    setFading(true);
    setTimeout(() => setVisible(false), 700);
  };

  useEffect(() => {
    if (splashShown) return;
    splashShown = true;
    setIsMobile(window.matchMedia('(max-width: 767px)').matches);
  }, []);

  useEffect(() => {
    if (isMobile === null) return;

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
  }, [isMobile]);

  return (
    <>
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            key="splash"
            // Фон — тот же бежевый, что и у видео, виден только на долю
            // секунды до первого кадра. Видео берётся под формат экрана
            // (портретное 9:16 на телефоне, широкое 16:9 на планшете/
            // десктопе) и растягивается на весь экран через object-cover —
            // никакой рамки по aspect-ratio и никаких полей/линий по краям,
            // лишнее просто обрезается (реальные пропорции экранов почти
            // никогда не совпадают с ровным 9:16 или 16:9 один в один).
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: '#DDD2C1',
              overflow: 'hidden',
            }}
            animate={{ opacity: fading ? 0 : 1 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            onClick={dismiss}
          >
            {isMobile !== null && (
              <video
                ref={videoRef}
                src={isMobile ? '/splash/splash-9x16.mp4' : '/splash/splash-16x9.mp4'}
                autoPlay
                muted
                playsInline
                preload="auto"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
