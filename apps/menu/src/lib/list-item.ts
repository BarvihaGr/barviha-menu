import type { ResolvedMenuItem } from '@barviha/db';

/**
 * Облегчённая позиция для списков (кухня/бар/кальяны): карточке нужны
 * название, цена, обложка и подраздел, поиску — русские описание и состав.
 * Переводы описаний и состава, КБЖУ и 3D не нужны — без них HTML страницы
 * кухни худеет примерно вдвое (эти данные иначе уезжают в браузер внутри
 * RSC-payload по 130 позициям). Список фото остаётся: карточка сама листает
 * их, когда гость остановил скролл (CardPhotoCarousel).
 */
export function slimForList(item: ResolvedMenuItem): ResolvedMenuItem {
  // Широкая карточка «рекомендуем» (FeaturedItemCard) показывает описание —
  // без переводов она на en/zh/hy выводила русский текст. Таких позиций единицы.
  const keepDesc = !!item.is_featured;
  return {
    ...item,
    description_en: keepDesc ? item.description_en : undefined,
    description_zh: keepDesc ? item.description_zh : undefined,
    description_hy: keepDesc ? item.description_hy : undefined,
    composition_en: undefined,
    composition_zh: undefined,
    composition_hy: undefined,
    nutrition: undefined,
    spline_url: null,
    has_3d_model: false,
  };
}
