// Винная карта: 36 позиций (Игристые и шампанские / Белые / Розовые /
// Красные) переписаны точно по актуальному файлу «Винная карта»
// (сентябрь 2026) — регистр и порядок слов как в источнике, + сверенные
// переводы en/zh/hy. Применяется одинаково во всех локациях, у которых
// bar.json ещё содержит секции {kind:"category", items:[...]} с этими
// 36 id (клон шаблона arka — см. scripts/clone-arka-to-locations.ts).
//
// usage: node apply.mjs <абсолютный путь к packages/db/content>
//
// Идемпотентно и безопасно для ручных правок бэк-офиса: name переписываем
// ТОЛЬКО если он всё ещё дословно совпадает со старым шаблонным значением
// (patch.items[id].name.from) — если менеджер локации уже переименовал
// вино вручную, миграция его не тронет. name_en/zh/hy обновляются вместе
// с name (одно и то же условие).
import { readFileSync, writeFileSync, renameSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = process.argv[2];
if (!contentDir) {
  console.error('usage: node apply.mjs <packages/db/content>');
  process.exit(2);
}

const patch = JSON.parse(readFileSync(join(here, 'patch.json'), 'utf-8'));
const wineCategories = new Set(patch.categories);
const log = [];

const locationDirs = readdirSync(contentDir).filter((name) => {
  try {
    return statSync(join(contentDir, name)).isDirectory();
  } catch {
    return false;
  }
});

for (const loc of locationDirs) {
  const file = join(contentDir, loc, 'bar.json');
  if (!existsSync(file)) continue;

  const raw = readFileSync(file, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    console.error(`${loc}: bar.json не парсится, пропускаю`);
    continue;
  }
  if (!data || !Array.isArray(data.sections)) continue;

  let changedHere = 0;
  for (const sec of data.sections) {
    if (sec?.kind !== 'category' || !wineCategories.has((sec.category || '').trim())) continue;
    for (const it of sec.items ?? []) {
      const op = patch.items[it.id];
      if (!op) continue;
      if (it.name !== op.name.from) continue; // уже отредактировано руками или уже смигрировано
      it.name = op.name.to;
      it.name_en = op.name_en;
      it.name_zh = op.name_zh;
      it.name_hy = op.name_hy;
      changedHere += 1;
    }
  }

  if (changedHere > 0) {
    const out = JSON.stringify(data, null, 2) + '\n';
    const tmp = `${file}.tmp`;
    writeFileSync(tmp, out, 'utf-8');
    renameSync(tmp, file);
    log.push(`${loc}: ${changedHere} позиций`);
  }
}

console.log(log.join('\n') || 'nothing to change');
console.log(`--- локаций затронуто: ${log.length}`);
