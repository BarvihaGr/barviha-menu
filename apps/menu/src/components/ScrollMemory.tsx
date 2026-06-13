'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Память позиции скролла между страницами.
 *
 * Зачем: списки (категория, кальяны) тянутся из БД и при возврате назад
 * ремонтируются заново — нативный скролл сбивается в начало. Открыл карточку
 * товара снизу списка, вернулся — хотим попасть туда же, где остановились.
 *
 * Как определяем «возврат» НЕ полагаясь на popstate (в этом Next back-навигация
 * его не всегда даёт): запоминаем, с какой страницы пришли. Если вернулись на
 * список со страницы товара (/item/...) или корзины (/cart) — это возврат,
 * восстанавливаем сохранённую позицию. При обычном заходе в категорию — верх.
 * popstate, если он всё же сработал, тоже учитываем — как дополнительный сигнал.
 */

let navType: 'push' | 'pop' = 'push';
// Путь, с которого уходим (живёт между сменами маршрута в рамках SPA-сессии).
let prevPath: string | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    navType = 'pop';
  });
}

const key = (path: string) => `scroll:${path}`;

// «Детальные» страницы, возврат с которых на список = восстановить позицию.
const isDetailPath = (p: string) => /\/item\//.test(p) || /\/cart$/.test(p);

export function ScrollMemory() {
  const pathname = usePathname();

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const cameFromDetail = prevPath !== null && prevPath !== pathname && isDetailPath(prevPath);
    const isBack = navType === 'pop' || cameFromDetail;
    navType = 'push';
    prevPath = pathname; // для следующего перехода

    let stopRestore: (() => void) | null = null;
    if (isBack) {
      const saved = sessionStorage.getItem(key(pathname));
      if (saved) {
        const y = parseInt(saved, 10);
        // Одного scrollTo мало: Next, Framer и догрузка картинок могут сбить
        // скролл наверх уже ПОСЛЕ нас (особенно на длинном списке бара).
        // Поэтому несколько кадров удерживаем позицию, пока вёрстка не устаканится,
        // и отпускаем, как только пользователь сам тронул экран.
        let cancelled = false;
        let frames = 0;
        const cancel = () => {
          cancelled = true;
        };
        window.addEventListener('wheel', cancel, { passive: true, once: true });
        window.addEventListener('touchmove', cancel, { passive: true, once: true });
        const enforce = () => {
          if (cancelled) return;
          window.scrollTo(0, y);
          if (frames++ < 36) requestAnimationFrame(enforce); // ~600мс при 60fps
        };
        requestAnimationFrame(enforce);
        stopRestore = () => {
          cancelled = true;
          window.removeEventListener('wheel', cancel);
          window.removeEventListener('touchmove', cancel);
        };
      }
    }

    // По ходу скролла сохраняем позицию (троттлинг через rAF).
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        sessionStorage.setItem(key(pathname), String(window.scrollY));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
      stopRestore?.();
    };
  }, [pathname]);

  return null;
}
