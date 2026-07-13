'use client';

import { useEffect, useState } from 'react';

/** Короткая надпись «сохранено», гаснет через пару секунд после save(). */
export function SavedBadge({ savedAt }: { savedAt: number | null }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!savedAt) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(t);
  }, [savedAt]);

  if (!visible) return <span className="w-14 shrink-0" />;
  return <span className="w-14 shrink-0 text-right text-[11px] text-[color:var(--ok)]">сохранено</span>;
}
