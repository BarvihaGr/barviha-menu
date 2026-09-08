// Павелецкая: переводы всего живого меню (кухня / бар / кальян) на узбекский
// (uz, латиница) и арабский (ar) — поля name_uz/name_ar, description_uz/
// description_ar, composition_uz/composition_ar. Подготовка «+2 языка»:
// сами локали в apps/menu включаются отдельным кодом в той же ветке.
//
// usage: node apply.mjs <абсолютный путь к packages/db/content>
//
// Идемпотентно и безопасно для ручных правок бэк-офиса: каждое языковое
// поле заполняется ТОЛЬКО если оно ещё пустое — что уже вписано руками,
// не трогаем. Позиции, которых нет в patch.json (архив на момент перевода,
// добавленные позже), пропускаются.
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
const isEmpty = (v) => v == null || (typeof v === 'string' && v.trim() === '');
const LANG_FIELDS = ['name_uz', 'name_ar', 'description_uz', 'description_ar', 'composition_uz', 'composition_ar'];

function applyToItem(it, tr) {
  let touched = false;
  for (const key of LANG_FIELDS) {
    if (!(key in tr) || isEmpty(tr[key])) continue;
    if (isEmpty(it[key])) {
      it[key] = tr[key];
      touched = true;
    }
  }
  return touched;
}

function writeIfChanged(file, raw, data) {
  const out = JSON.stringify(data, null, 2) + '\n';
  if (out === raw) return false;
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, out, 'utf-8');
  renameSync(tmp, file);
  return true;
}

const loc = patch.location;
const log = [];

for (const realm of ['kitchen', 'hookah']) {
  const file = join(contentDir, loc, `${realm}.json`);
  const map = patch[realm] ?? {};
  if (!existsSync(file) || Object.keys(map).length === 0) continue;
  const raw = readFileSync(file, 'utf-8');
  const items = JSON.parse(raw);
  if (!Array.isArray(items)) continue;
  let n = 0;
  for (const it of items) {
    const tr = map[it.id];
    if (tr && applyToItem(it, tr)) n += 1;
  }
  if (n > 0 && writeIfChanged(file, raw, items)) log.push(`${loc}/${realm}: ${n} позиций`);
}

{
  const file = join(contentDir, loc, 'bar.json');
  const map = patch.bar ?? {};
  if (existsSync(file) && Object.keys(map).length > 0) {
    const raw = readFileSync(file, 'utf-8');
    const data = JSON.parse(raw);
    if (data && Array.isArray(data.sections)) {
      let n = 0;
      for (const sec of data.sections) {
        if (sec?.kind !== 'category') continue;
        for (const it of sec.items ?? []) {
          const tr = map[it.id];
          if (tr && applyToItem(it, tr)) n += 1;
        }
      }
      if (n > 0 && writeIfChanged(file, raw, data)) log.push(`${loc}/bar: ${n} позиций`);
    }
  }
}

console.log(log.join('\n') || 'nothing to change');
console.log(`--- файлов изменено: ${log.length}`);
