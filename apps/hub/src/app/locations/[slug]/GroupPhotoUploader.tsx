'use client';

import { useRef, useState } from 'react';
import type { PhotoEntry } from '@barviha/db';
import { menuAssetUrl } from '@/lib/menu-origin';
import { apiPath } from '@/lib/base-path';
import { compressInBrowser } from '@/lib/compress-image';
import { PositionEditor, cssTransform, DEFAULT_POSITION, DEFAULT_TRANSFORM, MIN_ZOOM } from './PhotoUploader';

function slugifyForId(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

/** Общее фото на всю категорию (баннер 16:9 — как «СМУЗИ» на живом меню):
 * показывается вместо отдельных фото у позиций с типом карточки «2».
 * Кадрирование — та же модалка PositionEditor, что и у обычных позиций, но
 * с рамкой превью 16:9 вместо квадрата (см. aspectClassName). */
export function GroupPhotoUploader({
  slug,
  category,
  photo,
  onSaved,
  onRemoved,
}: {
  slug: string;
  category: string;
  photo: PhotoEntry | null;
  onSaved: (entry: PhotoEntry) => void;
  onRemoved: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const photoUrl = menuAssetUrl(photo?.src ?? null);
  const pos = photo?.position ?? DEFAULT_POSITION;
  const tf = photo?.transform ?? DEFAULT_TRANSFORM;

  async function removePhoto() {
    setError(null);
    try {
      const res = await fetch(apiPath(`/api/locations/${slug}/bar-group-photo`), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      });
      if (!res.ok) throw new Error(`delete failed: ${res.status}`);
      onRemoved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'не удалось удалить фото');
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      let uploadBlob: File | Blob = file;
      try {
        uploadBlob = await compressInBrowser(file);
      } catch {
        // сервер всё равно ужмёт и подрежет по лимиту размера
      }
      const form = new FormData();
      form.append('file', uploadBlob, 'photo.webp');
      form.append('slug', slug);
      form.append('realm', 'bar');
      form.append('id', `category-${slugifyForId(category)}`);
      const res = await fetch(apiPath('/api/upload'), { method: 'POST', body: form });
      if (!res.ok) throw new Error(`upload failed: ${res.status}`);
      const data = (await res.json()) as { ok: boolean; path?: string; error?: string };
      if (!data.ok || !data.path) throw new Error(data.error ?? 'upload rejected');
      const patchRes = await fetch(apiPath(`/api/locations/${slug}/bar-group-photo`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, src: data.path }),
      });
      if (!patchRes.ok) throw new Error(`save failed: ${patchRes.status}`);
      onSaved({ src: data.path, position: null, transform: null });
      setEditing(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'не удалось загрузить фото');
    } finally {
      setUploading(false);
    }
  }

  async function saveCrop(nextPos: typeof pos, nextTransform: typeof tf) {
    const isDefault =
      nextTransform.zoom === MIN_ZOOM && nextTransform.rotate === 0 && !nextTransform.flipH && !nextTransform.flipV;
    const transform = isDefault ? null : nextTransform;
    setEditing(false);
    const res = await fetch(apiPath(`/api/locations/${slug}/bar-group-photo`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, position: nextPos, transform }),
    });
    if (res.ok && photo) onSaved({ ...photo, position: nextPos, transform });
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => {
          if (photoUrl) setEditing(true);
          else inputRef.current?.click();
        }}
        title={photoUrl ? 'Общее фото категории — открыть кадрирование' : 'Загрузить общее фото категории'}
        className="group relative h-11 w-20 shrink-0 overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)]"
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- фото отдаёт другой Next-сервер (apps/menu), не оптимизируем
          <img
            src={photoUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            style={{ objectPosition: `${pos.x}% ${pos.y}%`, transform: cssTransform(tf) }}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[8px] uppercase leading-tight text-[color:var(--muted)]">
            общее фото
          </span>
        )}
        <span
          className={`absolute inset-0 flex items-center justify-center text-[9px] font-medium transition ${
            uploading
              ? 'bg-black/50 text-white'
              : 'bg-black/0 text-transparent group-hover:bg-black/50 group-hover:text-white'
          }`}
        >
          {uploading ? '…' : photoUrl ? 'кадр' : '+'}
        </span>
      </button>
      {photoUrl && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void removePhoto();
          }}
          title="Удалить фото"
          className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[9px] text-[color:var(--muted)] shadow-sm"
        >
          ✕
        </button>
      )}
      {error && (
        <p className="absolute left-0 top-full z-10 mt-1 w-max max-w-[12rem] text-[10px] text-[color:var(--danger)]">
          Не получилось: {error}
        </p>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

      {editing && photoUrl && (
        <PositionEditor
          photoUrl={photoUrl}
          initialPos={pos}
          initialTransform={tf}
          aspectClassName="aspect-[16/9]"
          onCancel={() => setEditing(false)}
          onReplace={() => {
            setEditing(false);
            inputRef.current?.click();
          }}
          onRemove={() => {
            setEditing(false);
            void removePhoto();
          }}
          onSave={(nextPos, nextTransform) => saveCrop(nextPos, nextTransform)}
        />
      )}
    </div>
  );
}
