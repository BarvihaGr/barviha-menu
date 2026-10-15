import type { ResolvedMenuItem } from '@barviha/db';

/**
 * Облегчённая позиция для списков (кухня/бар/кальяны): карточке нужны
 * название, цена, обложка и подраздел, поиску — русские описание и состав.
 * Переводы описаний и состава, все фото (кроме обложки), КБЖУ и 3D не нужны —
 * без них HTML страницы кухни худеет примерно вдвое (эти данные иначе
 * уезжают в браузер внутри RSC-payload по 130 позициям).
 * У баннерных позиций (is_featured) фото и описание остаются: их рисует
 * FeaturedItemCard.
 */
export function slimForList(item: ResolvedMenuItem): ResolvedMenuItem {
  const slim: ResolvedMenuItem = {
    ...item,
    description_en: undefined,
    description_zh: undefined,
    description_hy: undefined,
    composition_en: undefined,
    composition_zh: undefined,
    composition_hy: undefined,
    nutrition: undefined,
    spline_url: null,
    has_3d_model: false,
  };
  if (!item.is_featured) slim.photos = item.photo ? [{ src: item.photo, position: item.photo_position ?? null, transform: item.photo_transform ?? null }] : [];
  return slim;
}
