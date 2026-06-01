/**
 * Адаптивный поиск по меню.
 *
 * Решает задачу из ТЗ: запрос «паста» должен находить и «Лингвини карбонара»,
 * а не только позиции со словом «паста» в названии. Делаем это так:
 *  1) нормализация (нижний регистр, ё→е, убираем пунктуацию);
 *  2) словарь синонимов/групп — «паста» расширяется до карбонары, лингвини и пр.;
 *  3) поиск по всем языковым полям сразу (RU/EN/ZH);
 *  4) терпимость к опечаткам (расстояние Левенштейна для слов длиннее 4).
 *
 * Возвращает отранжированный список: точное вхождение в название > синоним >
 * вхождение в описание/состав > нечёткое совпадение.
 */
import type { ResolvedMenuItem } from '@barviha/db';

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Группы синонимов. Любое слово из группы «подтягивает» все остальные.
 * Расширяется по мере наполнения меню — это безопасный словарь общего вида.
 */
const SYNONYM_GROUPS: string[][] = [
  ['паста', 'pasta', 'спагетти', 'spaghetti', 'лингвини', 'linguine', 'карбонара', 'carbonara', 'тальятелле', 'феттучини', 'fettuccine', 'болоньезе', 'bolognese', '麵', '面', '意麵', '意面'],
  ['ролл', 'роллы', 'roll', 'rolls', 'суши', 'sushi', 'маки', 'maki', 'филадельфия', 'philadelphia', 'калифорния', 'california', '捲', '卷', '壽司', '寿司'],
  ['пицца', 'pizza', 'маргарита', 'margherita', 'пепперони', 'pepperoni', '披薩', '披萨'],
  ['бургер', 'burger', 'чизбургер', 'cheeseburger', '漢堡', '汉堡'],
  ['суп', 'soup', 'том ям', 'tom yam', 'tom yum', 'борщ', 'крем суп', 'харчо', 'солянка', '湯', '汤'],
  ['салат', 'salad', 'цезарь', 'caesar', 'греческий', 'greek', 'оливье', '沙拉'],
  ['стейк', 'steak', 'рибай', 'ribeye', 'миньон', 'mignon', 'говядина', 'beef', '牛排'],
  ['креветка', 'креветки', 'shrimp', 'prawn', 'tiger', 'тигровая', '蝦', '虾'],
  ['лосось', 'losos', 'salmon', 'семга', 'сёмга', 'рыба', 'fish', '鮭魚', '三文鱼', '魚', '鱼'],
  ['курица', 'chicken', 'куриный', 'цыпленок', '雞', '鸡'],
  ['десерт', 'dessert', 'тирамису', 'tiramisu', 'чизкейк', 'cheesecake', 'торт', 'cake', 'мороженое', 'ice cream', '甜點', '甜点', '蛋糕'],
  ['кофе', 'coffee', 'эспрессо', 'espresso', 'капучино', 'cappuccino', 'латте', 'latte', 'американо', '咖啡'],
  ['чай', 'tea', 'улун', 'oolong', 'матча', 'matcha', '茶'],
  ['коктейль', 'cocktail', 'мохито', 'mojito', 'негрони', 'negroni', 'маргарита', 'margarita', 'апероль', 'aperol', '雞尾酒', '鸡尾酒'],
  ['лимонад', 'lemonade', 'морс', 'фреш', 'fresh', 'сок', 'juice', '檸檬水', '柠檬水'],
  ['кальян', 'кальяны', 'hookah', 'shisha', '水煙', '水烟'],
  ['вино', 'wine', 'просекко', 'prosecco', 'шампанское', 'champagne', '葡萄酒'],
  ['виски', 'whiskey', 'whisky', 'бурбон', 'bourbon', '威士忌'],
];

function expandSynonyms(token: string): Set<string> {
  const out = new Set<string>([token]);
  for (const group of SYNONYM_GROUPS) {
    if (group.some((g) => norm(g) === token || norm(g).includes(token) || token.includes(norm(g)))) {
      group.forEach((g) => out.add(norm(g)));
    }
  }
  return out;
}

/** Расстояние Левенштейна (для коротких слов — терпимость к опечаткам). */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    const cur: number[] = [i + 1];
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      cur.push(Math.min((cur[j] ?? 0) + 1, (prev[j + 1] ?? 0) + 1, (prev[j] ?? 0) + cost));
    }
    prev = cur;
  }
  return prev[b.length] ?? 0;
}

function fuzzyMatch(token: string, haystackTokens: string[]): boolean {
  if (token.length < 4) return false;
  const tol = token.length >= 7 ? 2 : 1;
  return haystackTokens.some((h) => Math.abs(h.length - token.length) <= tol && levenshtein(token, h) <= tol);
}

interface Indexed {
  item: ResolvedMenuItem;
  haystack: string;
  tokens: string[];
}

function buildHaystack(item: ResolvedMenuItem): string {
  return norm(
    [
      item.name,
      item.name_en,
      item.name_zh,
      item.description,
      item.description_en,
      item.description_zh,
      item.composition,
      item.composition_en,
      item.composition_zh,
    ]
      .filter(Boolean)
      .join(' '),
  );
}

export interface SearchResult {
  item: ResolvedMenuItem;
  score: number;
}

export function searchItems(items: ResolvedMenuItem[], rawQuery: string, limit = 12): SearchResult[] {
  const q = norm(rawQuery);
  if (!q) return [];
  const queryTokens = q.split(' ').filter(Boolean);

  const index: Indexed[] = items.map((item) => {
    const haystack = buildHaystack(item);
    return { item, haystack, tokens: haystack.split(' ').filter(Boolean) };
  });

  const results: SearchResult[] = [];
  for (const { item, haystack, tokens } of index) {
    const nameNorm = norm([item.name, item.name_en, item.name_zh].filter(Boolean).join(' '));
    let score = 0;

    for (const token of queryTokens) {
      const variants = expandSynonyms(token);
      let tokenHit = 0;

      // прямое вхождение исходного токена
      if (nameNorm.includes(token)) tokenHit = Math.max(tokenHit, 100);
      else if (haystack.includes(token)) tokenHit = Math.max(tokenHit, 40);

      // вхождение через синонимы (паста → карбонара)
      if (!tokenHit || tokenHit < 100) {
        for (const v of variants) {
          if (v === token) continue;
          if (nameNorm.includes(v)) tokenHit = Math.max(tokenHit, 70);
          else if (haystack.includes(v)) tokenHit = Math.max(tokenHit, 30);
        }
      }

      // нечёткое совпадение (опечатки)
      if (!tokenHit && fuzzyMatch(token, tokens)) tokenHit = 20;

      score += tokenHit;
    }

    if (score > 0) results.push({ item, score });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
