'use client';

import { useRef, useState } from 'react';
import { menuAssetUrl } from '@/lib/menu-origin';
import { apiPath } from '@/lib/base-path';

type Position = { x: number; y: number };
type Rotation = 0 | 90 | 180 | 270;
type Transform = { zoom: number; rotate: Rotation; flipH: boolean; flipV: boolean };

const DEFAULT_POSITION: Position = { x: 50, y: 35 };
const DEFAULT_TRANSFORM: Transform = { zoom: 1, rotate: 0, flipH: false, flipV: false };

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function cssTransform(t: Transform): string {
  return `rotate(${t.rotate}deg) scaleX(${t.flipH ? -1 : 1}) scaleY(${t.flipV ? -1 : 1}) scale(${t.zoom})`;
}

type Patch = { photo?: string; photo_position?: Position | null; photo_transform?: Transform | null };

export function PhotoUploader({
  photo,
  position,
  transform,
  slug,
  realm,
  id,
  onChange,
}: {
  photo: string | null;
  position?: Position | null;
  transform?: Transform | null;
  slug: string;
  realm: string;
  id: string;
  onChange: (patch: Patch) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const photoUrl = menuAssetUrl(photo);
  const pos = position ?? DEFAULT_POSITION;
  const tf = transform ?? DEFAULT_TRANSFORM;

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('slug', slug);
    form.append('realm', realm);
    form.append('id', id);
    const res = await fetch(apiPath('/api/upload'), { method: 'POST', body: form });
    const data = (await res.json()) as { ok: boolean; path?: string };
    setUploading(false);
    if (data.ok && data.path) {
      onChange({ photo: data.path, photo_position: null, photo_transform: null });
      setEditing(true);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (photoUrl) setEditing(true);
          else inputRef.current?.click();
        }}
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)]"
      >
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
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-[9px] text-white">…</span>
        )}
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

      {editing && photoUrl && (
        <PositionEditor
          photoUrl={photoUrl}
          initialPos={pos}
          initialTransform={tf}
          onCancel={() => setEditing(false)}
          onReplace={() => {
            setEditing(false);
            inputRef.current?.click();
          }}
          onSave={(nextPos, nextTransform) => {
            const isDefault =
              nextTransform.zoom === 1 && nextTransform.rotate === 0 && !nextTransform.flipH && !nextTransform.flipV;
            onChange({ photo_position: nextPos, photo_transform: isDefault ? null : nextTransform });
            setEditing(false);
          }}
        />
      )}
    </>
  );
}

/** Модалка кадрирования: превью — та же квадратная рамка с object-cover, что
 * и на реальных карточках Арки. Перетаскивание — позиция, слайдер — зум,
 * кнопки — поворот на 90° и отражение. Сетка (правило третей) поверх кадра
 * помогает выровнять композицию. */
function PositionEditor({
  photoUrl,
  initialPos,
  initialTransform,
  onSave,
  onCancel,
  onReplace,
}: {
  photoUrl: string;
  initialPos: Position;
  initialTransform: Transform;
  onSave: (pos: Position, transform: Transform) => void;
  onCancel: () => void;
  onReplace: () => void;
}) {
  const [pos, setPos] = useState<Position>(initialPos);
  const [tf, setTf] = useState<Transform>(initialTransform);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgSizeRef = useRef<{ w: number; h: number } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; pos: Position; zoom: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, pos, zoom: tf.zoom };
    setDragging(true);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current || !containerRef.current || !imgSizeRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const { w: iw, h: ih } = imgSizeRef.current;
    const coverScale = Math.max(rect.width / iw, rect.height / ih);
    const overflowX = iw * coverScale - rect.width;
    const overflowY = ih * coverScale - rect.height;
    // Экранное движение делим на zoom — при увеличении та же дистанция мышью
    // соответствует меньшему смещению кадра (см. cssTransform: scale(zoom)
    // применяется поверх уже закадрированного объектом object-position фото).
    const dx = (e.clientX - dragRef.current.startX) / dragRef.current.zoom;
    const dy = (e.clientY - dragRef.current.startY) / dragRef.current.zoom;
    const next = { ...dragRef.current.pos };
    if (overflowX > 0.5) next.x = clamp(dragRef.current.pos.x - (dx / overflowX) * 100, 0, 100);
    if (overflowY > 0.5) next.y = clamp(dragRef.current.pos.y - (dy / overflowY) * 100, 0, 100);
    setPos(next);
  }

  function onPointerUp() {
    dragRef.current = null;
    setDragging(false);
  }

  function rotate() {
    setTf((t) => ({ ...t, rotate: ((t.rotate + 90) % 360) as Rotation }));
  }

  function reset() {
    setPos(DEFAULT_POSITION);
    setTf(DEFAULT_TRANSFORM);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-xs rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 text-xs text-[color:var(--muted)]">
          Кадрирование фото — потяните, чтобы выбрать позицию
        </div>

        <div
          ref={containerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`relative aspect-square w-full touch-none overflow-hidden rounded-[16px] bg-[color:var(--surface-2)] ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- редактор позиции, нужен натуральный размер картинки */}
          <img
            src={photoUrl}
            alt=""
            draggable={false}
            onLoad={(e) => {
              imgSizeRef.current = { w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight };
            }}
            className="absolute inset-0 h-full w-full select-none object-cover"
            style={{ objectPosition: `${pos.x}% ${pos.y}%`, transform: cssTransform(tf) }}
          />
          {/* Сетка — правило третей, ориентир для кадрирования. */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/40" />
            <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/40" />
            <div className="absolute top-1/3 left-0 right-0 h-px bg-white/40" />
            <div className="absolute top-2/3 left-0 right-0 h-px bg-white/40" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.1em] text-[color:var(--muted)]">Зум</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={tf.zoom}
            onChange={(e) => setTf((t) => ({ ...t, zoom: Number(e.target.value) }))}
            className="flex-1"
          />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={rotate}
            title="Повернуть на 90°"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--border)] text-[15px] text-[color:var(--text-soft)]"
          >
            ⟳
          </button>
          <button
            type="button"
            onClick={() => setTf((t) => ({ ...t, flipH: !t.flipH }))}
            title="Отразить по горизонтали"
            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[15px] text-[color:var(--text-soft)] ${tf.flipH ? 'border-[color:var(--accent)] text-[color:var(--accent)]' : 'border-[color:var(--border)]'}`}
          >
            ⇋
          </button>
          <button
            type="button"
            onClick={() => setTf((t) => ({ ...t, flipV: !t.flipV }))}
            title="Отразить по вертикали"
            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[15px] text-[color:var(--text-soft)] ${tf.flipV ? 'border-[color:var(--accent)] text-[color:var(--accent)]' : 'border-[color:var(--border)]'}`}
          >
            ⇕
          </button>
          <button
            type="button"
            onClick={reset}
            className="ml-auto text-[11px] text-[color:var(--muted)] underline underline-offset-2"
          >
            сбросить
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onReplace}
            className="text-xs text-[color:var(--muted)] underline underline-offset-2"
          >
            заменить фото
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--text-soft)]"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={() => onSave(pos, tf)}
              className="rounded-lg bg-[color:var(--accent)] px-3 py-1.5 text-xs font-medium text-[color:var(--accent-text)]"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
