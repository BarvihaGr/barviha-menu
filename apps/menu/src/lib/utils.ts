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

// гр? matches both "г" and "гр" (both appear in DB data)
const AMOUNT_RE =
  /^(.+?)\s+(\d+(?:[.,]\d+)?\s*(?:мл|гр?|кг|шт|ст\.?\s*л|ч\.?\s*л|двойн[ыйаяое]+|капл[яеи]+|ml|g|kg|pcs))$/i;

// Strips junk punctuation from the edges of an ingredient token.
const JUNK_EDGE_RE = /^[\s().,]+|[\s().,]+$/g;

function sanitize(s: string): string {
  return s
    .replace(JUNK_EDGE_RE, '')   // strip leading/trailing junk first
    .replace(/[()]/g, '')        // remove any surviving lone brackets (unmatched)
    .replace(/\s{2,}/g, ' ')    // collapse double spaces left by bracket removal
    .trim();
}

export function parseIngredient(raw: string): ParsedIngredient {
  const clean = sanitize(raw);
  if (!clean) return { name: '', amount: null };
  const m = clean.match(AMOUNT_RE);
  if (m && m[1] && m[2]) return { name: sanitize(m[1]), amount: m[2].trim() };
  return { name: clean, amount: null };
}

/** Названия в данных капсом — приводим к человеческому виду (первая буква заглавная). */
export function capitalizeRu(s: string): string {
  if (!s) return s;
  const lower = s.toLocaleLowerCase('ru');
  return lower.charAt(0).toLocaleUpperCase('ru') + lower.slice(1);
}

export function parseIngredients(composition: string | null): ParsedIngredient[] {
  if (!composition) return [];
  return (
    composition
      // Remove closed parenthetical groups BEFORE splitting so that
      // "(мед, горчица столовая)" doesn't fracture into broken tokens.
      // Unmatched lone brackets are handled later in sanitize().
      .replace(/\([^)]*\)/g, '')
      // Strip dish-weight suffixes like ". 338 гр" or ", 250 г" that
      // appear after parenthetical groups are removed. These are total
      // weights, not ingredient amounts, so we don't want them in chips.
      .replace(/[.,]\s*\d+(?:[.,]\d+)?\s*(?:гр?|кг|мл)\b\.?/gi, '')
      .split(',')
      .map(parseIngredient)
      .filter((ing) => ing.name.length > 0)
  );
}
