'use client';

import { useEffect } from 'react';

/**
 * Затрудняет сохранение фото блюд: блокирует контекстное меню и drag
 * именно на <img>, не на всём сайте (чтобы не мешать копированию текста
 * цен/описаний). Полная защита от скриншота невозможна в браузере —
 * это осознанный компромисс, а не недоработка.
 */
export function ImageProtection() {
  useEffect(() => {
    const isImg = (target: EventTarget | null) =>
      target instanceof HTMLElement && target.tagName === 'IMG';

    const onContextMenu = (e: MouseEvent) => {
      if (isImg(e.target)) e.preventDefault();
    };
    const onDragStart = (e: DragEvent) => {
      if (isImg(e.target)) e.preventDefault();
    };

    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('dragstart', onDragStart);
    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('dragstart', onDragStart);
    };
  }, []);

  return null;
}
