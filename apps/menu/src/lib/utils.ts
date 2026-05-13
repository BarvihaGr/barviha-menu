import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = '₽'): string {
  return `${price.toLocaleString('ru-RU')} ${currency}`;
}

export interface ParsedIngredient {
  name: string;
  amount: string | null;
}

const AMOUNT_RE =
  /^(.+?)\s+(\d+(?:[.,]\d+)?\s*(?:мл|г|кг|шт|ст\.?\s*л|ч\.?\s*л|двойн[ыйаяое]+|капл[яеи]+|ml|g|kg|pcs))$/i;

export function parseIngredient(raw: string): ParsedIngredient {
  const trimmed = raw.trim();
  const m = trimmed.match(AMOUNT_RE);
  if (m && m[1] && m[2]) return { name: m[1].trim(), amount: m[2].trim() };
  return { name: trimmed, amount: null };
}

export function parseIngredients(composition: string | null): ParsedIngredient[] {
  if (!composition) return [];
  return composition
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(parseIngredient);
}
