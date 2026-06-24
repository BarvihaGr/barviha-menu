'use client';

import { useEffect, useRef } from 'react';

interface Props {
  src: string;
  poster?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Видео с гарантированным автоплеем на мобильных (iOS Safari).
 * autoPlay-атрибут + programmatic .play() после маунта — двойная страховка.
 */
export function AutoPlayVideo({ src, poster, className, style }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true;
    el.play().catch(() => {
      // Если браузер заблокировал автоплей — молча игнорируем
    });
  }, []);

  return (
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
      className={className}
      style={style}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
