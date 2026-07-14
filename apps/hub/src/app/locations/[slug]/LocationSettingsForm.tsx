'use client';

import { useState } from 'react';
import type { LocationSettings } from '@barviha/db';
import { SavedBadge } from './SavedBadge';

export function LocationSettingsForm({ slug, settings }: { slug: string; settings: LocationSettings }) {
  const [draft, setDraft] = useState(settings);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function save(patch: Partial<LocationSettings>) {
    const next = { ...draft, ...patch };
    setDraft(next);
    await fetch(`/api/locations/${slug}/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    setSavedAt(Date.now());
  }

  return (
    <div className="flex max-w-md flex-col gap-4 px-4 sm:px-8 py-6">
      <div className="flex items-center justify-between rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
        <div>
          <div className="text-sm text-[color:var(--text)]">Локация активна</div>
          <div className="text-xs text-[color:var(--muted)]">Выключить — меню онлайн покажет заглушку вместо каталога</div>
        </div>
        <div className="flex items-center gap-3">
          <SavedBadge savedAt={savedAt} />
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(e) => save({ is_active: e.target.checked })}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-[color:var(--surface-2)] transition-colors peer-checked:bg-[color:var(--ok)]" />
            <div className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
          </label>
        </div>
      </div>

      <label className="flex flex-col gap-1 text-xs text-[color:var(--muted)]">
        Расположение (адрес)
        <input
          defaultValue={draft.address ?? ''}
          onBlur={(e) => save({ address: e.target.value || null })}
          className="input"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-[color:var(--muted)]">
        Телефон
        <input
          defaultValue={draft.phone ?? ''}
          onBlur={(e) => save({ phone: e.target.value || null })}
          className="input"
        />
      </label>
    </div>
  );
}
