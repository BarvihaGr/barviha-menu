// Ереван · исправление дублей «бокал/бутылка» в винной карте, найденных
// аудитом после 2026-09-22-taskent-erevan-menu-file-sync (см. patch.json).
//
// usage: node apply.mjs <абсолютный путь к packages/db/content>
//
// Идемпотентно: удаление пропускается, если id уже отсутствует; добавление —
// если id уже есть.
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

const file = join(contentDir, patch.location, 'bar.json');
if (!existsSync(file)) {
  console.error(`нет файла ${file}`);
  process.exit(1);
}
const raw = readFileSync(file, 'utf-8');
const data = JSON.parse(raw);
const removeSet = new Set(patch.remove_ids);

for (const section of data.sections) {
  if (section.kind !== 'category') continue;
  const before = section.items.length;
  section.items = section.items.filter((it) => {
    if (removeSet.has(it.id)) {
      log.push(`- ${section.category}/${it.name} (${it.id})`);
      return false;
    }
    return true;
  });
}

const byName = new Map(data.sections.filter((s) => s.kind === 'category').map((s) => [s.category, s]));
for (const entry of patch.add) {
  let section = byName.get(entry.section);
  if (!section) {
    section = { kind: 'category', sheet: 'custom', category: entry.section, items: [] };
    data.sections.push(section);
    byName.set(entry.section, section);
  }
  const existingIds = new Set(section.items.map((it) => it.id));
  if (!existingIds.has(entry.item.id)) {
    section.items.push(entry.item);
    log.push(`+ ${entry.section}/${entry.item.name} (${entry.item.id})`);
  }
}

writeIfChanged(file, data, raw);
console.log(log.join('\n') || 'nothing to change');
console.log(`--- ${log.length} changes`);
