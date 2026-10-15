// Кальяны Павелецкой тремя блоками (15.10.2026, по скриншотам владельца; пока
// только Павелецкая):
//   1. «Кальянная карта»: На классической чаше → На электронной чаше → На фруктовой чаше
//   2. «Парфюмерная коллекция» — отдельный блок с одной позицией
//   3. «Специальное предложение»: Малибу → Багровое цветение → Синергия вкусов
// Порядок внутри блока сайт берёт из каталога бэк-офиса (стрелки вверх/вниз).
// Идемпотентно. usage: node apply.mjs <абсолютный путь к packages/db/content>
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const contentDir = process.argv[2];
if (!contentDir) { console.error('usage: node apply.mjs <packages/db/content>'); process.exit(2); }

const ORDER = [
  ['На классической чаше', 'hookah'],
  ['На электронной чаше', 'hookah'],
  ['На фруктовой чаше', 'hookah'],
  ['Парфюмерная коллекция', 'Парфюмерная коллекция'],
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
if (out === raw) { console.log('paveletskaia/hookah: уже тремя блоками'); process.exit(0); }
writeFileSync(`${file}.tmp`, out, 'utf-8');
renameSync(`${file}.tmp`, file);
console.log(`paveletskaia/hookah: расставлено ${head.length} позиций в 3 блока`);
