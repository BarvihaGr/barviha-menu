'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ArkaMenuEntry, ArkaMenuItem } from '@barviha/db';
import { apiPath } from '@/lib/base-path';
import { PhotoUploader } from './PhotoUploader';
import { GroupPhotoUploader } from './GroupPhotoUploader';
import { SavedBadge } from './SavedBadge';

export function BarEditor({
  slug,
  sections,
  groupPhotos,
}: {
  slug: string;
  sections: ArkaMenuEntry[];
  groupPhotos: Record<string, string>;
}) {
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState(groupPhotos);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    const result: ArkaMenuEntry[] = [];
    let pendingHeader: ArkaMenuEntry | null = null;
    let headerUsed = false;
    for (const entry of sections) {
      if (entry.kind === 'header') {
        pendingHeader = entry;
        headerUsed = false;
        continue;
      }
      const items = entry.items.filter((it) => it.name.toLowerCase().includes(q));
      if (items.length === 0) continue;
      if (pendingHeader && !headerUsed) {
        result.push(pendingHeader);
        headerUsed = true;
      }
      result.push({ ...entry, items });
    }
    return result;
  }, [sections, query]);

  return (
    <div className="flex flex-col">
      <div className="px-4 sm:px-8 pt-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по названию…"
          className="input max-w-xs"
        />
      </div>
      {filtered.map((entry, idx) =>
        entry.kind === 'header' ? (
          <div key={idx} className="px-4 sm:px-8 pt-6 pb-1 text-xs uppercase tracking-[0.2em] text-[color:var(--accent)]">
            {entry.title}
          </div>
        ) : (
          <div key={idx} className="border-b border-[color:var(--border)]">
            <div className="px-4 sm:px-8 pt-4 pb-1 text-sm font-medium text-[color:var(--text-soft)]">{entry.category}</div>
            {entry.items.some((it) => it.type === 2) && (
              <div className="px-4 sm:px-8 pb-2">
                <GroupPhotoUploader
                  slug={slug}
                  category={entry.category}
                  photo={photos[entry.category] ?? null}
                  onSaved={(src) => setPhotos((p) => ({ ...p, [entry.category]: src }))}
                />
              </div>
            )}
            <div className="divide-y divide-[color:var(--border)]">
              {entry.items.map((it) => (
                <BarItemRow key={it.id} slug={slug} item={it} />
              ))}
            </div>
          </div>
        ),
      )}
      {query.trim() && filtered.length === 0 && (
        <div className="py-10 text-center text-sm text-[color:var(--muted)]">Ничего не найдено</div>
      )}
    </div>
  );
}

function BarItemRow({ slug, item }: { slug: string; item: ArkaMenuItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(item);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function save(patch: Partial<ArkaMenuItem>) {
    const next = { ...draft, ...patch };
    setDraft(next);
    const res = await fetch(apiPath(`/api/locations/${slug}/bar/${item.id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (res.ok) setSavedAt(Date.now());
    if (patch.is_archived) router.refresh();
  }

  return (
    <div className="px-4 sm:px-8 py-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v);
        }}
        className="flex w-full items-center gap-3 text-left"
      >
        <PhotoUploader
          photo={draft.photo}
          position={draft.photo_position}
          transform={draft.photo_transform}
          slug={slug}
          realm="bar"
          id={item.id}
          onChange={(patch) => save(patch)}
        />
        <div className="min-w-0 flex-1">
          <div
            className={`truncate text-sm ${draft.is_available ? 'text-[color:var(--text)]' : 'text-[color:var(--muted)] line-through'}`}
          >
            {draft.name}
          </div>
          <div className="text-xs text-[color:var(--muted)]">{draft.volume ?? '—'}</div>
        </div>
        <div className="shrink-0 text-sm text-[color:var(--text-soft)]">{draft.priceParts.join(' / ')} ₽</div>
        <SavedBadge savedAt={savedAt} />
      </div>

      {open && (
        <div className="mt-3 flex flex-col gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
          <Field label="Название">
            <input defaultValue={draft.name} onBlur={(e) => save({ name: e.target.value })} className="input" />
          </Field>
          <Field label="Описание / состав">
            <textarea
              defaultValue={draft.description ?? ''}
              onBlur={(e) => save({ description: e.target.value || null })}
              rows={2}
              className="input"
            />
          </Field>
          <div className="flex gap-3">
            <Field label="Цена(ы), ₽ — через /, если вариаций несколько">
              <input
                defaultValue={draft.priceParts.join('/')}
                onBlur={(e) => save({ priceParts: e.target.value.split('/').map((s) => s.trim()).filter(Boolean) })}
                className="input"
              />
            </Field>
            <Field label="Объём — через /, синхронно с ценами">
              <input
                defaultValue={draft.volume ?? ''}
                onBlur={(e) => save({ volume: e.target.value || null })}
                className="input"
              />
            </Field>
          </div>
          <div className="flex items-center gap-4">
            <Field label="Тип карточки">
              <select
                defaultValue={draft.type}
                onChange={(e) => save({ type: Number(e.target.value) as 1 | 2 })}
                className="input"
              >
                <option value={1}>1 — своё фото</option>
                <option value={2}>2 — общее фото категории</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-[color:var(--text-soft)]">
              <input
                type="checkbox"
                checked={draft.is_available}
                onChange={(e) => save({ is_available: e.target.checked })}
              />
              актуально
            </label>
          </div>
          <button
            type="button"
            onClick={() => save({ is_archived: true })}
            className="self-start text-xs text-[color:var(--muted)] underline underline-offset-2"
          >
            В архив
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-1 flex-col gap-1 text-xs text-[color:var(--muted)]">
      {label}
      {children}
    </label>
  );
}
