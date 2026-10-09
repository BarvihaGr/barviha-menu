// Полная сверка 25 локаций с файлом «Копия Меню Для макета NEW .xlsx» (09.10.2026).
//
// По решению владельца файл — источник истины по названиям, описаниям, ценам и
// составу меню каждой локации. patch.json собран генератором из файла и снимка
// прод-контента (см. _исходники/01 Меню и цены/Сверки):
//  - update  — позиция есть и там, и там: новые цена/название/подраздел/описание/
//              состав/КБЖУ; у бара — ещё объём и переезд в другой раздел;
//  - add     — позиции из файла, которых на сайте не было (без фото — их грузят
//              через бэк-офис);
//  - archive — позиции сайта, которых в файле нет: в архив (вернуть можно из
//              бэк-офиса, «Архив»);
//  - new_sections — новые разделы бара («Осеннее предложение» — в начало карты).
//
// Руками исправленное после снимка не затираем: каждое поле меняется только
// если его текущее значение совпадает со снимком (from). Поэтому же скрипт
// идемпотентен. Переводы изменённых описаний/состава сбрасываем (name_* при
// смене регистра/пунктуации оставляем).
//
// usage: node apply.mjs <абсолютный путь к packages/db/content>
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
const counts = {};
const bump = (key, n = 1) => { counts[key] = (counts[key] ?? 0) + n; };
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const TRANSLATED = { description: ['description_en', 'description_zh', 'description_hy'], composition: ['composition_en', 'composition_zh', 'composition_hy'] };

function writeIfChanged(file, data, raw) {
  const out = JSON.stringify(data, null, 2) + '\n';
  if (out !== raw) {
    const tmp = `${file}.tmp`;
    writeFileSync(tmp, out, 'utf-8');
    renameSync(tmp, file);
    console.log(`written ${file}`);
  }
}

/** Применить set к позиции, только если текущие значения совпадают со снимком. */
function applySet(it, u, loc) {
  let changed = 0;
  for (const [k, v] of Object.entries(u.set)) {
    if (k === '_section') continue;
    const cur = it[k];
    if (!same(cur, u.from[k]) && !same(cur, v)) { bump(`${loc}: поле ${k} менялось руками — пропущено`); continue; }
    if (same(cur, v)) continue;
    it[k] = v;
    for (const tk of TRANSLATED[k] ?? []) if (it[tk] != null) it[tk] = null;
    changed++;
  }
  return changed;
}

for (const patch of patches) {
  const loc = patch.location;
  // ── кухня и кальяны (плоские массивы), бар Киевской тоже плоский
  const flatRealms = patch.flat_bar ? ['kitchen', 'hookah', 'bar'] : ['kitchen', 'hookah'];
  for (const realm of flatRealms) {
    const file = join(contentDir, loc, `${realm}.json`);
    if (!existsSync(file)) { console.error(`нет файла ${file} — пропускаю`); continue; }
    const raw = readFileSync(file, 'utf-8');
    const data = JSON.parse(raw);
    const byId = new Map(data.map((it) => [it.id, it]));
    for (const u of patch.update.filter((x) => x.realm === realm)) {
      const it = byId.get(u.id);
      if (!it) { bump(`${loc}/${realm}: нет позиции для обновления`); continue; }
      if (applySet(it, u, loc)) bump(`${loc}/${realm} обновлено`);
    }
    for (const a of patch.archive.filter((x) => x.realm === realm)) {
      const it = byId.get(a.id);
      if (!it || it.is_archived || it.name !== a.name) continue;
      it.is_archived = true; bump(`${loc}/${realm} в архив`);
    }
    for (const a of patch.add.filter((x) => x.realm === realm)) {
      if (byId.has(a.item.id)) continue;
      data.push(a.item); byId.set(a.item.id, a.item); bump(`${loc}/${realm} добавлено`);
    }
    writeIfChanged(file, data, raw);
  }
  if (patch.flat_bar) continue;

  // ── бар «Арки»: секции
  const file = join(contentDir, loc, 'bar.json');
  if (!existsSync(file)) { console.error(`нет файла ${file} — пропускаю`); continue; }
  const raw = readFileSync(file, 'utf-8');
  const data = JSON.parse(raw);
  const sectionByName = () => new Map(data.sections.filter((s) => s.kind === 'category').map((s) => [s.category, s]));
  // новые разделы
  for (const ns of patch.new_sections) {
    if (sectionByName().has(ns.name)) continue;
    const section = { kind: 'category', sheet: 'БА', category: ns.name, items: [] };
    if (ns.position === 'start') {
      // под заголовком «Осеннее предложение»: заголовок один на все такие разделы, после него — по порядку
      let idx = data.sections.findIndex((s) => s.kind === 'header' && s.title === ns.header);
      if (idx < 0 && ns.header) { data.sections.unshift({ kind: 'header', sheet: 'БА', title: ns.header }); idx = 0; }
      let insertAt = idx + 1;
      while (insertAt < data.sections.length && data.sections[insertAt].kind === 'category' && patch.new_sections.some((x) => x.name === data.sections[insertAt].category)) insertAt++;
      data.sections.splice(insertAt, 0, section);
    } else {
      data.sections.push(section);
    }
    bump(`${loc}/bar новый раздел`);
  }
  const sections = sectionByName();
  const locate = (id) => {
    for (const s of data.sections) {
      if (s.kind !== 'category') continue;
      const i = s.items.findIndex((it) => it.id === id);
      if (i >= 0) return { s, i };
    }
    return null;
  };
  for (const u of patch.update.filter((x) => x.realm === 'bar')) {
    const found = locate(u.id);
    if (!found) { bump(`${loc}/bar: нет позиции для обновления`); continue; }
    const it = found.s.items[found.i];
    let changed = applySet(it, u, loc);
    const target = u.set._section;
    if (target && found.s.category !== target) {
      if (found.s.category !== u.from._section) { bump(`${loc}/bar: раздел менялся руками — пропущено`); }
      else {
        const dst = sections.get(target);
        if (dst) { found.s.items.splice(found.i, 1); dst.items.push(it); changed++; bump(`${loc}/bar переезд в раздел`); }
      }
    }
    if (changed) bump(`${loc}/bar обновлено`);
  }
  for (const a of patch.archive.filter((x) => x.realm === 'bar')) {
    const found = locate(a.id);
    if (!found) continue;
    const it = found.s.items[found.i];
    if (it.is_archived || it.name !== a.name) continue;
    it.is_archived = true; bump(`${loc}/bar в архив`);
  }
  for (const a of patch.add.filter((x) => x.realm === 'bar')) {
    if (locate(a.item.id)) continue;
    const dst = sections.get(a.section);
    if (!dst) { bump(`${loc}/bar: нет раздела ${a.section}`); continue; }
    dst.items.push(a.item); bump(`${loc}/bar добавлено`);
  }
  writeIfChanged(file, data, raw);
}

console.log(Object.entries(counts).sort().map(([k, v]) => `${k}: ${v}`).join('\n') || 'nothing to change');
