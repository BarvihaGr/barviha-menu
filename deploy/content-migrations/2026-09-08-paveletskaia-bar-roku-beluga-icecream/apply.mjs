// Павелецкая · правки названий по замечаниям руководителя (кухня/бар/кальяны):
// опечатка «тар тар» → «тартар», разнобой в дефисах («Том Ям», «Крем - суп»),
// весь капс у бургеров/стейков/роллов, названия-цитаты без кавычек («Каша из
// топора», «Барвиха», «Ещё один, пожалуйста»), сокращения в баре («б.газ/газ»,
// «б/а»), уточнение — у котлеток из индейки соус на выбор из трёх, а не один.
//
// usage: node apply.mjs <абсолютный путь к packages/db/content>
//
// Идемпотентно и безопасно для ручных правок бэк-офиса: каждое поле
// переписывается ТОЛЬКО если оно всё ещё дословно совпадает со старым
// значением (from) — если кто-то уже поправил вручную, миграция это не
// тронет и не станет ругаться.
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
const log = [];

function applyFieldPatches(target, fieldPatches, label) {
  for (const [field, { from, to }] of Object.entries(fieldPatches)) {
    if ((target[field] ?? '').trim() === from) {
      target[field] = to;
      log.push(`${label} [${field}]`);
    }
  }
}

for (const fileDef of patch.files) {
  const file = join(contentDir, fileDef.location, `${fileDef.realm}.json`);
  if (!existsSync(file)) {
    console.error(`нет файла ${file} — пропускаю`);
    continue;
  }
  const raw = readFileSync(file, 'utf-8');
  const data = JSON.parse(raw);

  if (fileDef.shape === 'sections') {
    for (const section of data.sections ?? []) {
      if (section.kind !== 'category') continue;
      for (const it of section.items ?? []) {
        const fields = fileDef.items[it.id];
        if (fields) applyFieldPatches(it, fields, `${fileDef.realm}/${it.id}`);
      }
    }
  } else {
    for (const it of data) {
      const fields = fileDef.items[it.id];
      if (fields) applyFieldPatches(it, fields, `${fileDef.realm}/${it.id}`);
    }
  }

  const out = JSON.stringify(data, null, 2) + '\n';
  if (out !== raw) {
    const tmp = `${file}.tmp`;
    writeFileSync(tmp, out, 'utf-8');
    renameSync(tmp, file);
    console.log(`written ${file}`);
  }
}

console.log(log.join('\n') || 'nothing to change');
console.log(`--- ${log.length} changes`);
