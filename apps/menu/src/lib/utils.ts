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

/**
 * Единый регистр названий во всех разделах меню — «Греческий».
 *
 * Данные лежат в двух видах. Кухня и Кальяны — капсом целиком
 * («ГРЕЧЕСКИЙ», «APEROL SPRITZ» в баре Киевской-эталона): такую строку
 * просто опускаем и поднимаем первую букву — как было всегда. Бар — с
 * заглавной каждое слово и нередко в два-три предложения («Манго Маракуйя
 * Кокос», «Францесканер. Россия.», «Чили. П/сух. Карменер Селлар Селекшн.»):
 * тут аккуратнее, иначе получается «францесканер. россия.». Правила для
 * такой строки:
 *  - слово целиком заглавными — это аббревиатура или бренд (XO, VSOP, США,
 *    ЮАР): оставляем как есть, в нижнем регистре они читаются как опечатка;
 *  - остальные слова — в нижний регистр;
 *  - заглавной становится первая буква строки и первая буква после . ! ?
 */
export function capitalizeRu(s: string): string {
  if (!s) return s;
  const hasCyrillic = /[А-Яа-яЁё]/.test(s);
  const isAllUpper = s === s.toLocaleUpperCase('ru');
  if (!hasCyrillic || isAllUpper) {
    const lower = s.toLocaleLowerCase('ru');
    return lower.charAt(0).toLocaleUpperCase('ru') + lower.slice(1);
  }
  const lower = s.replace(/[A-Za-zА-Яа-яЁё]{2,}/g, (word) => {
    // Латинское слово в русском названии — бренд или аббревиатура («Сок
    // Rich», «Хеннесси XO»): оставляем как написано.
    if (!/[А-Яа-яЁё]/.test(word)) return word;
    // Кириллица капсом — тоже аббревиатура («США», «ЮАР»).
    if (word === word.toLocaleUpperCase('ru')) return word;
    return word.toLocaleLowerCase('ru');
  });
  return lower.replace(/(^|[.!?]\s+)([a-zа-яё])/g, (_, pre: string, ch: string) =>
    pre + ch.toLocaleUpperCase('ru'),
  );
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
