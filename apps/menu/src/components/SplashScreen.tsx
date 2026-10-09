'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Не sessionStorage — обычная module-переменная: сбрасывается при полной
// перезагрузке страницы (в т.ч. hard refresh cmd+shift+r), но не мешает
// повторно проигрывать сплэш при обычной SPA-навигации между разделами.
let splashShown = false;

// Формат экрана (телефон/широкий) — внешнее состояние браузера: на сервере
// неизвестен (null), на клиенте читается синхронно и без setState в эффекте.
const MOBILE_QUERY = '(max-width: 767px)';
function subscribeMobile(cb: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}
const getMobile = () => window.matchMedia(MOBILE_QUERY).matches;
const getMobileServer = () => null;

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(!splashShown);
  const [fading, setFading] = useState(false);
  // null, пока не определили формат экрана (на сервере) — видео рендерим
  // только на клиенте, чтобы не подгружать/не мигать не тем форматом.
  const isMobile = useSyncExternalStore<boolean | null>(subscribeMobile, getMobile, getMobileServer);
  const videoRef = useRef<HTMLVideoElement>(null);

  const dismiss = () => {
    setFading(true);
    setTimeout(() => setVisible(false), 700);
  };

  useEffect(() => {
    splashShown = true;
  }, []);

  useEffect(() => {
    if (isMobile === null) return;

    const maxTimer = setTimeout(dismiss, 6000);
    const video = videoRef.current;
    // На медленной сети/первом коннекте одного autoPlay-атрибута не хватает —
    // видео может просто зависнуть в paused на первом кадре (readyState ещё
    // не дорос, а браузер не переопрашивает автоплей позже). Явно пробуем
    // play() сами и повторяем на loadeddata/canplay, пока не наберётся данных.
    // NotAllowedError — отдельный случай: это не «рано», а жёсткий отказ ОС
    // (напр. iOS Low Power Mode блокирует автоплей видео на уровне системы) —
    // повторами это не обойти, поэтому сразу закрываем заставку, а не
    // заставляем гостя 6 секунд смотреть на бежевый экран с иконкой play.
    const tryPlay = () => {
      video?.play().catch((err: DOMException) => {
        if (err?.name === 'NotAllowedError') dismiss();
      });
    };
    if (video) {
      tryPlay();
      video.addEventListener('loadeddata', tryPlay);
      video.addEventListener('canplay', tryPlay);
      video.addEventListener('ended', dismiss);
    }

    return () => {
      clearTimeout(maxTimer);
      video?.removeEventListener('loadeddata', tryPlay);
      video?.removeEventListener('canplay', tryPlay);
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
              // Под заставкой может быть открыто окно 18+ (Radix на время
              // модалки ставит body pointer-events: none) — без явного auto
              // заставку нельзя было бы пропустить тапом.
              pointerEvents: 'auto',
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
