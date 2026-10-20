// Описания, состав, вес и КБЖУ осеннего меню — во все локации, где такие
// позиции есть (по нормализованному названию). Только в ПУСТЫЕ поля: что
// написано руками в бэк-офисе, не трогаем. Идемпотентно.
// usage: node apply.mjs <абсолютный путь к packages/db/content>
import { readFileSync, writeFileSync, renameSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = process.argv[2];
if (!contentDir) { console.error('usage: node apply.mjs <packages/db/content>'); process.exit(2); }
const patch = JSON.parse(readFileSync(join(here, 'patch.json'), 'utf-8')).items;
const norm = (s) => String(s ?? '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, '');
const byName = new Map(Object.entries(patch).map(([k, v]) => [norm(k), v]));

let total = 0;
for (const slug of readdirSync(contentDir)) {
  const file = join(contentDir, slug, 'kitchen.json');
  if (!existsSync(file)) continue;
  const raw = readFileSync(file, 'utf-8');
  const data = JSON.parse(raw);
  let changed = 0;
  for (const it of data) {
    if (it.is_archived) continue;
    const p = byName.get(norm(it.name));
    if (!p) continue;
    if (p._only_sub && it.sub !== p._only_sub) continue;
    if (p.description && !it.description) { it.description = p.description; changed++; }
    if (p.composition && !it.composition) { it.composition = p.composition; changed++; }
    if (p.kbju && !it.kbju) { it.kbju = p.kbju; changed++; }
    if (p.weight && it.weight == null) { it.weight = p.weight; changed++; }
  }
  if (changed) {
    const out = JSON.stringify(data, null, 2) + '\n';
    writeFileSync(`${file}.tmp`, out, 'utf-8'); renameSync(`${file}.tmp`, file);
    console.log(`${slug}: заполнено полей ${changed}`); total += changed;
  }
}
console.log(total ? `итого полей: ${total}` : 'nothing to change');
