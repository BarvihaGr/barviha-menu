// Рамэнки/Невский/Рублёвка/Тула-Арка/Тула-Ликёрка/Домодедово/Пенза/Нижний
// Новгород/Саратов · сверка с мастер-файлом «Меню Для макета NEW.xlsx».
//
// Тот же метод, что и в 2026-09-21-maxackala-menu-file-sync: только позиции,
// которых на сайте не было вообще (по точному совпадению названия), никакие
// существующие цены/описания не трогаем и не переименовываем. У бара текст
// колонки «Описание» почти всегда объём+состав, а не текст для гостя — если
// это чистый объём («300мл/1л.») кладём в volume, иначе оставляем как есть в
// description (только для НОВЫХ позиций, старые не трогаем). Для кухни то же
// самое: если текст колонки — это «БЖУ: x/y/z. ККАЛ: n» — кладём в kbju,
// если короткий список ингредиентов без цифр — в composition, иначе в
// description.
//
// usage: node apply.mjs <абсолютный путь к packages/db/content>
//
// Идемпотентно: каждая позиция добавляется, только если элемента с таким id
// в массиве/разделе ещё нет. patch.json — список патчей по локациям.
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = process.argv[2];
if (!contentDir) {
  console.error('usage: node apply.mjs <packages/db/content>');
  process.exit(2);
}

const patches = JSON.parse(readFileSync(join(here, 'patch.json'), 'utf-8'));
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

for (const patch of patches) {
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
        log.push(`${patch.location}/${realm} + ${item.name}`);
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
          log.push(`${patch.location}/bar: новый раздел «${entry.section}»`);
        }
        const existingIds = new Set(section.items.map((it) => it.id));
        if (!existingIds.has(entry.item.id)) {
          section.items.push(entry.item);
          log.push(`${patch.location}/bar/${entry.section} + ${entry.item.name}`);
        }
      }
      writeIfChanged(file, data, raw);
    } else {
      console.error(`нет файла ${file} — пропускаю`);
    }
  }
}

console.log(log.join('\n') || 'nothing to change');
console.log(`--- ${log.length} changes`);
