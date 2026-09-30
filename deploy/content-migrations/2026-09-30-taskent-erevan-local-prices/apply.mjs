// Ташкент/Ереван · цены в местной валюте (сумы / драмы).
//
// Обе точки клонированы с Арки, поэтому часть позиций осталась с московскими
// ценами в рублях, а позиции, добавленные сверкой 2026-09-22 из мастер-файла
// «Меню Для макета NEW.xlsx», — уже в местной валюте. На витрине это было
// вперемешку под одним знаком ₽. Знак валюты теперь берётся по локации
// (packages/db/src/currency.ts), а эта миграция приводит к местной валюте
// сами цены (patch.json собран из мастер-файла и снимка прод-контента 30.09):
//
//  - set     — шаблонная позиция есть в местном меню (по названию): ставим
//              цену из файла (у бара ещё и объём, если он указан в файле);
//  - archive — шаблонной позиции в местном меню нет (или это двойник уже
//              добавленной местной): убираем в архив. Вернуть можно из
//              бэк-офиса («Архив»), предварительно поставив местную цену;
//  - add     — позиция из файла, которую сверка 22.09 пропустила из-за
//              совпадения названия с другой позицией.
//
// Руками исправленное не трогаем: и цена, и архив меняются только если
// текущая цена совпадает с той, что была в снимке (поле from). Поэтому же
// скрипт идемпотентен: после первого прогона цены уже другие.
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
const bump = (key) => { counts[key] = (counts[key] ?? 0) + 1; };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

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
  for (const realm of ['kitchen', 'hookah', 'bar']) {
    const file = join(contentDir, patch.location, `${realm}.json`);
    if (!existsSync(file)) { console.error(`нет файла ${file} — пропускаю`); continue; }
    const raw = readFileSync(file, 'utf-8');
    const data = JSON.parse(raw);
    const isBar = realm === 'bar';
    const items = isBar
      ? data.sections.filter((s) => s.kind === 'category').flatMap((s) => s.items)
      : data;
    const byId = new Map(items.map((it) => [it.id, it]));
    const priceOf = (it) => (isBar ? it.priceParts : it.price);

    for (const e of patch.set.filter((x) => x.realm === realm)) {
      const it = byId.get(e.id);
      if (!it || !same(priceOf(it), e.from)) { bump(`${patch.location}/${realm} цена: пропущено`); continue; }
      if (isBar) {
        it.priceParts = e.to;
        if (e.volume) it.volume = e.volume;
      } else {
        it.price = e.to;
      }
      bump(`${patch.location}/${realm} цена из файла`);
    }

    for (const e of patch.archive.filter((x) => x.realm === realm)) {
      const it = byId.get(e.id);
      if (!it || it.is_archived || !same(priceOf(it), e.from)) { bump(`${patch.location}/${realm} архив: пропущено`); continue; }
      it.is_archived = true;
      bump(`${patch.location}/${realm} в архив`);
    }

    // add — только плоские разделы (кухня/кальяны); для бара не понадобилось.
    if (!isBar) {
      for (const e of (patch.add ?? []).filter((x) => x.realm === realm)) {
        if (byId.has(e.item.id)) continue;
        data.push(e.item);
        bump(`${patch.location}/${realm} добавлено`);
      }
    }

    writeIfChanged(file, data, raw);
  }
}

console.log(Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join('\n') || 'nothing to change');
