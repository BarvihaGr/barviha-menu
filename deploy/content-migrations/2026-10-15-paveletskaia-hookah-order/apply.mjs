// Порядок кальянов Павелецкой (15.10.2026, по указанию владельца, пока только
// Павелецкая): «Кальянная карта» — классика → электро → парфюмерная → фруктовая;
// «Специальное предложение» — Малибу → Багровое цветение → Синергия вкусов.
// Парфюмерная коллекция переезжает из «Специального предложения» в основную карту.
// Идемпотентно: если порядок и подразделы уже такие — ничего не пишет.
//
// usage: node apply.mjs <абсолютный путь к packages/db/content>
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const contentDir = process.argv[2];
if (!contentDir) { console.error('usage: node apply.mjs <packages/db/content>'); process.exit(2); }

const ORDER = [
  ['На классической чаше', 'hookah'],
  ['На электронной чаше', 'hookah'],
  ['Парфюмерная коллекция', 'hookah'],
  ['На фруктовой чаше', 'hookah'],
  ['Малибу', 'Специальное предложение'],
  ['Багровое цветение', 'Специальное предложение'],
  ['Синергия вкусов', 'Специальное предложение'],
];

const file = join(contentDir, 'paveletskaia', 'hookah.json');
if (!existsSync(file)) { console.error(`нет ${file}`); process.exit(0); }
const raw = readFileSync(file, 'utf-8');
const data = JSON.parse(raw);
const norm = (s) => String(s ?? '').trim().toLowerCase();

const head = [];
for (const [name, sub] of ORDER) {
  const it = data.find((x) => !x.is_archived && norm(x.name) === norm(name) && !head.includes(x));
  if (!it) { console.error(`не нашёл живую позицию «${name}» — порядок не меняю`); process.exit(0); }
  it.sub = sub;
  head.push(it);
}
const rest = data.filter((x) => !head.includes(x));
const out = JSON.stringify([...head, ...rest], null, 2) + '\n';
if (out === raw) { console.log('paveletskaia/hookah: уже в нужном порядке'); process.exit(0); }
writeFileSync(`${file}.tmp`, out, 'utf-8');
renameSync(`${file}.tmp`, file);
console.log(`paveletskaia/hookah: переставлено ${head.length} позиций`);
