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

// Strips stray brackets, dots, commas from edges of raw ingredient strings
// that appear in unprocessed DB composition fields, e.g. "(соль" or "масло.".
const JUNK_EDGE_RE = /^[\s().,]+|[\s().,]+$/g;

function sanitize(s: string): string {
  return s.replace(JUNK_EDGE_RE, '').trim();
}

export function parseIngredient(raw: string): ParsedIngredient {
  const clean = sanitize(raw);
  if (!clean) return { name: '', amount: null };
  const m = clean.match(AMOUNT_RE);
  if (m && m[1] && m[2]) return { name: sanitize(m[1]), amount: m[2].trim() };
  return { name: clean, amount: null };
}

export function parseIngredients(composition: string | null): ParsedIngredient[] {
  if (!composition) return [];
  return composition
    .split(',')
    .map(parseIngredient)
    .filter((ing) => ing.name.length > 0);
}
