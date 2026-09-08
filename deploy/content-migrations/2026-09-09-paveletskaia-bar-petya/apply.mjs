// Бар Павелецкой — сверка с файлом «Для Пети» (барная продукция, сентябрь 2026)
// и списком замечаний бар-менеджера: точные названия (запятые/точки/регистр),
// составы вместо «маркетинговых» описаний у коктейлей/лимонадов/чаёв, категории
// «Вода и напитки», «Сок», «Молочный коктейль», «Популярные коктейли»,
// «Аперитивы / Биттеры / Ликёры» (под заголовком «Крепкий алкоголь»), «Добавки»
// из одной позиции в три, «Францисканер», цены/объёмы по файлу, осеннее
// предложение бара, + починены два названия вин, случайно затёртые руками
// в бэк-офисе (дубли «Просекко» и «Совиньон Блан Паддл Крик»).
//
// usage: node apply.mjs <абсолютный путь к packages/db/content>
//
// Идемпотентно: каждая операция сначала проверяет состояние; повторный прогон
// даёт 0 изменений и файл не переписывает. Работает только с paveletskaia.
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = process.argv[2];
if (!contentDir) {
  console.error('usage: node apply.mjs <packages/db/content>');
  process.exit(2);
}

const patch = JSON.parse(readFileSync(join(here, 'patch.json'), 'utf-8'));
const file = join(contentDir, patch.location, 'bar.json');
if (!existsSync(file)) {
  console.log(`${patch.location}/bar.json не найден — нечего менять`);
  process.exit(0);
}
const data = JSON.parse(readFileSync(file, 'utf-8'));
if (!data || !Array.isArray(data.sections)) {
  console.error('bar.json: нет sections');
  process.exit(1);
}

let changes = 0;
const log = (m) => console.log(`  • ${m}`);
const cats = () => data.sections.filter((s) => s?.kind === 'category');
const findCat = (name) => cats().find((s) => (s.category || '').trim() === name);
const findHeader = (title) => data.sections.find((s) => s?.kind === 'header' && (s.title || '').trim() === title);
const eq = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

// 1. Осеннее предложение — в начало, если ещё нет ни одной из его категорий
for (const sec of patch.prepend ?? []) {
  const exists = sec.kind === 'header' ? findHeader(sec.title) : findCat(sec.category);
  if (exists) continue;
  // вставляем сразу после предыдущей вставленной секции, чтобы порядок сохранился
  const prevIdx = (() => {
    const i = patch.prepend.indexOf(sec);
    for (let k = i - 1; k >= 0; k--) {
      const p = patch.prepend[k];
      const idx = data.sections.indexOf(p.kind === 'header' ? findHeader(p.title) : findCat(p.category));
      if (idx >= 0) return idx;
    }
    return -1;
  })();
  data.sections.splice(prevIdx + 1, 0, JSON.parse(JSON.stringify(sec)));
  changes += 1;
  log(`добавлена секция ${sec.kind === 'header' ? `«${sec.title}» (заголовок)` : `«${sec.category}» (${sec.items.length} поз.)`}`);
}

// 2. Переименование категорий
for (const { from, to } of patch.renameCategories ?? []) {
  const src = findCat(from);
  if (!src || findCat(to)) continue;
  src.category = to;
  changes += 1;
  log(`категория «${from}» → «${to}»`);
}

// 3. Заголовки-секции перед категорией
for (const { before, title, sheet } of patch.insertHeaders ?? []) {
  if (findHeader(title)) continue;
  const idx = data.sections.indexOf(findCat(before));
  if (idx < 0) continue;
  data.sections.splice(idx, 0, { kind: 'header', sheet, title });
  changes += 1;
  log(`заголовок «${title}» перед «${before}»`);
}

// 4. Фото группы — переносим ключ вслед за переименованием категории
data.groupPhotos ??= {};
for (const { from, to } of patch.rekeyGroupPhotos ?? []) {
  if (data.groupPhotos[from] && !data.groupPhotos[to]) {
    data.groupPhotos[to] = data.groupPhotos[from];
    delete data.groupPhotos[from];
    changes += 1;
    log(`фото группы «${from}» → «${to}»`);
  }
}

// 5. Поля позиций по id
const byId = new Map();
for (const s of cats()) for (const it of s.items ?? []) byId.set(it.id, it);
for (const [id, fields] of Object.entries(patch.items ?? {})) {
  const it = byId.get(id);
  if (!it) {
    log(`⚠ позиция ${id} не найдена — пропуск`);
    continue;
  }
  const diff = Object.entries(fields).filter(([k, v]) => !eq(it[k], v));
  if (diff.length === 0) continue;
  for (const [k, v] of diff) it[k] = v;
  changes += 1;
  log(`${it.name}: ${diff.map(([k]) => k).join(', ')}`);
}

// 6. Новые позиции
for (const { category, afterId, item } of patch.newItems ?? []) {
  if (byId.has(item.id)) continue;
  const sec = findCat(category);
  if (!sec) {
    log(`⚠ категория «${category}» не найдена для ${item.name}`);
    continue;
  }
  const at = sec.items.findIndex((i) => i.id === afterId);
  sec.items.splice(at < 0 ? sec.items.length : at + 1, 0, JSON.parse(JSON.stringify(item)));
  byId.set(item.id, item);
  changes += 1;
  log(`добавлена позиция «${item.name}» в «${category}»`);
}

// 7. Порядок позиций внутри категории: перечисленные id — в этом порядке,
// остальные (архив и т.п.) — следом в прежнем относительном порядке.
for (const [category, ids] of Object.entries(patch.order ?? {})) {
  const sec = findCat(category);
  if (!sec) continue;
  const known = new Set(ids);
  const head = ids.map((id) => sec.items.find((i) => i.id === id)).filter(Boolean);
  const tail = sec.items.filter((i) => !known.has(i.id));
  const next = [...head, ...tail];
  if (!eq(next.map((i) => i.id), sec.items.map((i) => i.id))) {
    sec.items = next;
    changes += 1;
    log(`порядок в «${category}»`);
  }
}

if (changes > 0) {
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  renameSync(tmp, file);
}
console.log(`--- ${patch.location}: изменений ${changes}`);
