// Павелецкая · кухня · лето 2026: КБЖУ/граммовки из «Кбжу новое лето 26
// 10.08.26.xlsx», описания на 4 языках вместо однострочных заглушек, чистка
// служебного текста «127г. БЖУ: …» из составов ПП-раздела.
//
// usage: node apply.mjs <абсолютный путь к packages/db/content>
//
// Идемпотентно и ничего не перезаписывает:
//   kbju == null                      -> ставим КБЖУ целиком
//   kbju.weight есть, kcal == null     -> дозаполняем БЖУ/ккал, вес не трогаем
//   description — заглушка (< 40 симв) -> новое описание ru/en/zh/hy
//   composition RU содержит «БЖУ»/«ККАЛ» -> чистый состав
// Формат файла = JSON.stringify(data, null, 2) + '\n' (как пишет бэк-офис).
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
  if (it.is_archived) continue;
  const op = patch.items[it.id];
  if (!op) continue;

  if (op.kbju) {
    const kb = it.kbju;
    if (kb == null) {
      it.kbju = { ...op.kbju };
      log.push(`KBJU  ${it.name}: ${JSON.stringify(it.kbju)}`);
    } else if (kb.kcal == null && op.kbju.kcal != null) {
      it.kbju = { ...op.kbju, weight: kb.weight ?? op.kbju.weight };
      log.push(`KBJU+ ${it.name}: ${JSON.stringify(it.kbju)}`);
    }
  }

  if (op.description && ((it.description ?? '').trim().length < 40)) {
    for (const [k, v] of Object.entries(op.description)) it[k] = v;
    log.push(`DESC  ${it.name}`);
  }

  if (op.composition && /БЖУ|ККАЛ/.test(it.composition ?? '')) {
    it.composition = op.composition;
    log.push(`COMP  ${it.name}: ${op.composition}`);
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
