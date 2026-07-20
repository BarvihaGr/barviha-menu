export type PhotoTransform = { zoom: number; rotate: number; flipH: boolean; flipV: boolean } | null | undefined;

/** CSS transform для зума/поворота/отражения фото, заданных в бэк-офисе
 * (см. apps/hub PhotoUploader). Применяется поверх object-position — квадрат
 * не меняет размер при повороте на 90°/270°, поэтому кроп остаётся корректным. */
export function photoTransformCss(t: PhotoTransform): string | undefined {
  if (!t) return undefined;
  return `rotate(${t.rotate}deg) scaleX(${t.flipH ? -1 : 1}) scaleY(${t.flipV ? -1 : 1}) scale(${t.zoom})`;
}
