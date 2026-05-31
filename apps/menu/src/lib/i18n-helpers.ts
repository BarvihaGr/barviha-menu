import type { Category, HookahMood, ItemLabel, ResolvedMenuItem } from '@barviha/db';
import type { Locale } from '@/i18n/routing';

export function pickItemName(item: ResolvedMenuItem, locale: Locale): string {
  if (locale === 'en' && item.name_en) return item.name_en;
  if (locale === 'zh' && item.name_zh) return item.name_zh;
  return item.name;
}

export function pickItemDescription(item: ResolvedMenuItem, locale: Locale): string | null {
  if (locale === 'en' && item.description_en) return item.description_en;
  if (locale === 'zh' && item.description_zh) return item.description_zh;
  return item.description;
}

export function pickItemComposition(item: ResolvedMenuItem, locale: Locale): string | null {
  if (locale === 'en' && item.composition_en) return item.composition_en;
  if (locale === 'zh' && item.composition_zh) return item.composition_zh;
  return item.composition;
}

export function pickMoodName(mood: HookahMood, locale: Locale): string {
  if (locale === 'en' && mood.name_en) return mood.name_en;
  if (locale === 'zh' && mood.name_zh) return mood.name_zh;
  return mood.name;
}

export function pickMoodDescription(mood: HookahMood, locale: Locale): string {
  if (locale === 'en' && mood.description_en) return mood.description_en;
  if (locale === 'zh' && mood.description_zh) return mood.description_zh;
  return mood.description;
}

const CATEGORY_FALLBACK: Record<string, { en: string; zh: string }> = {
  hookah: { en: 'Hookah', zh: '水烟' },
  bar: { en: 'Bar', zh: '酒吧' },
  kitchen: { en: 'Kitchen', zh: '厨房' },
  rolls: { en: 'Rolls', zh: '卷物' },
  desserts: { en: 'Desserts', zh: '甜点' },
};

export function pickCategoryName(cat: Category, locale: Locale): string {
  if (locale === 'en') return cat.name_en ?? CATEGORY_FALLBACK[cat.slug]?.en ?? cat.name;
  if (locale === 'zh') return cat.name_zh ?? CATEGORY_FALLBACK[cat.slug]?.zh ?? cat.name;
  return cat.name;
}

export function labelKey(label: ItemLabel): string {
  return label;
}
