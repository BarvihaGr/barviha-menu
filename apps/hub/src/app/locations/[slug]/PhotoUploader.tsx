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

/**
 * Переводит offset (px, сдвиг картинки от центра рамки — положительный x
 * двигает картинку вправо, значит видно её левую часть) в старый формат
 * хранения (object-position %, 0 = левый/верхний край картинки, 100 =
 * правый/нижний). Формулы подобраны так, что при рендере через
 * object-position:${x}% + cssTransform(scale(zoom)) — как везде на сайте —
 * результат совпадает пиксель-в-пиксель с тем, что видно в редакторе.
 */
function offsetToPos(offset: { x: number; y: number }, maxOffset: { x: number; y: number }): Position {
  const px = maxOffset.x > 0 ? clamp(50 - (50 * offset.x) / maxOffset.x, 0, 100) : 50;
  const py = maxOffset.y > 0 ? clamp(50 - (50 * offset.y) / maxOffset.y, 0, 100) : 50;
  return { x: px, y: py };
}

function posToOffset(pos: Position, maxOffset: { x: number; y: number }): { x: number; y: number } {
  return {
    x: ((50 - pos.x) / 50) * maxOffset.x,
    y: ((50 - pos.y) / 50) * maxOffset.y,
  };
}

/** Насколько картинку (при данном zoom) можно сдвинуть от центра рамки и
 * всё ещё полностью закрывать её — это же и есть половина «люфта» кадра. */
function computeMaxOffset(rect: { width: number; height: number }, img: { w: number; h: number }, zoom: number) {
  const baseScale = Math.max(rect.width / img.w, rect.height / img.h);
  const renderedW = img.w * baseScale * zoom;
  const renderedH = img.h * baseScale * zoom;
  return {
    x: Math.max(0, (renderedW - rect.width) / 2),
    y: Math.max(0, (renderedH - rect.height) / 2),
  };
}

/** Модалка кадрирования: перетаскивание идёт в пикселях 1:1 с курсором/пальцем
 * (не в процентах «люфта» — та схема на почти-квадратных/сильно вытянутых
 * фото либо намертво блокировала ось, либо мгновенно улетала в край при
 * лёгком движении). Рядом — маленький живой предпросмотр в форме реальной
 * карточки сайта, чтобы сразу было видно итоговый результат, не только
 * рамку редактора. Кнопки ↑↓←→ и слайдер зума работают в тех же пикселях. */
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
  const [tf, setTf] = useState<Transform>(initialTransform);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgSizeRef = useRef<{ w: number; h: number } | null>(null);
  const [ready, setReady] = useState(false);
  // offset — сдвиг картинки в пикселях от центра рамки при ТЕКУЩЕМ zoom.
  // Держим его, а не pos% как основной стейт: перетаскивание/стрелки в px
  // не зависят от размера «люфта» и не требуют пересчёта на каждый чих.
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; offset: { x: number; y: number } } | null>(null);
  const [dragging, setDragging] = useState(false);

  function maxOffsetNow(zoom: number) {
    if (!containerRef.current || !imgSizeRef.current) return { x: 0, y: 0 };
    return computeMaxOffset(containerRef.current.getBoundingClientRect(), imgSizeRef.current, zoom);
  }

  // Как только знаем реальный размер картинки и рамки — переводим сохранённую
  // pos% в стартовый offset (один раз, до первого взаимодействия).
  function initOffsetOnce() {
    if (ready) return;
    const mo = maxOffsetNow(tf.zoom);
    setOffset(posToOffset(initialPos, mo));
    setReady(true);
  }

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, offset };
    setDragging(true);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const mo = maxOffsetNow(tf.zoom);
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset({
      x: clamp(dragRef.current.offset.x + dx, -mo.x, mo.x),
      y: clamp(dragRef.current.offset.y + dy, -mo.y, mo.y),
    });
  }

  function onPointerUp() {
    dragRef.current = null;
    setDragging(false);
  }

  function setZoom(nextZoom: number) {
    // Меняем зум — люфт меняется вместе с ним, переносим текущий сдвиг
    // пропорционально, чтобы кадр не «прыгал» в сторону при вращении слайдера.
    const prevMax = maxOffsetNow(tf.zoom);
    const nextMax = maxOffsetNow(nextZoom);
    setOffset((o) => ({
      x: prevMax.x > 0 ? clamp((o.x / prevMax.x) * nextMax.x, -nextMax.x, nextMax.x) : 0,
      y: prevMax.y > 0 ? clamp((o.y / prevMax.y) * nextMax.y, -nextMax.y, nextMax.y) : 0,
    }));
    setTf((t) => ({ ...t, zoom: nextZoom }));
  }

  function rotate() {
    setTf((t) => ({ ...t, rotate: (t.rotate + 90) % 360 }));
  }

  function reset() {
    setTf(DEFAULT_TRANSFORM);
    setOffset({ x: 0, y: 0 });
  }

  const NUDGE_STEP_PX = 18;
  function nudge(dx: number, dy: number) {
    const mo = maxOffsetNow(tf.zoom);
    setOffset((o) => ({ x: clamp(o.x + dx, -mo.x, mo.x), y: clamp(o.y + dy, -mo.y, mo.y) }));
  }

  const mo = maxOffsetNow(tf.zoom);
  const pos = offsetToPos(offset, mo);
  const previewStyle: React.CSSProperties = {
    objectPosition: `${pos.x}% ${pos.y}%`,
    transform: cssTransform(tf),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-xs text-[color:var(--muted)]">Потяните фото, чтобы выбрать кадр</div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-[0.1em] text-[color:var(--muted)]">На сайте</span>
            <div
              className={`overflow-hidden rounded-md border border-[color:var(--border)] shadow-sm ${aspectClassName === 'aspect-square' ? 'h-11 w-11' : 'h-9 w-16'}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- живой мини-превью того же кадра */}
              <img src={photoUrl} alt="" className="h-full w-full object-cover" style={previewStyle} />
            </div>
          </div>
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
              initOffsetOnce();
            }}
            className="absolute inset-0 h-full w-full select-none object-cover"
            style={previewStyle}
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
            onChange={(e) => setZoom(Number(e.target.value))}
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
              onClick={() => nudge(0, -NUDGE_STEP_PX)}
              title="Сдвинуть вверх"
              className="flex h-6 w-6 items-center justify-center rounded border border-[color:var(--border)] text-[11px] text-[color:var(--text-soft)]"
            >
              ↑
            </button>
            <div />
            <button
              type="button"
              onClick={() => nudge(-NUDGE_STEP_PX, 0)}
              title="Сдвинуть влево"
              className="flex h-6 w-6 items-center justify-center rounded border border-[color:var(--border)] text-[11px] text-[color:var(--text-soft)]"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => nudge(0, NUDGE_STEP_PX)}
              title="Сдвинуть вниз"
              className="flex h-6 w-6 items-center justify-center rounded border border-[color:var(--border)] text-[11px] text-[color:var(--text-soft)]"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => nudge(NUDGE_STEP_PX, 0)}
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
