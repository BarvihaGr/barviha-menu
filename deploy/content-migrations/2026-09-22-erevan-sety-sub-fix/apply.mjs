// Ереван · исправление sub у 5 позиций из «Авторская кухня / Сеты».
//
// Найдено аудитом после 2026-09-22-taskent-erevan-menu-file-sync: категория
// «Сеты» в других точках сети (Тула) — это суши-сеты, поэтому маппинг клал
// её в sub=rolls («Роллы и суши»). У Еревана же под тем же словом «Сеты»
// скрываются сборные платтеры и шот-флайты (Сет колбасок, Текила сет,
// Русский сет с 4 рюмками водки, Сет барбекю, Сет с морепродуктами) —
// никакого отношения к суши/роллам не имеют. Переносим их в sub=hot-app
// (Горячие закуски) — ближайшая по смыслу «сборная закуска на компанию».
//
// usage: node apply.mjs <абсолютный путь к packages/db/content>
// Идемпотентно: меняет sub только если он ещё "rolls".
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const contentDir = process.argv[2];
if (!contentDir) {
  console.error('usage: node apply.mjs <packages/db/content>');
  process.exit(2);
}

const ids = [
  'kitchen-erv-set-kolbasok-a9ptwy',
  'kitchen-erv-tekila-set-qwasah',
  'kitchen-erv-russkii-set-s-chetyrmya-w2wnve',
  'kitchen-erv-set-barbekyu-phvi5u',
  'kitchen-erv-set-s-moreproduktami-c78hpv',
];

const file = join(contentDir, 'erevan', 'kitchen.json');
if (!existsSync(file)) {
  console.error(`нет файла ${file}`);
  process.exit(1);
}
const raw = readFileSync(file, 'utf-8');
const data = JSON.parse(raw);
const idSet = new Set(ids);
const log = [];
for (const it of data) {
  if (idSet.has(it.id) && it.sub === 'rolls') {
    it.sub = 'hot-app';
    log.push(`${it.name}: rolls -> hot-app`);
  }
}

const out = JSON.stringify(data, null, 2) + '\n';
if (out !== raw) {
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, out, 'utf-8');
  renameSync(tmp, file);
  console.log(`written ${file}`);
}
console.log(log.join('\n') || 'nothing to change');
console.log(`--- ${log.length} changes`);
