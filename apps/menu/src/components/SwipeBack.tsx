'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

/**
 * Свайп вправо (от левого края экрана) → router.back().
 * Только touch-устройства (мобилка, iPad) — на десктопе не работает.
 * iOS Safari делает то же системно, но в PWA standalone / Android Chrome
 * нативного жеста нет — этот хендлер закрывает дыру.
 */
export function SwipeBack() {
  const router = useRouter();

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startT = 0;
    let active = false;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      // Только от левых 32px экрана — чтобы не мешать обычному скроллу/свайпам
      if (t.clientX > 32) {
        active = false;
        return;
      }
      startX = t.clientX;
      startY = t.clientY;
      startT = Date.now();
      active = true;
    };

    const onEnd = (e: TouchEvent) => {
      if (!active) return;
      active = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = Math.abs(t.clientY - startY);
      const dt = Date.now() - startT;
      // ≥ 80px вправо, малый вертикальный сдвиг, не дольше 700ms
      if (dx > 80 && dy < 60 && dt < 700) {
        router.back();
      }
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [router]);

  return null;
}
