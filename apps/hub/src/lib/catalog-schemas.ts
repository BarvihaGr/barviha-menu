import { z } from 'zod';

/**
 * Zod-схемы для PATCH-роутов бэк-офиса, которые раньше принимали
 * `request.json()` как `Partial<...>` без единой проверки формы
 * (security-audit, этап 3 «Валидация ввода») — клиент мог прислать что
 * угодно (строку вместо цены, произвольный объект в kbju/photos, и —
 * опаснее всего — переписать сам `id`/`realm` позиции, столкнув его с
 * другой позицией). `.strict()` отклоняет неизвестные ключи, поэтому
 * `id`/`realm` (их нет в схеме) в патче пройти не может.
 */

const PhotoPositionSchema = z.object({ x: z.number(), y: z.number() }).nullable();
const PhotoTransformSchema = z
  .object({ zoom: z.number(), rotate: z.number(), flipH: z.boolean(), flipV: z.boolean() })
  .nullable();

const PhotoEntrySchema = z.object({
  src: z.string().min(1).max(500),
  position: PhotoPositionSchema,
  transform: PhotoTransformSchema,
});

const KbjuSchema = z.object({
  weight: z.number().finite().nullable(),
  prot: z.number().finite().nullable(),
  fat: z.number().finite().nullable(),
  carb: z.number().finite().nullable(),
  kcal: z.number().finite().nullable(),
});

const ItemLabelSchema = z.enum(['new', 'hit', 'chef_pick', 'premium', 'spicy', 'vegan']);
const MenuTagSchema = z.enum(['meat', 'fish', 'salad', 'sweet', 'halal', 'healthy']);

const TEXT = (max: number) => z.string().max(max).nullable().optional();

/** PATCH /api/locations/[slug]/catalog/[realm]/[id] — CatalogItem, без id/realm. */
export const CatalogItemPatchSchema = z
  .object({
    sub: z.string().min(1).max(80).optional(),
    name: z.string().min(1).max(200).optional(),
    name_en: TEXT(200),
    name_zh: TEXT(200),
    name_hy: TEXT(200),
    description: TEXT(2000),
    description_en: TEXT(2000),
    description_zh: TEXT(2000),
    description_hy: TEXT(2000),
    composition: TEXT(2000),
    composition_en: TEXT(2000),
    composition_zh: TEXT(2000),
    composition_hy: TEXT(2000),
    kbju: KbjuSchema.nullable().optional(),
    price: z.number().finite().min(0).max(10_000_000).optional(),
    photos: z.array(PhotoEntrySchema).max(30).optional(),
    is_available: z.boolean().optional(),
    is_archived: z.boolean().optional(),
    is_featured: z.boolean().optional(),
    labels: z.array(ItemLabelSchema).max(10).optional(),
    tags: z.array(MenuTagSchema).max(10).optional(),
  })
  .strict();

/** PATCH /api/locations/[slug]/bar/[id] — ArkaMenuItem, без id. */
export const BarItemPatchSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    name_en: TEXT(200),
    name_zh: TEXT(200),
    name_hy: TEXT(200),
    type: z.union([z.literal(1), z.literal(2)]).optional(),
    priceParts: z.array(z.string().max(40)).max(10).optional(),
    volume: z.string().max(80).nullable().optional(),
    description: TEXT(2000),
    description_en: TEXT(2000),
    description_zh: TEXT(2000),
    description_hy: TEXT(2000),
    photo: z.string().max(500).nullable().optional(),
    photo_position: PhotoPositionSchema.optional(),
    photo_transform: PhotoTransformSchema.optional(),
    is_available: z.boolean().optional(),
    is_archived: z.boolean().optional(),
  })
  .strict();

/** PATCH /api/locations/[slug]/bar-group-photo — фото/кадрирование категории бара-шаблона. */
export const BarGroupPhotoPatchSchema = z.object({
  category: z.string().trim().min(1).max(120),
  src: z.string().trim().min(1).max(500).optional(),
  position: PhotoPositionSchema.optional(),
  transform: PhotoTransformSchema.optional(),
});

export const BarGroupPhotoDeleteSchema = z.object({
  category: z.string().trim().min(1).max(120),
});

/** POST /api/locations/[slug]/bar — новая позиция бара-шаблона. */
export const NewBarItemSchema = z.object({
  categoryIndex: z.number().int().min(0).max(1000),
  name: z.string().trim().min(1).max(200),
  price: z.string().trim().min(1).max(40),
  volume: z.string().trim().max(80).nullable().optional(),
  description: TEXT(2000),
  type: z.union([z.literal(1), z.literal(2)]).optional(),
});

/** POST /api/locations/[slug]/bar-category — новая категория бара-шаблона. */
export const NewBarCategorySchema = z.object({
  category: z.string().trim().min(1).max(120),
});

/** POST /api/locations/[slug]/catalog/[realm] — новая позиция. */
export const NewCatalogItemSchema = z.object({
  name: z.string().trim().min(1).max(200),
  sub: z.string().trim().min(1).max(80),
  price: z.number().finite().min(0).max(10_000_000).optional(),
  weight: z.number().finite().min(0).max(100_000).nullable().optional(),
  description: TEXT(2000),
  composition: TEXT(2000),
});

/** PATCH /api/locations/[slug]/location — LocationSettings, полностью. */
export const LocationSettingsPatchSchema = z
  .object({
    address: z.string().max(300).nullable().optional(),
    phone: z.string().max(40).nullable().optional(),
    is_active: z.boolean().optional(),
    latitude: z.number().finite().min(-90).max(90).nullable().optional(),
    longitude: z.number().finite().min(-180).max(180).nullable().optional(),
    hours: z.string().max(500).nullable().optional(),
  })
  .strict();
