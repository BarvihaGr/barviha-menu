// Махачкала · пилот сверки с мастер-файлом «Меню Для макета NEW.xlsx»
// (лист «Махачкала»): 88 позиций, которых не было на сайте вообще — целый
// раздел «Завтраки», часть кальянов («На классической/электронной/фруктовой
// чаше», парфюмерная коллекция), закуски/салаты/супы/гарниры/бургеры/стейки/
// горячее/пицца/роллы/десерты/мороженое, часть бара (новые разделы «Горячие
// напитки» и «Орешки» + добавки в существующие разделы).
//
// Существующие ~55 позиций, которые уже были на сайте под тем же названием,
// НЕ трогаем: у бара колонка «Описание» в файле на деле почти everywhere —
// это объём+состав («300мл/1л. Манго, маракуйя...»), а не текст для гостя;
// на сайте уже стоят полноценные описания — переписывать их технической
// строкой было бы шагом назад, не «синхронизацией».
//
// usage: node apply.mjs <абсолютный путь к packages/db/content>
//
// Идемпотентно: каждая позиция добавляется, только если элемента с таким id
// в массиве/разделе ещё нет.
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

function writeIfChanged(file, data, raw) {
  const out = JSON.stringify(data, null, 2) + '\n';
  if (out !== raw) {
    const tmp = `${file}.tmp`;
    writeFileSync(tmp, out, 'utf-8');
    renameSync(tmp, file);
    console.log(`written ${file}`);
  }
}

// --- flat-массивы (kitchen.json, hookah.json) ---
for (const [realm, items] of Object.entries(patch.flat)) {
  const file = join(contentDir, patch.location, `${realm}.json`);
  if (!existsSync(file)) { console.error(`нет файла ${file} — пропускаю`); continue; }
  const raw = readFileSync(file, 'utf-8');
  const data = JSON.parse(raw);
  const existingIds = new Set(data.map((it) => it.id));
  for (const item of items) {
    if (!existingIds.has(item.id)) {
      data.push(item);
      existingIds.add(item.id);
      log.push(`${realm} + ${item.name}`);
    }
  }
  writeIfChanged(file, data, raw);
}

// --- bar.json (sections) ---
if (patch.bar && patch.bar.length > 0) {
  const file = join(contentDir, patch.location, 'bar.json');
  if (existsSync(file)) {
    const raw = readFileSync(file, 'utf-8');
    const data = JSON.parse(raw);
    const byName = new Map(data.sections.filter((s) => s.kind === 'category').map((s) => [s.category, s]));
    for (const entry of patch.bar) {
      let section = byName.get(entry.section);
      if (!section) {
        section = { kind: 'category', sheet: 'custom', category: entry.section, items: [] };
        data.sections.push(section);
        byName.set(entry.section, section);
        log.push(`bar: новый раздел «${entry.section}»`);
      }
      const existingIds = new Set(section.items.map((it) => it.id));
      if (!existingIds.has(entry.item.id)) {
        section.items.push(entry.item);
        log.push(`bar/${entry.section} + ${entry.item.name}`);
      }
    }
    writeIfChanged(file, data, raw);
  } else {
    console.error(`нет файла ${file} — пропускаю`);
  }
}

console.log(log.join('\n') || 'nothing to change');
console.log(`--- ${log.length} changes`);
