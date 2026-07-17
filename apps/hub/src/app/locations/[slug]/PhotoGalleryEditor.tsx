'use client';

import { useRef, useState } from 'react';
import type { PhotoEntry } from '@barviha/db';
import { menuAssetUrl } from '@/lib/menu-origin';
import { apiPath } from '@/lib/base-path';
import { compressInBrowser } from '@/lib/compress-image';
import { PositionEditor, cssTransform, DEFAULT_POSITION, DEFAULT_TRANSFORM, MIN_ZOOM } from './PhotoUploader';

const MAX_PHOTOS = 6;

export function PhotoGalleryEditor({
  photos,
  slug,
  realm,
  id,
  onChange,
}: {
  photos: PhotoEntry[];
  slug: string;
  realm: string;
  id: string;
  onChange: (photos: PhotoEntry[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  // Индекс фото, которое заменяем через «заменить фото» в редакторе — null
  // значит следующая загрузка добавляет новое фото, а не подменяет старое.
  const replaceIndexRef = useRef<number | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    let uploadBlob: File | Blob = file;
    try {
      uploadBlob = await compressInBrowser(file);
    } catch {
      // Не удалось сжать на клиенте (старый браузер и т.п.) — грузим как
      // есть, сервер всё равно ужмёт и подрежет по лимиту размера.
    }
    const form = new FormData();
    form.append('file', uploadBlob, 'photo.webp');
    form.append('slug', slug);
    form.append('realm', realm);
    form.append('id', id);
    const res = await fetch(apiPath('/api/upload'), { method: 'POST', body: form });
    const data = (await res.json()) as { ok: boolean; path?: string };
    setUploading(false);
    if (data.ok && data.path) {
      const replaceIndex = replaceIndexRef.current;
      replaceIndexRef.current = null;
      if (replaceIndex != null) {
        const next = [...photos];
        next[replaceIndex] = { src: data.path, position: null, transform: null };
        onChange(next);
        setEditingIndex(replaceIndex);
      } else {
        const next = [...photos, { src: data.path, position: null, transform: null }];
        onChange(next);
        setEditingIndex(next.length - 1);
      }
    }
  }

  function moveLeft(index: number) {
    if (index === 0) return;
    const next = [...photos];
    [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
    onChange(next);
  }

  function moveRight(index: number) {
    if (index === photos.length - 1) return;
    const next = [...photos];
    [next[index], next[index + 1]] = [next[index + 1]!, next[index]!];
    onChange(next);
  }

  function makeCover(index: number) {
    if (index === 0) return;
    const next = [...photos];
    const [picked] = next.splice(index, 1);
    next.unshift(picked!);
    onChange(next);
  }

  function remove(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  const editingPhoto = editingIndex != null ? photos[editingIndex] : null;

  return (
    <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
      {photos.map((photo, index) => {
        const photoUrl = menuAssetUrl(photo.src);
        const pos = photo.position ?? DEFAULT_POSITION;
        const tf = photo.transform ?? DEFAULT_TRANSFORM;
        return (
          <div key={`${photo.src}-${index}`} className="relative h-16 w-16 shrink-0">
            <button
              type="button"
              onClick={() => setEditingIndex(index)}
              className="h-full w-full overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- фото отдаёт другой Next-сервер (apps/menu), не оптимизируем */}
              <img
                src={photoUrl ?? undefined}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
                style={{ objectPosition: `${pos.x}% ${pos.y}%`, transform: cssTransform(tf) }}
              />
            </button>
            {index === 0 && (
              <span className="pointer-events-none absolute left-0.5 top-0.5 rounded bg-black/60 px-1 text-[8px] font-medium uppercase text-white">
                витрина
              </span>
            )}
            <button
              type="button"
              onClick={() => remove(index)}
              title="Удалить фото"
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[10px] text-[color:var(--muted)] shadow-sm"
            >
              ✕
            </button>
            <div className="absolute -bottom-1.5 left-1/2 flex -translate-x-1/2 gap-0.5">
              <button
                type="button"
                onClick={() => moveLeft(index)}
                disabled={index === 0}
                title="Переставить левее"
                className="flex h-4 w-4 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[8px] text-[color:var(--muted)] shadow-sm disabled:opacity-30"
              >
                ←
              </button>
              {index !== 0 && (
                <button
                  type="button"
                  onClick={() => makeCover(index)}
                  title="Сделать обложкой (на витрину)"
                  className="flex h-4 w-4 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[8px] text-[color:var(--muted)] shadow-sm"
                >
                  ★
                </button>
              )}
              <button
                type="button"
                onClick={() => moveRight(index)}
                disabled={index === photos.length - 1}
                title="Переставить правее"
                className="flex h-4 w-4 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[8px] text-[color:var(--muted)] shadow-sm disabled:opacity-30"
              >
                →
              </button>
            </div>
          </div>
        );
      })}

      {photos.length < MAX_PHOTOS && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-[color:var(--border)] text-lg text-[color:var(--muted)]"
        >
          {uploading ? '…' : '+'}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

      {editingIndex != null && editingPhoto && (
        <PositionEditor
          photoUrl={menuAssetUrl(editingPhoto.src) ?? ''}
          initialPos={editingPhoto.position ?? DEFAULT_POSITION}
          initialTransform={editingPhoto.transform ?? DEFAULT_TRANSFORM}
          onCancel={() => setEditingIndex(null)}
          onReplace={() => {
            replaceIndexRef.current = editingIndex;
            setEditingIndex(null);
            inputRef.current?.click();
          }}
          onSave={(nextPos, nextTransform) => {
            const isDefault =
              nextTransform.zoom === MIN_ZOOM &&
              nextTransform.rotate === 0 &&
              !nextTransform.flipH &&
              !nextTransform.flipV;
            const next = [...photos];
            next[editingIndex] = { ...next[editingIndex]!, position: nextPos, transform: isDefault ? null : nextTransform };
            onChange(next);
            setEditingIndex(null);
          }}
        />
      )}
    </div>
  );
}
