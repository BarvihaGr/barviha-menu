'use client';

import { useEffect, useState } from 'react';

export interface SaveStatus {
  at: number;
  ok: boolean;
}

/**
 * Короткая надпись «сохранено» / «не сохранилось» — гаснет через пару секунд
 * после успешного save(), но задерживается на ошибке (см. `ok`), чтобы
 * редактор реально заметил проблему, а не продолжил печатать поверх поля,
 * которое на самом деле не долетело до диска (см. коммит про silent-failure
 * в BarEditor/CatalogEditor — раньше ошибка сохранения не показывалась вообще,
 * и человек мог полностью заполнить бар в бэк-офисе, а часть правок молча
 * терялась).
 */
export function SavedBadge({ status }: { status: SaveStatus | null }) {
  const [visible, setVisible] = useState(false);
  // "Показать" решаем во время рендера (не в эффекте) при новом status —
  // так React не делает лишний каскадный ре-рендер после коммита. "Спрятать
  // через таймер" — легитимная подписка на внешний таймер, эффект тут
  // уместен; status в зависимостях, чтобы повторный save в течение окна
  // корректно перезапускал таймер, даже если visible уже было true.
  const [shownAt, setShownAt] = useState<number | null>(null);
  if (status !== null && status.at !== shownAt) {
    setShownAt(status.at);
    setVisible(true);
  }

  useEffect(() => {
    if (!visible || !status) return;
    // Ошибку держим на экране заметно дольше — успех можно пропустить
    // взглядом, а сообщение о потере правки — нет.
    const t = setTimeout(() => setVisible(false), status.ok ? 1500 : 8000);
    return () => clearTimeout(t);
  }, [visible, status]);

  if (!visible || !status) return <span className="w-14 shrink-0" />;
  return status.ok ? (
    <span className="w-14 shrink-0 text-right text-[11px] text-[color:var(--ok)]">сохранено</span>
  ) : (
    <span className="shrink-0 text-right text-[11px] font-medium text-red-500" title="Правка не сохранилась — повторите">
      не сохранено
    </span>
  );
}
