// Кальян: 12 позиций (описание чаши/табака/колбы в поле composition) не
// имели перевода ни в одной локации — найдено полным аудитом покрытия
// переводов по всему меню. Переводы на en/zh/hy добавлены в patch.json.
//
// usage: node apply.mjs <абсолютный путь к packages/db/content>
//
// Идемпотентно и безопасно для ручных правок бэк-офиса: composition_en/
// zh/hy проставляем ТОЛЬКО если (а) сам composition (ru) всё ещё дословно
// совпадает со старым известным текстом (patch.items[id].composition.from)
// и (б) конкретное языковое поле всё ещё пустое — если менеджер уже что-то
// вписал руками (в т.ч. только для одного языка из трёх), это поле не
// трогаем. Раз мы только дополняем пустое, а не заменяем текст, повторный
// прогон сам по себе не даёт естественного маркера «уже применено» —
// проверка (б) и есть идемпотентность.
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
const log = [];

const locationDirs = readdirSync(contentDir).filter((name) => {
  try {
    return statSync(join(contentDir, name)).isDirectory();
  } catch {
    return false;
  }
});

for (const loc of locationDirs) {
  const file = join(contentDir, loc, 'hookah.json');
  if (!existsSync(file)) continue;

  const raw = readFileSync(file, 'utf-8');
  let items;
  try {
    items = JSON.parse(raw);
  } catch {
    console.error(`${loc}: hookah.json не парсится, пропускаю`);
    continue;
  }
  if (!Array.isArray(items)) continue;

  const isEmpty = (v) => v == null || (typeof v === 'string' && v.trim() === '');

  let changedHere = 0;
  for (const it of items) {
    const op = patch.items[it.id]?.composition;
    if (!op) continue;
    if (it.composition !== op.from) continue; // состав с тех пор отредактирован — не трогаем
    let touched = false;
    for (const lang of ['en', 'zh', 'hy']) {
      const key = `composition_${lang}`;
      if (isEmpty(it[key])) {
        it[key] = op[lang];
        touched = true;
      }
    }
    if (touched) changedHere += 1;
  }

  if (changedHere > 0) {
    const out = JSON.stringify(items, null, 2) + '\n';
    const tmp = `${file}.tmp`;
    writeFileSync(tmp, out, 'utf-8');
    renameSync(tmp, file);
    log.push(`${loc}: ${changedHere} позиций`);
  }
}

console.log(log.join('\n') || 'nothing to change');
console.log(`--- локаций затронуто: ${log.length}`);
