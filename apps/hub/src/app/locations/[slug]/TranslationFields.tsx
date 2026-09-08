'use client';

import { useState } from 'react';

export interface TranslatablePatch {
  name_en?: string | null;
  name_zh?: string | null;
  name_hy?: string | null;
  name_uz?: string | null;
  name_ar?: string | null;
  description_en?: string | null;
  description_zh?: string | null;
  description_hy?: string | null;
  description_uz?: string | null;
  description_ar?: string | null;
  composition_en?: string | null;
  composition_zh?: string | null;
  composition_hy?: string | null;
  composition_uz?: string | null;
  composition_ar?: string | null;
}

/**
 * Свёрнутый по умолчанию блок переводов позиции (EN/ZH/HY) — название,
 * описание и (опционально) состав на каждый язык. Пусто = на живом меню
 * используется автоперевод/русский оригинал (см. pickItemName в apps/menu).
 */
export function TranslationFields({
  draft,
  save,
  hasComposition = false,
}: {
  draft: TranslatablePatch;
  save: (patch: Partial<TranslatablePatch>) => void;
  hasComposition?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-[color:var(--border)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs text-[color:var(--muted)]"
      >
        <span>🌐 Переводы (EN / ZH / HY / UZ / AR)</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="flex flex-col gap-4 border-t border-[color:var(--border)] p-3">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.15em] text-[color:var(--muted)]">English</span>
            <input
              placeholder="Название"
              defaultValue={draft.name_en ?? ''}
              onBlur={(e) => save({ name_en: e.target.value || null })}
              className="input"
            />
            <textarea
              placeholder="Описание"
              rows={2}
              defaultValue={draft.description_en ?? ''}
              onBlur={(e) => save({ description_en: e.target.value || null })}
              className="input"
            />
            {hasComposition && (
              <textarea
                placeholder="Состав"
                rows={2}
                defaultValue={draft.composition_en ?? ''}
                onBlur={(e) => save({ composition_en: e.target.value || null })}
                className="input"
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.15em] text-[color:var(--muted)]">中文</span>
            <input
              placeholder="Название"
              defaultValue={draft.name_zh ?? ''}
              onBlur={(e) => save({ name_zh: e.target.value || null })}
              className="input"
            />
            <textarea
              placeholder="Описание"
              rows={2}
              defaultValue={draft.description_zh ?? ''}
              onBlur={(e) => save({ description_zh: e.target.value || null })}
              className="input"
            />
            {hasComposition && (
              <textarea
                placeholder="Состав"
                rows={2}
                defaultValue={draft.composition_zh ?? ''}
                onBlur={(e) => save({ composition_zh: e.target.value || null })}
                className="input"
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.15em] text-[color:var(--muted)]">Հայերեն</span>
            <input
              placeholder="Название"
              defaultValue={draft.name_hy ?? ''}
              onBlur={(e) => save({ name_hy: e.target.value || null })}
              className="input"
            />
            <textarea
              placeholder="Описание"
              rows={2}
              defaultValue={draft.description_hy ?? ''}
              onBlur={(e) => save({ description_hy: e.target.value || null })}
              className="input"
            />
            {hasComposition && (
              <textarea
                placeholder="Состав"
                rows={2}
                defaultValue={draft.composition_hy ?? ''}
                onBlur={(e) => save({ composition_hy: e.target.value || null })}
                className="input"
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.15em] text-[color:var(--muted)]">Oʻzbekcha</span>
            <input
              placeholder="Название"
              defaultValue={draft.name_uz ?? ''}
              onBlur={(e) => save({ name_uz: e.target.value || null })}
              className="input"
            />
            <textarea
              placeholder="Описание"
              rows={2}
              defaultValue={draft.description_uz ?? ''}
              onBlur={(e) => save({ description_uz: e.target.value || null })}
              className="input"
            />
            {hasComposition && (
              <textarea
                placeholder="Состав"
                rows={2}
                defaultValue={draft.composition_uz ?? ''}
                onBlur={(e) => save({ composition_uz: e.target.value || null })}
                className="input"
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-[0.15em] text-[color:var(--muted)]">العربية</span>
            <input
              placeholder="Название"
              dir="rtl"
              defaultValue={draft.name_ar ?? ''}
              onBlur={(e) => save({ name_ar: e.target.value || null })}
              className="input"
            />
            <textarea
              placeholder="Описание"
              rows={2}
              dir="rtl"
              defaultValue={draft.description_ar ?? ''}
              onBlur={(e) => save({ description_ar: e.target.value || null })}
              className="input"
            />
            {hasComposition && (
              <textarea
                placeholder="Состав"
                rows={2}
                dir="rtl"
                defaultValue={draft.composition_ar ?? ''}
                onBlur={(e) => save({ composition_ar: e.target.value || null })}
                className="input"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
