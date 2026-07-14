'use client';

import { useEffect, useState } from 'react';

/** Короткая надпись «сохранено», гаснет через пару секунд после save(). */
export function SavedBadge({ savedAt }: { savedAt: number | null }) {
  const [visible, setVisible] = useState(false);
  // "Показать" решаем во время рендера (не в эффекте) при новом savedAt —
  // так React не делает лишний каскадный ре-рендер после коммита. "Спрятать
  // через таймер" — легитимная подписка на внешний таймер, эффект тут
  // уместен; savedAt в зависимостях, чтобы повторный save в течение 1.5с
  // корректно перезапускал таймер, даже если visible уже было true.
  const [shownAt, setShownAt] = useState<number | null>(null);
  if (savedAt !== null && savedAt !== shownAt) {
    setShownAt(savedAt);
    setVisible(true);
  }

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(t);
  }, [visible, savedAt]);

  if (!visible) return <span className="w-14 shrink-0" />;
  return <span className="w-14 shrink-0 text-right text-[11px] text-[color:var(--ok)]">сохранено</span>;
}
