import type { Category, HookahMood, ItemLabel, ResolvedMenuItem } from '@barviha/db';

type Locale = 'ru' | 'en';

export function pickItemName(item: ResolvedMenuItem, locale: Locale): string {
  return locale === 'en' && item.name_en ? item.name_en : item.name;
}

export function pickItemDescription(item: ResolvedMenuItem, locale: Locale): string | null {
  return locale === 'en' && item.description_en ? item.description_en : item.description;
}

export function pickItemComposition(item: ResolvedMenuItem, locale: Locale): string | null {
  return locale === 'en' && item.composition_en ? item.composition_en : item.composition;
}

export function pickMoodName(mood: HookahMood, locale: Locale): string {
  return locale === 'en' && mood.name_en ? mood.name_en : mood.name;
}

export function pickMoodDescription(mood: HookahMood, locale: Locale): string {
  return locale === 'en' && mood.description_en ? mood.description_en : mood.description;
}

const CATEGORY_EN: Record<string, string> = {
  hookah: 'Hookah',
  bar: 'Bar',
  kitchen: 'Kitchen',
  desserts: 'Desserts',
};

export function pickCategoryName(cat: Category, locale: Locale): string {
  if (locale === 'en') return CATEGORY_EN[cat.slug] ?? cat.name;
  return cat.name;
}

export function labelKey(label: ItemLabel): string {
  return label;
}
