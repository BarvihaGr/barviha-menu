'use client';

import { X } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';

/**
 * Крестик закрытия карточки товара. По клику — назад в историю
 * (router.back), а если открыли по прямой ссылке (истории нет) —
 * на главную локации (fallbackHref).
 */
export function ItemCloseButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Закрыть"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
      className="absolute left-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/90 backdrop-blur-sm transition hover:border-gold hover:text-gold cursor-pointer"
    >
      <X size={16} />
    </button>
  );
}
