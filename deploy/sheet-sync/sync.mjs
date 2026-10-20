#!/usr/bin/env node
// Синхронизация меню с Google Таблицей владельца (см. config.json).
//
// Таблица — источник истины по названиям, ценам и составу меню каждой локации
// (какие позиции есть). Скрипт скачивает каждый лист как CSV, разбирает строки
// («Название | Категория | Цена | Описание», разделы — строкой с одним названием),
// сопоставляет позиции с контентом сайта по названию и:
//   - меняет цену и название, подраздел кухни/кальянов, раздел бара;
//   - возвращает из архива то, что снова есть в таблице;
//   - добавляет новые позиции (без фото — их грузят в бэк-офисе);
//   - отправляет в архив то, чего в таблице больше нет (не удаляет).
// Описание, состав, КБЖУ и объём из таблицы ставятся только там, где на сайте
// пусто — тексты, написанные в бэк-офисе, не затираются. Фото, стоп-лист
// (is_available), переводы и порядок не трогаются.
//
// Предохранители: лист, который не скачался или слишком короткий, пропускается
// целиком; если в архив просится больше четверти живых позиций локации —
// архивирование этой локации не применяется и попадает в отчёт.
//
// usage: node sync.mjs --content <путь к content> [--apply] [--csv-dir <папка с <gid>.csv>]
//        [--only <slug>] [--report <файл.md>]
// Без --apply ничего не пишет — только отчёт (dry-run).
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const CONFIG = JSON.parse(readFileSync(join(here, 'config.json'), 'utf-8'));

// ── аргументы ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const opt = (name, def = null) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : def; };
const APPLY = args.includes('--apply');
const CONTENT = opt('--content');
const CSV_DIR = opt('--csv-dir');
const ONLY = opt('--only');
const REPORT = opt('--report');
if (!CONTENT) { console.error('usage: node sync.mjs --content <dir> [--apply] [--csv-dir <dir>] [--only <slug>] [--report <file>]'); process.exit(2); }

// ── утилиты ──────────────────────────────────────────────────────────────
const norm = (s) => String(s ?? '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, '');
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const num = (s) => { const m = String(s ?? '').replace(/\s/g, '').replace(',', '.').match(/\d+(?:\.\d+)?/); return m ? Number(m[0]) : null; };
const TR = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'c', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'iu', я: 'ia' };
const translit = (s) => String(s).toLowerCase().split('').map((c) => TR[c] ?? c).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32);
const hash6 = (s) => createHash('sha1').update(s).digest('hex').slice(0, 6);
function levenshtein(a, b) {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]; prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

function parseCsv(text) {
  const rows = []; let row = []; let cell = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

async function fetchCsv(gid) {
  if (CSV_DIR) {
    const f = join(CSV_DIR, `${gid}.csv`);
    return existsSync(f) ? readFileSync(f, 'utf-8') : null;
  }
  const url = `https://docs.google.com/spreadsheets/d/${CONFIG.spreadsheetId}/export?format=csv&gid=${gid}`;
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 30000);
  try {
    const r = await fetch(url, { signal: ctl.signal, redirect: 'follow' });
    if (!r.ok) return null;
    const ct = r.headers.get('content-type') ?? '';
    if (!/csv|text\/plain|octet-stream/.test(ct)) return null;
    return await r.text();
  } catch { return null; } finally { clearTimeout(t); }
}

// ── разбор листа ─────────────────────────────────────────────────────────
const BAR_SECTIONS = new Set(['безалкогольныенапитки', 'коктейли', 'виннаякарта', 'крепкийалкоголь', 'осеннеепредложениебар']);
const KITCHEN_SUB_BY_CAT = {
  салаты: 'salads', raw: 'raw', закуски: 'cold-app', горячиезакуски: 'hot-app', стейки: 'steaks', горячее: 'hot',
  паста: 'pasta', бургеры: 'burgers', бургерыхаляль: 'burgers', роллы: 'rolls', гунканы: 'rolls', поке: 'poke',
  римскаяпицца: 'pizza', пицца: 'pizza', супы: 'soups', гарниры: 'sides', десерты: 'desserts', десерт: 'desserts',
  завтраки: 'breakfast', снеки: 'snacks', гриль: 'hot', соусы: 'bread-sauces', хлеб: 'bread-sauces', '': 'bread-sauces',
};
const KITCHEN_SUB_BY_SECTION = { осеннеепредложениекухня: 'autumn-menu', правильноепитание: 'healthy', завтраки: 'breakfast' };
// Названия разделов бара в таблице ↔ как они называются на точках (старые имена не переименовываем).
const BAR_SECTION_ALIASES = {
  молочныйкоктейль: ['Милкшейки', 'Молочный коктейль', 'Молочные коктейли'], сок: ['Соки', 'Сок'], вода: ['Вода и напитки', 'Вода с газом / без'],
  водаинапитки: ['Вода с газом / без', 'Вода и напитки', 'Вода'], популярныекоктейли: ['Классические коктейли', 'Популярные коктейли'],
  классическиекоктейли: ['Популярные коктейли', 'Классические коктейли'], орешкичипсы: ['Закуски', 'Орешки/чипсы'],
  аперитивыбиттерыликеры: ['Крепкий алкоголь', 'Аперитивы / Биттеры / Ликёры'],
};
// Плоский бар (Киевская): коды подразделов для НОВЫХ позиций.
const FLAT_SUB = {
  лимонады: 'lemonades', смузи: 'smoothie', молочныйкоктейль: 'milkshake', сок: 'juice', водаинапитки: 'water', авторскиечаи: 'teas',
  премиальныечаи: 'teas', классическиечаи: 'teas', тизаны: 'tisanes', чайныедобавки: 'tea-addons', кофе: 'coffee', добавки: 'coffee',
  авторскиекоктейли: 'cocktails', популярныекоктейли: 'cocktails', классическиекоктейли: 'cocktails', шоты: 'cocktails',
  игристыеишампанскиевина: 'wine', белыевина: 'wine', розовыевина: 'wine', красныевина: 'wine', аперитивыбиттерыликеры: 'strong',
  текила: 'strong', джин: 'strong', ром: 'strong', коньяк: 'strong', вискиодносолодовый: 'strong', вискикупажированный: 'strong',
  водка: 'strong', пиво: 'beer', орешкичипсы: 'bar-snacks', горячиенапитки: 'coffee', горячиеалкогольныенапитки: 'cocktails',
};

const VOL_RE = /^((?:\d+(?:[.,]\d+)?\s*(?:мл|л|г|гр)\.?\s*(?:\/\s*)?)+)/i;
function splitBarDesc(desc) {
  const d = clean(desc);
  const m = d.match(VOL_RE);
  if (!m) return { volume: null, description: d || null };
  const volume = m[1].replace(/\s*\/\s*/g, '/').replace(/\s+/g, '').replace(/\.+$/, '');
  const rest = d.slice(m[0].length).replace(/^[.\s]+/, '').trim();
  return { volume: volume || null, description: rest || null };
}
const KBJU_RE = /(\d+(?:\/\d+)*)\s*г\.?\s*БЖУ:\s*([\d.,]+)\s*\/\s*([\d.,]+)\s*\/\s*([\d.,]+)\.?\s*ККАЛ\s*\/\s*БЛЮДО:\s*([\d.,]+)/i;
function splitKitchenDesc(desc) {
  const d = clean(desc);
  const m = d.match(KBJU_RE);
  let kbju = null; let rest = d;
  if (m) {
    kbju = { weight: num(m[1]), prot: num(m[2]), fat: num(m[3]), carb: num(m[4]), kcal: num(m[5]) };
    rest = d.replace(m[0], '').replace(/^[.\s]+|[.\s]+$/g, '').trim();
  }
  if (!rest) return { kbju, description: null, composition: null };
  const commas = (rest.match(/,/g) ?? []).length;
  const looksLikeList = (commas >= 2 || rest.includes(' / ')) && rest.length < 220 && !/\b(и|с|в)\b.*\b(и|с|в)\b.*[а-я]{5,}ет\b/.test(rest);
  return looksLikeList ? { kbju, description: null, composition: rest } : { kbju, description: rest, composition: null };
}

/** Строки листа → позиции {realm, section, cat, name, price, parts, desc, row}. */
function parseSheet(rows) {
  const items = []; let section = null; const problems = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const name = clean(r[0]); const cat = clean(r[1]); const priceRaw = clean(r[2]); const desc = String(r[3] ?? '').trim();
    if (name && !cat && !priceRaw) { section = name; continue; }
    if (!name) continue; // строка без названия (удалённая позиция) — не позиция
    if (!priceRaw) { problems.push(`строка ${i + 1}: «${name}» без цены — пропущена`); continue; }
    const parts = priceRaw.split('/').map((p) => num(p)).filter((p) => p != null);
    if (!parts.length) { problems.push(`строка ${i + 1}: «${name}» — не разобрать цену «${priceRaw}»`); continue; }
    const secN = norm(section); const catN = norm(cat);
    let realm = 'kitchen';
    if (catN.includes('кальян')) realm = 'hookah';
    // орешки/чипсы в региональных листах стоят под «Авторской кухней», но на сайте это бар
    else if (BAR_SECTIONS.has(secN) || /орешки|чипсы|снеки/.test(catN)) realm = 'bar';
    items.push({ realm, section, cat, name, price: Math.round(parts[0]), parts: parts.map((p) => String(Math.round(p))), desc, row: i + 1 });
  }
  return { items, problems };
}

// ── контент ──────────────────────────────────────────────────────────────
function readJson(f) { const raw = readFileSync(f, 'utf-8'); return { raw, data: JSON.parse(raw) }; }
function writeIfChanged(f, data, raw) {
  const out = JSON.stringify(data, null, 2) + '\n';
  if (out === raw) return false;
  if (APPLY) { writeFileSync(`${f}.tmp`, out, 'utf-8'); renameSync(`${f}.tmp`, f); }
  return true;
}

/** Подраздел кухни по разделу/категории листа. exact=false — категория сборная
 * («Закуски и салаты», «Бургеры и стейки»): для новых позиций берём первый
 * подходящий подраздел, у существующих подраздел не меняем. */
function kitchenSub(it) {
  const bySec = KITCHEN_SUB_BY_SECTION[norm(it.section)];
  if (bySec) return { sub: bySec, exact: true };
  const c = norm(it.cat);
  // сезонный раздел без категории (так владелец добавил позиции 21.10) — в «Осеннее предложение»
  if (!c && /сезон|осен|зимн|весен|летн/.test(norm(it.section))) return { sub: 'autumn-menu', exact: true };
  if (!c) return { sub: /хлеб|соус/i.test(it.name) ? 'bread-sauces' : null, exact: true };
  if (c in KITCHEN_SUB_BY_CAT) return { sub: KITCHEN_SUB_BY_CAT[c], exact: true };
  for (const [k, v] of Object.entries(KITCHEN_SUB_BY_CAT)) if (k && c.includes(k)) return { sub: v, exact: false };
  return { sub: null, exact: true };
}
function hookahSub(it) { return norm(it.section) === 'специальноепредложение' ? 'Специальное предложение' : 'hookah'; }

/** Сопоставление позиций таблицы с позициями сайта (внутри одного раздела). */
function matchItems(sheetItems, siteItems, placeOf) {
  const byNorm = new Map();
  for (const s of siteItems) { const k = norm(s.item.name); if (!byNorm.has(k)) byNorm.set(k, []); byNorm.get(k).push(s); }
  const taken = new Set(); const pairs = []; const unmatched = [];
  for (const sh of sheetItems) {
    const cands = (byNorm.get(norm(sh.name)) ?? []).filter((s) => !taken.has(s));
    if (!cands.length) { unmatched.push(sh); continue; }
    // при дублях оставляем живую, видимую, с фото, в том же разделе и с той же ценой
    const score = (s) => (s.item.is_archived ? 0 : 8) + (s.item.is_available === false ? 0 : 4) + (placeOf(s) === sh.place ? 2 : 0)
      + (String(s.price) === String(sh.price) ? 3 : 0) + ((s.item.photos?.length || s.item.photo) ? 1 : 0);
    cands.sort((a, b) => score(b) - score(a));
    taken.add(cands[0]); pairs.push({ sh, s: cands[0], how: 'exact', oldName: cands[0].item.name });
  }
  // близкое написание (опечатка в 1–2 буквы или одно название содержит другое) —
  // только среди живых и ещё не занятых, и только если кандидат один
  const rest = [];
  for (const sh of unmatched) {
    const n = norm(sh.name);
    const cands = siteItems.filter((s) => !taken.has(s) && !s.item.is_archived).filter((s) => {
      const m = norm(s.item.name); if (n.length < 6 || m.length < 6) return false;
      const [a, b] = n.length <= m.length ? [n, m] : [m, n];
      if (b.includes(a) && a.length / b.length >= 0.6) return true;
      return Math.abs(a.length - b.length) <= 2 && levenshtein(a, b) <= Math.max(1, Math.floor(b.length / 8));
    });
    if (cands.length === 1) { taken.add(cands[0]); pairs.push({ sh, s: cands[0], how: 'fuzzy', oldName: cands[0].item.name }); } else rest.push(sh);
  }
  const leftover = siteItems.filter((s) => !taken.has(s));
  return { pairs, toAdd: rest, leftover };
}

// ── обработка одной локации ──────────────────────────────────────────────
function syncLocation(slug, sheetItemsIn, report) {
  let sheetItems = sheetItemsIn;
  const dir = join(CONTENT, slug);
  if (!existsSync(join(dir, 'kitchen.json'))) { report.note(slug, `нет папки контента — пропущено`); return; }
  const flat = CONFIG.flatBar.includes(slug);
  const prefix = CONFIG.idPrefix[slug] ?? slug.slice(0, 3);
  const L = report.loc(slug);
  const touched = [];

  // Где позиция уже живёт на сайте — там и остаётся: если название из листа
  // есть живым ровно в одном разделе сайта, берём этот раздел, а не тот, что
  // вычислили по листу (например, закуски Рублёвки лежат в кухне, в листе — в баре).
  const liveRealms = new Map();
  for (const realm of ['kitchen', 'hookah', 'bar']) {
    const f = join(dir, `${realm}.json`); if (!existsSync(f)) continue;
    const d = JSON.parse(readFileSync(f, 'utf-8'));
    const items = Array.isArray(d) ? d : d.sections.flatMap((s) => s.items ?? []);
    for (const it of items) if (!it.is_archived) { const k = norm(it.name); if (!liveRealms.has(k)) liveRealms.set(k, new Set()); liveRealms.get(k).add(realm); }
  }
  sheetItems = sheetItems.map((x) => { const r = liveRealms.get(norm(x.name)); return r && r.size === 1 && !r.has(x.realm) ? { ...x, realm: [...r][0] } : x; });

  // кухня и кальяны — плоские массивы; у Киевской и бар плоский
  const flatRealms = flat ? ['kitchen', 'hookah', 'bar'] : ['kitchen', 'hookah'];
  for (const realm of flatRealms) {
    const file = join(dir, `${realm}.json`);
    if (!existsSync(file)) continue;
    const { raw, data } = readJson(file);
    const sheetR = sheetItems.filter((x) => x.realm === realm).map((x) => {
      if (realm === 'kitchen') { const k = kitchenSub(x); return { ...x, place: k.sub, placeExact: k.exact }; }
      // у кальянов подраздел и порядок задаются в бэк-офисе — из листа берём только для новых
      return { ...x, place: realm === 'hookah' ? hookahSub(x) : (FLAT_SUB[norm(x.cat)] ?? null), placeExact: false };
    });
    // в листе этого раздела нет вовсе (например, у Рублёвки нет кухни) — раздел не трогаем
    if (!sheetR.length) { if (data.some((x) => !x.is_archived)) L.notes.push(`${realm}: в листе нет такого раздела — на сайте оставлен как есть`); continue; }
    const site = data.map((item) => ({ item, price: item.price }));
    const { pairs, toAdd, leftover } = matchItems(sheetR, site, (s) => s.item.sub);
    for (const { sh, s, how, oldName } of pairs) {
      const it = s.item; const ch = [];
      if (it.name !== sh.name) { if (norm(it.name) !== norm(sh.name)) for (const k of ['name_en', 'name_zh', 'name_hy']) if (it[k] != null) it[k] = null; ch.push(`название «${it.name}» → «${sh.name}»`); it.name = sh.name; }
      if (it.price !== sh.price) { ch.push(`цена ${it.price} → ${sh.price}`); it.price = sh.price; }
      if (sh.placeExact && sh.place && it.sub !== sh.place) { ch.push(`подраздел ${it.sub} → ${sh.place}`); it.sub = sh.place; }
      if (it.is_archived) { it.is_archived = false; ch.push('из архива'); }
      if (realm === 'kitchen') {
        const d = splitKitchenDesc(sh.desc);
        if (d.kbju && !same(it.kbju, d.kbju)) { it.kbju = d.kbju; ch.push('КБЖУ'); }
        if (d.description && !it.description) { it.description = d.description; ch.push('описание (было пусто)'); }
        if (d.composition && !it.composition) { it.composition = d.composition; ch.push('состав (было пусто)'); }
      } else if (realm === 'hookah') {
        if (sh.desc && !it.description) { it.description = clean(sh.desc); ch.push('описание (было пусто)'); }
      } else {
        const d = splitBarDesc(sh.desc);
        if (d.volume && !it.volume) { it.volume = d.volume; ch.push(`объём ${d.volume}`); }
        if (d.description && !it.description) { it.description = d.description; ch.push('описание (было пусто)'); }
      }
      if (ch.length) L.updated.push(`${realm}: «${sh.name}»${how === 'fuzzy' ? ` (сопоставлено с «${oldName}» по близкому написанию)` : ''}: ${ch.join(', ')}`);
    }
    for (const sh of toAdd) {
      if (!sh.place) { L.problems.push(`${realm}: «${sh.name}» — не понял раздел «${sh.section ?? ''} / ${sh.cat}», не добавлено`); continue; }
      const id = `${realm}-${prefix}-${translit(sh.name)}-${hash6(`${slug}|${realm}|${sh.name}`)}`;
      const base = { id, realm, name: sh.name, description: null, composition: null, kbju: null, price: sh.price, is_available: true, is_archived: false, photos: [], sub: sh.place };
      if (realm === 'kitchen') Object.assign(base, splitKitchenDesc(sh.desc));
      else if (realm === 'hookah') base.description = clean(sh.desc) || null;
      else { const d = splitBarDesc(sh.desc); base.volume = d.volume; base.description = d.description; }
      data.push(base); L.added.push(`${realm}: «${sh.name}» ${sh.price} ₽ → ${sh.place}`);
    }
    const live = data.filter((x) => !x.is_archived).length;
    const arch = leftover.filter((s) => !s.item.is_archived);
    if (arch.length > Math.max(5, live * 0.25)) {
      L.problems.push(`${realm}: в архив просится ${arch.length} из ${live} живых позиций — слишком много, архивирование не применено (проверьте лист)`);
    } else {
      for (const s of arch) { s.item.is_archived = true; L.archived.push(`${realm}: «${s.item.name}» ${s.item.price ?? ''}`); }
    }
    if (writeIfChanged(file, data, raw)) touched.push(file);
  }
  if (flat) { L.files = touched; return; }

  // бар с разделами
  const file = join(dir, 'bar.json');
  if (!existsSync(file)) { L.files = touched; return; }
  const { raw, data } = readJson(file);
  const cats = () => data.sections.filter((s) => s.kind === 'category');
  const findSection = (sheetCat) => {
    const n = norm(sheetCat);
    const exact = cats().find((s) => norm(s.category) === n);
    if (exact) return exact;
    for (const alias of BAR_SECTION_ALIASES[n] ?? []) { const s = cats().find((x) => norm(x.category) === norm(alias)); if (s) return s; }
    return null;
  };
  const sheetB = sheetItems.filter((x) => x.realm === 'bar').map((x) => ({ ...x, place: findSection(x.cat)?.category ?? null }));
  if (!sheetB.length) { if (cats().some((s) => s.items.some((x) => !x.is_archived))) L.notes.push('bar: в листе нет бара — на сайте оставлен как есть'); L.files = touched; return; }
  const site = [];
  for (const s of cats()) for (const item of s.items) site.push({ item, section: s, price: item.priceParts?.[0] ?? item.price });
  const { pairs, toAdd, leftover } = matchItems(sheetB, site, (s) => s.section.category);
  for (const { sh, s, how, oldName } of pairs) {
    const it = s.item; const ch = [];
    if (it.name !== sh.name) { if (norm(it.name) !== norm(sh.name)) for (const k of ['name_en', 'name_zh', 'name_hy']) if (it[k] != null) it[k] = null; ch.push(`название «${it.name}» → «${sh.name}»`); it.name = sh.name; }
    if (!same(it.priceParts, sh.parts)) { ch.push(`цена ${(it.priceParts ?? [it.price]).join('/')} → ${sh.parts.join('/')}`); it.priceParts = sh.parts; if ('price' in it) it.price = sh.price; }
    const d = splitBarDesc(sh.desc);
    if (d.volume && !it.volume) { it.volume = d.volume; ch.push(`объём ${d.volume}`); }
    if (d.description && !it.description) { it.description = d.description; ch.push('описание (было пусто)'); }
    if (it.is_archived) { it.is_archived = false; ch.push('из архива'); }
    if (sh.place && s.section.category !== sh.place) {
      const dst = cats().find((x) => x.category === sh.place);
      const i = s.section.items.indexOf(it);
      if (dst && i >= 0) { s.section.items.splice(i, 1); dst.items.push(it); ch.push(`раздел «${s.section.category}» → «${sh.place}»`); }
    }
    if (ch.length) L.updated.push(`bar: «${sh.name}»${how === 'fuzzy' ? ` (сопоставлено с «${oldName}» по близкому написанию)` : ''}: ${ch.join(', ')}`);
  }
  for (const sh of toAdd) {
    let dst = findSection(sh.cat);
    if (!dst) {
      // нового раздела нет — создаём: осенние — под заголовком «Осеннее предложение», остальные в конец
      const section = { kind: 'category', sheet: 'БА', category: sh.cat, items: [] };
      if (norm(sh.section) === 'осеннеепредложениебар') {
        let idx = data.sections.findIndex((x) => x.kind === 'header' && norm(x.title) === 'осеннеепредложение');
        if (idx < 0) { data.sections.unshift({ kind: 'header', sheet: 'БА', title: 'Осеннее предложение' }); idx = 0; }
        let at = idx + 1; while (at < data.sections.length && data.sections[at].kind === 'category' && norm(data.sections[at].category).startsWith('горячие')) at++;
        data.sections.splice(at, 0, section);
      } else data.sections.push(section);
      dst = section; L.added.push(`bar: новый раздел «${sh.cat}»`);
    }
    const id = `bar-${prefix}-${translit(sh.name)}-${hash6(`${slug}|bar|${sh.name}`)}`;
    const d = splitBarDesc(sh.desc);
    dst.items.push({ id, name: sh.name, type: sh.parts.length > 1 ? 1 : 2, priceParts: sh.parts, volume: d.volume, description: d.description, photo: null, is_available: true, is_archived: false, photo_position: null, photo_transform: null });
    L.added.push(`bar: «${sh.name}» ${sh.parts.join('/')} ₽ → «${dst.category}»`);
  }
  const live = site.filter((s) => !s.item.is_archived).length;
  const arch = leftover.filter((s) => !s.item.is_archived);
  if (arch.length > Math.max(5, live * 0.25)) L.problems.push(`bar: в архив просится ${arch.length} из ${live} живых позиций — слишком много, архивирование не применено (проверьте лист)`);
  else for (const s of arch) { s.item.is_archived = true; L.archived.push(`bar: «${s.item.name}» (${s.section.category})`); }
  if (writeIfChanged(file, data, raw)) touched.push(file);
  L.files = touched;
}

// ── отчёт ────────────────────────────────────────────────────────────────
function makeReport() {
  const locs = new Map(); const notes = [];
  return {
    loc(slug) { if (!locs.has(slug)) locs.set(slug, { updated: [], added: [], archived: [], problems: [], notes: [], files: [] }); return locs.get(slug); },
    note(slug, msg) { notes.push(`${slug}: ${msg}`); },
    render(startedAt) {
      const lines = [`# Синхронизация с Google Таблицей — ${startedAt}`, '', APPLY ? '**Режим:** применено.' : '**Режим:** только проверка, ничего не менялось.', ''];
      let total = { u: 0, a: 0, r: 0, p: 0 };
      lines.push('| Локация | Обновлено | Добавлено | В архив | Проблемы |', '|---|---|---|---|---|');
      for (const [slug, L] of locs) { lines.push(`| ${slug} | ${L.updated.length} | ${L.added.length} | ${L.archived.length} | ${L.problems.length} |`); total.u += L.updated.length; total.a += L.added.length; total.r += L.archived.length; total.p += L.problems.length; }
      lines.push(`| **итого** | ${total.u} | ${total.a} | ${total.r} | ${total.p} |`, '');
      for (const n of notes) lines.push(`- ${n}`);
      for (const [slug, L] of locs) {
        if (!L.updated.length && !L.added.length && !L.archived.length && !L.problems.length && !L.notes.length) continue;
        lines.push('', `## ${slug}`, '');
        for (const p of L.problems) lines.push(`- ⚠️ ${p}`);
        for (const n of L.notes) lines.push(`- ℹ️ ${n}`);
        for (const u of L.updated) lines.push(`- ✏️ ${u}`);
        for (const a of L.added) lines.push(`- ➕ ${a}`);
        for (const r of L.archived) lines.push(`- 📦 ${r}`);
      }
      return { text: lines.join('\n') + '\n', total, changed: [...locs.values()].some((L) => L.files.length) };
    },
  };
}

// ── main ─────────────────────────────────────────────────────────────────
// время — московское, чтобы отчёт и лог читались так же, как часы на сервере
const startedAt = new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Moscow' }).slice(0, 19);
const report = makeReport();
const perLocation = new Map(); // slug → items[]
const skipped = new Set();
for (const sheet of CONFIG.sheets) {
  const csv = await fetchCsv(sheet.gid);
  const rows = csv ? parseCsv(csv) : [];
  const minRows = sheet.extra ? 2 : 50;
  if (rows.length < minRows) {
    report.note(sheet.title, `лист не скачался или почти пустой (${rows.length} строк) — локации ${sheet.locations.join(', ')} пропущены`);
    for (const slug of sheet.locations) skipped.add(slug);
    continue;
  }
  const { items, problems } = parseSheet(rows);
  for (const p of problems) report.note(sheet.title, p);
  for (const slug of sheet.locations) { if (!perLocation.has(slug)) perLocation.set(slug, []); perLocation.get(slug).push(...items); }
}
for (const [slug, items] of perLocation) {
  if (skipped.has(slug)) continue;
  if (ONLY && slug !== ONLY) continue;
  try { syncLocation(slug, items, report); } catch (e) { report.note(slug, `ошибка: ${e.message}`); }
}
const { text, total, changed } = report.render(startedAt);
if (REPORT) { mkdirSync(dirname(REPORT), { recursive: true }); writeFileSync(REPORT, text, 'utf-8'); }
const stateDir = join(CONTENT, '.sheet-sync');
if (APPLY && changed) { mkdirSync(join(stateDir, 'history'), { recursive: true }); writeFileSync(join(stateDir, 'history', `${startedAt.replace(/[: ]/g, '-')}.md`), text, 'utf-8'); }
if (APPLY) { mkdirSync(stateDir, { recursive: true }); writeFileSync(join(stateDir, 'last-report.md'), text, 'utf-8'); }
console.log(`[sheet-sync ${startedAt}] ${APPLY ? 'применено' : 'проверка'}: обновлено ${total.u}, добавлено ${total.a}, в архив ${total.r}, проблем ${total.p}${changed ? '' : ' (изменений нет)'}`);
if (!REPORT && !APPLY) process.stdout.write(text);
