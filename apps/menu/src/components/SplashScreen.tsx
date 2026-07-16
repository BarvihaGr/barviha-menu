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
            className="flex items-center justify-center"
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', overflow: 'hidden' }}
            animate={{ opacity: fading ? 0 : 1 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            onClick={dismiss}
          >
            {/* Телефон/планшет — во весь экран (cover). От ноутбука (xl, 1280px+)
                кадр «отдаляем»: видео чуть меньше вьюпорта, целиком видно (contain),
                с чёрными полями вокруг — выглядит собраннее, не так плотно прижато к краям. */}
            <video
              ref={videoRef}
              src="/splash/smesh-dj.mp4"
              autoPlay
              muted
              playsInline
              preload="auto"
              className="h-full w-full object-cover xl:h-auto xl:max-h-[80vh] xl:w-[min(85vw,1500px)] xl:rounded-2xl xl:object-contain xl:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.85)]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
