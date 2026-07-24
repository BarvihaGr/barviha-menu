'use client';

import { useRef, useState } from 'react';
import { menuAssetUrl } from '@/lib/menu-origin';
import { apiPath } from '@/lib/base-path';
import { compressInBrowser } from '@/lib/compress-image';

export type Position = { x: number; y: number };
/** Градусы поворота — любое значение (0–359), не только кратное 90: точный
 * поворот (слайдер «наклон») складывается с быстрыми поворотами на 90°. */
export type Rotation = number;
export type Transform = { zoom: number; rotate: Rotation; flipH: boolean; flipV: boolean };

export const DEFAULT_POSITION: Position = { x: 50, y: 35 };
// Минимальный зум чуть больше 1 (не ровно cover-fit): при zoom=1 у не-квадратного
// фото одна из осей (высота — у альбомных, ширина — у портретных) садится в рамку
// впритык, без единого пикселя запаса — двигать в эту сторону физически некуда.
// Небольшой запас (14%) даёт место для сдвига сразу по обеим осям.
export const MIN_ZOOM = 1.14;
export const DEFAULT_TRANSFORM: Transform = { zoom: MIN_ZOOM, rotate: 0, flipH: false, flipV: false };

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function cssTransform(t: Transform): string {
  return `rotate(${t.rotate}deg) scaleX(${t.flipH ? -1 : 1}) scaleY(${t.flipV ? -1 : 1}) scale(${t.zoom})`;
}

type Patch = { photo?: string | null; photo_position?: Position | null; photo_transform?: Transform | null };

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
          onRemove={() => {
            setEditing(false);
            onChange({ photo: null, photo_position: null, photo_transform: null });
          }}
          onSave={(nextPos, nextTransform) => {
            const isDefault =
              nextTransform.zoom === MIN_ZOOM &&
              nextTransform.rotate === 0 &&
              !nextTransform.flipH &&
              !nextTransform.flipV;
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
export function PositionEditor({
  photoUrl,
  initialPos,
  initialTransform,
  onSave,
  onCancel,
  onReplace,
  onRemove,
  aspectClassName = 'aspect-square',
}: {
  photoUrl: string;
  initialPos: Position;
  initialTransform: Transform;
  onSave: (pos: Position, transform: Transform) => void;
  onCancel: () => void;
  onReplace: () => void;
  onRemove?: () => void;
  /** Форма кадра превью — по умолчанию квадрат (карточки товаров), у общего
   * фото категории кадр 16:9 (см. GroupPhotoUploader). */
  aspectClassName?: string;
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
    // Лимит сдвига должен учитывать текущий зум — иначе для квадратной рамки
    // и портретного фото overflowX считается в 0 при zoom=1, и сдвиг влево-
    // вправо намертво блокируется, даже когда зум визуально даёт для него
    // место (cssTransform применяет scale(tf.zoom) поверх object-position).
    const coverScale = Math.max(rect.width / iw, rect.height / ih) * dragRef.current.zoom;
    const overflowX = iw * coverScale - rect.width;
    const overflowY = ih * coverScale - rect.height;
    // У близко-квадратных/чуть кадрированных фото на MIN_ZOOM реальный люфт
    // по одной из осей — считанные пиксели (при zoom=1.14 это ~14% от
    // размера рамки), а вся шкала 0–100% натянута именно на этот крошечный
    // диапазон — из-за этого любой чуть более резкий сдвиг мышью/пальцем
    // мгновенно улетал в крайнее положение, плавно двигать было невозможно.
    // Не даём знаменателю быть меньше разумного минимума в пикселях — сама
    // граница (0/100%) не меняется, меняется только «скорость» перетаскивания.
    const DRAG_RANGE_FLOOR = 140;
    const dragRangeX = Math.max(overflowX, DRAG_RANGE_FLOOR);
    const dragRangeY = Math.max(overflowY, DRAG_RANGE_FLOOR);
    // Экранное движение делим на zoom — при увеличении та же дистанция мышью
    // соответствует меньшему смещению кадра (см. cssTransform: scale(zoom)
    // применяется поверх уже закадрированного объектом object-position фото).
    const dx = (e.clientX - dragRef.current.startX) / dragRef.current.zoom;
    const dy = (e.clientY - dragRef.current.startY) / dragRef.current.zoom;
    const next = { ...dragRef.current.pos };
    if (overflowX > 0.5) next.x = clamp(dragRef.current.pos.x - (dx / dragRangeX) * 100, 0, 100);
    if (overflowY > 0.5) next.y = clamp(dragRef.current.pos.y - (dy / dragRangeY) * 100, 0, 100);
    setPos(next);
  }

  function onPointerUp() {
    dragRef.current = null;
    setDragging(false);
  }

  function rotate() {
    setTf((t) => ({ ...t, rotate: (t.rotate + 90) % 360 }));
  }

  function reset() {
    setPos(DEFAULT_POSITION);
    setTf(DEFAULT_TRANSFORM);
  }

  const NUDGE_STEP = 4;
  function nudge(dx: number, dy: number) {
    setPos((p) => ({ x: clamp(p.x + dx, 0, 100), y: clamp(p.y + dy, 0, 100) }));
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
          className={`relative ${aspectClassName} w-full touch-none overflow-hidden rounded-[16px] bg-[color:var(--surface-2)] ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
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
          <span className="w-9 shrink-0 text-[10px] uppercase tracking-[0.1em] text-[color:var(--muted)]">Зум</span>
          <input
            type="range"
            min={MIN_ZOOM}
            max={3}
            step={0.05}
            value={tf.zoom}
            onChange={(e) => setTf((t) => ({ ...t, zoom: Number(e.target.value) }))}
            className="flex-1"
          />
          <span className="w-10 shrink-0 text-right text-[10px] tabular-nums text-[color:var(--muted)]">
            {Math.round((tf.zoom / MIN_ZOOM) * 100)}%
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="w-9 shrink-0 text-[10px] uppercase tracking-[0.1em] text-[color:var(--muted)]">Наклон</span>
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={((tf.rotate % 360) + 540) % 360 - 180}
            onChange={(e) => setTf((t) => ({ ...t, rotate: Number(e.target.value) }))}
            className="flex-1"
          />
          <span className="w-10 shrink-0 text-right text-[10px] tabular-nums text-[color:var(--muted)]">
            {Math.round(((tf.rotate % 360) + 540) % 360 - 180)}°
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="w-9 shrink-0 text-[10px] uppercase tracking-[0.1em] text-[color:var(--muted)]">
            Позиция
          </span>
          {/* Стрелки — точная подстройка позиции без перетаскивания (см. drag выше). */}
          <div className="grid grid-cols-3 grid-rows-2 gap-0.5">
            <div />
            <button
              type="button"
              onClick={() => nudge(0, -NUDGE_STEP)}
              title="Сдвинуть вверх"
              className="flex h-6 w-6 items-center justify-center rounded border border-[color:var(--border)] text-[11px] text-[color:var(--text-soft)]"
            >
              ↑
            </button>
            <div />
            <button
              type="button"
              onClick={() => nudge(-NUDGE_STEP, 0)}
              title="Сдвинуть влево"
              className="flex h-6 w-6 items-center justify-center rounded border border-[color:var(--border)] text-[11px] text-[color:var(--text-soft)]"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => nudge(0, NUDGE_STEP)}
              title="Сдвинуть вниз"
              className="flex h-6 w-6 items-center justify-center rounded border border-[color:var(--border)] text-[11px] text-[color:var(--text-soft)]"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => nudge(NUDGE_STEP, 0)}
              title="Сдвинуть вправо"
              className="flex h-6 w-6 items-center justify-center rounded border border-[color:var(--border)] text-[11px] text-[color:var(--text-soft)]"
            >
              →
            </button>
          </div>
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
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onReplace}
              className="text-xs text-[color:var(--muted)] underline underline-offset-2"
            >
              заменить фото
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="text-xs text-[color:var(--danger)] underline underline-offset-2"
              >
                удалить фото
              </button>
            )}
          </div>
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
