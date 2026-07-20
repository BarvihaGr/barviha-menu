'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CatalogItem, CatalogRealm } from '@barviha/db';
import { subLabel, subOrder } from '@barviha/db/catalog-shared';
import { apiPath } from '@/lib/base-path';
import { menuAssetUrl } from '@/lib/menu-origin';
import { PhotoGalleryEditor } from './PhotoGalleryEditor';
import { cssTransform, DEFAULT_POSITION, DEFAULT_TRANSFORM } from './PhotoUploader';
import { SavedBadge } from './SavedBadge';

export function CatalogEditor({
  slug,
  realm,
  items,
}: {
  slug: string;
  realm: CatalogRealm;
  items: CatalogItem[];
}) {
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q ? items.filter((it) => it.name.toLowerCase().includes(q)) : items;
    const bySub = new Map<string, CatalogItem[]>();
    for (const it of filtered) {
      const arr = bySub.get(it.sub) ?? [];
      arr.push(it);
      bySub.set(it.sub, arr);
    }
    return [...bySub.entries()]
      .sort((a, b) => subOrder(realm, a[0]) - subOrder(realm, b[0]))
      .map(([sub, its]) => ({ sub, label: subLabel(realm, sub), items: its }));
  }, [items, query, realm]);

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
      {groups.map((g) => (
        <div key={g.sub} className="border-b border-[color:var(--border)]">
          <div className="px-4 sm:px-8 pt-4 pb-1 text-sm font-medium text-[color:var(--text-soft)]">
            {g.label} <span className="text-xs text-[color:var(--muted)]">· {g.items.length}</span>
          </div>
          <div className="divide-y divide-[color:var(--border)]">
            {g.items.map((it, i) => (
              <CatalogItemRow
                key={it.id}
                slug={slug}
                realm={realm}
                item={it}
                canReorder={!query.trim()}
                canMoveUp={i > 0}
                canMoveDown={i < g.items.length - 1}
              />
            ))}
          </div>
        </div>
      ))}
      {groups.length === 0 && (
        <div className="py-10 text-center text-sm text-[color:var(--muted)]">Ничего не найдено</div>
      )}
    </div>
  );
}

function CatalogItemRow({
  slug,
  realm,
  item,
  canReorder,
  canMoveUp,
  canMoveDown,
}: {
  slug: string;
  realm: CatalogRealm;
  item: CatalogItem;
  canReorder: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(item);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [moving, setMoving] = useState(false);

  async function save(patch: Partial<CatalogItem>) {
    const next = { ...draft, ...patch };
    setDraft(next);
    const res = await fetch(apiPath(`/api/locations/${slug}/catalog/${realm}/${item.id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (res.ok) setSavedAt(Date.now());
    if (patch.is_archived) router.refresh();
  }

  async function move(direction: 'up' | 'down') {
    setMoving(true);
    const res = await fetch(apiPath(`/api/locations/${slug}/catalog/${realm}/${item.id}/move`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    });
    if (res.ok) router.refresh();
    setMoving(false);
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
        {canReorder && (
          <div className="flex shrink-0 flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => move('up')}
              disabled={!canMoveUp || moving}
              title="Переставить выше"
              className="flex h-5 w-5 items-center justify-center rounded border border-[color:var(--border)] text-[10px] text-[color:var(--muted)] disabled:opacity-30"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => move('down')}
              disabled={!canMoveDown || moving}
              title="Переставить ниже"
              className="flex h-5 w-5 items-center justify-center rounded border border-[color:var(--border)] text-[10px] text-[color:var(--muted)] disabled:opacity-30"
            >
              ▼
            </button>
          </div>
        )}
        <CoverThumbnail photos={draft.photos} />
        <div className="min-w-0 flex-1">
          <div className={`truncate text-sm ${draft.is_available ? 'text-[color:var(--text)]' : 'text-[color:var(--muted)] line-through'}`}>
            {draft.name}
          </div>
          {draft.kbju?.weight != null && (
            <div className="text-xs text-[color:var(--muted)]">
              {draft.kbju.weight} {realm === 'bar' ? 'мл' : 'г'}
            </div>
          )}
        </div>
        <div className="shrink-0 text-sm text-[color:var(--text-soft)]">{draft.price} ₽</div>
        <SavedBadge savedAt={savedAt} />
      </div>

      {open && (
        <div className="mt-3 flex flex-col gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
          <Field label="Фото (первое — на витрине)">
            <PhotoGalleryEditor
              photos={draft.photos}
              slug={slug}
              realm={realm}
              id={item.id}
              onChange={(photos) => save({ photos })}
            />
          </Field>
          <Field label="Название">
            <input
              defaultValue={draft.name}
              onBlur={(e) => save({ name: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Описание / копирайт">
            <textarea
              defaultValue={draft.description ?? ''}
              onBlur={(e) => save({ description: e.target.value || null })}
              rows={2}
              className="input"
            />
          </Field>
          <Field label="Состав">
            <textarea
              defaultValue={draft.composition ?? ''}
              onBlur={(e) => save({ composition: e.target.value || null })}
              rows={2}
              className="input"
            />
          </Field>
          <div className="flex gap-3">
            <Field label="Цена, ₽">
              <input
                type="number"
                defaultValue={draft.price}
                onBlur={(e) => save({ price: Number(e.target.value) || 0 })}
                className="input"
              />
            </Field>
            <Field label={realm === 'bar' ? 'Объём, мл' : 'Грамовка, г'}>
              <input
                type="number"
                defaultValue={draft.kbju?.weight ?? ''}
                onBlur={(e) => {
                  const weight = e.target.value ? Number(e.target.value) : null;
                  save({ kbju: { ...(draft.kbju ?? { prot: null, fat: null, carb: null, kcal: null }), weight } });
                }}
                className="input"
              />
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
    <label className="flex flex-col gap-1 text-xs text-[color:var(--muted)]">
      {label}
      {children}
    </label>
  );
}

/** Обложка позиции (photos[0]) в свёрнутой строке списка — только показ,
 * само редактирование галереи открывается через разворот строки. */
function CoverThumbnail({ photos }: { photos: CatalogItem['photos'] }) {
  const cover = photos[0];
  const photoUrl = menuAssetUrl(cover?.src ?? null);
  const pos = cover?.position ?? DEFAULT_POSITION;
  const tf = cover?.transform ?? DEFAULT_TRANSFORM;
  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)]">
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- фото отдаёт другой Next-сервер (apps/menu), не оптимизируем
        <img
          src={photoUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          style={{ objectPosition: `${pos.x}% ${pos.y}%`, transform: cssTransform(tf) }}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[9px] uppercase text-[color:var(--muted)]">
          фото
        </span>
      )}
      {photos.length > 1 && (
        <span className="absolute bottom-0.5 right-0.5 rounded bg-black/60 px-1 text-[8px] font-medium text-white">
          {photos.length}
        </span>
      )}
    </div>
  );
}
