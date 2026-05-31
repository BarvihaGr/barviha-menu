import type { Category, HookahMood, ItemLabel, ResolvedMenuItem } from '@barviha/db';
import type { Locale } from '@/i18n/routing';
import { ITEM_TRANSLATIONS } from './item-translations';

export function pickItemName(item: ResolvedMenuItem, locale: Locale): string {
  const tr = ITEM_TRANSLATIONS[item.id];
  if (locale === 'en') return item.name_en ?? tr?.name_en ?? item.name;
  if (locale === 'zh') return item.name_zh ?? tr?.name_zh ?? item.name;
  return item.name;
}

export function pickItemDescription(item: ResolvedMenuItem, locale: Locale): string | null {
  const tr = ITEM_TRANSLATIONS[item.id];
  if (locale === 'en') return item.description_en ?? tr?.description_en ?? item.description;
  if (locale === 'zh') return item.description_zh ?? tr?.description_zh ?? item.description;
  return item.description;
}

export function pickItemComposition(item: ResolvedMenuItem, locale: Locale): string | null {
  const tr = ITEM_TRANSLATIONS[item.id];
  if (locale === 'en') return item.composition_en ?? tr?.composition_en ?? item.composition;
  if (locale === 'zh') return item.composition_zh ?? tr?.composition_zh ?? item.composition;
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
