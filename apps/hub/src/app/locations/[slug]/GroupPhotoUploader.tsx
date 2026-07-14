'use client';

import { useRef, useState } from 'react';
import { menuAssetUrl } from '@/lib/menu-origin';
import { apiPath } from '@/lib/base-path';
import { compressInBrowser } from '@/lib/compress-image';

function slugifyForId(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

/** Общее фото на всю категорию (баннер 16:9 — как «СМУЗИ» на живом меню):
 * показывается вместо отдельных фото у позиций с типом карточки «2».
 * В отличие от PhotoUploader — без кадрирования (позиция/зум тут не
 * применимы, groupPhotos в данных — просто строка-путь, не объект). */
export function GroupPhotoUploader({
  slug,
  category,
  photo,
  onSaved,
}: {
  slug: string;
  category: string;
  photo: string | null;
  onSaved: (src: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const photoUrl = menuAssetUrl(photo);

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
      onSaved(data.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'не удалось загрузить фото');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative aspect-[16/9] w-full max-w-sm overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-2)]"
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- фото отдаёт другой Next-сервер (apps/menu)
          <img src={photoUrl} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs uppercase text-[color:var(--muted)]">
            общее фото категории
          </span>
        )}
        <span
          className={`absolute inset-0 flex items-center justify-center text-xs font-medium transition ${
            uploading
              ? 'bg-black/50 text-white'
              : 'bg-black/0 text-transparent group-hover:bg-black/50 group-hover:text-white'
          }`}
        >
          {uploading ? 'Загружаю…' : photoUrl ? 'заменить' : 'загрузить'}
        </span>
      </button>
      {error && <p className="mt-1 text-xs text-[color:var(--danger)]">Не получилось: {error}</p>}
      <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
    </div>
  );
}
