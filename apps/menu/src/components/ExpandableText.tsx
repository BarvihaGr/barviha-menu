'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Описание блюда: по умолчанию — только первое предложение (кратко).
 * Если есть ещё текст — кнопка «Читать дальше».
 */
export function ExpandableText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
  threshold?: number; // оставлен для совместимости, не используется
}) {
  const t = useTranslations('item');
  const [open, setOpen] = useState(false);

  // Первое предложение — до первой точки/восклицания/вопроса + пробел
  const firstMatch = text.match(/^.+?[.!?…](\s|$)/);
  const preview = firstMatch ? firstMatch[0].trim() : text;
  const rest = text.slice(preview.length).trim();
  const hasMore = rest.length > 0;

  return (
    <div>
      <p className={className}>
        {open ? text : preview}
      </p>
      {hasMore && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-1.5 text-[11px] uppercase tracking-[0.2em] text-gold transition-opacity hover:opacity-70"
        >
          {open ? t('less') : t('more')}
        </button>
      )}
    </div>
  );
}
