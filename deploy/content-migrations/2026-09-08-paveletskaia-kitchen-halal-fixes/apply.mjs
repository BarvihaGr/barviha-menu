// Павелецкая · кухня: три «Халяль»-позиции (борщ, мясная тарелка, пицца)
// получили формальную отписку вместо описания («…приготовлен по стандарту
// халяль», без единого слова о составе) — причём один и тот же текст был
// продублирован и в en/zh/hy. Плюс два «Халяль»-бургера были заведены без
// КБЖУ вовсе (только вес). Плюс опечатка — хвостовой пробел в имени «ТОМ ЯМ ».
//
// usage: node apply.mjs <абсолютный путь к packages/db/content>
//
// Идемпотентно и безопасно для ручных правок бэк-офиса: description
// переписываем ТОЛЬКО если он всё ещё дословно совпадает со старой
// заглушкой (from) — если менеджер уже поправил текст руками, миграция
// не тронет его. KBJU — только если kcal ещё null. Имя — только если
// совпадает с точным старым (с пробелом) значением.
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
const file = join(contentDir, patch.location, `${patch.realm}.json`);
if (!existsSync(file)) {
  console.error(`нет файла ${file}`);
  process.exit(1);
}

const raw = readFileSync(file, 'utf-8');
const items = JSON.parse(raw);
const log = [];

for (const it of items) {
  const op = patch.items[it.id];
  if (!op) continue;

  if (op.name && it.name === op.name.from) {
    it.name = op.name.to;
    log.push(`NAME  ${op.name.to}`);
  }

  if (op.kbju && it.kbju && it.kbju.kcal == null) {
    it.kbju = { ...it.kbju, ...op.kbju };
    log.push(`KBJU  ${it.name}: ${JSON.stringify(it.kbju)}`);
  }

  if (op.description) {
    for (const [field, { from, to }] of Object.entries(op.description)) {
      if ((it[field] ?? '').trim() === from) {
        it[field] = to;
        log.push(`DESC  ${it.name} [${field}]`);
      }
    }
  }
}

const out = JSON.stringify(items, null, 2) + '\n';
console.log(log.join('\n') || 'nothing to change');
console.log(`--- ${log.length} changes`);
if (out !== raw) {
  const tmp = `${file}.tmp`;
  writeFileSync(tmp, out, 'utf-8');
  renameSync(tmp, file);
  console.log(`written ${file}`);
}
