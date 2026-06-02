'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Длинное описание блюда: показываем обрезанным (с плавным затуханием снизу),
 * по кнопке «Читать дальше» раскрываем полностью. Короткие описания
 * (≤ порога) показываем целиком без кнопки.
 */
export function ExpandableText({
  text,
  className = '',
  threshold = 180,
}: {
  text: string;
  className?: string;
  threshold?: number;
}) {
  const t = useTranslations('item');
  const [open, setOpen] = useState(false);
  const long = text.length > threshold;

  if (!long) {
    return <p className={className}>{text}</p>;
  }

  return (
    <div>
      <div className="relative">
        <p
          className={`${className} overflow-hidden transition-all duration-300 ${
            open ? 'max-h-[1200px]' : 'max-h-[4.8em]'
          }`}
        >
          {text}
        </p>
        {!open && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card to-transparent" />
        )}
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-2 text-[11px] uppercase tracking-[0.2em] text-gold transition-opacity hover:opacity-70"
      >
        {open ? t('less') : t('more')}
      </button>
    </div>
  );
}
