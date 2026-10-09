// Исправление после 2026-10-09-menu-file-full-sync: когда одно название в мастер-файле
// встречалось дважды («Мясная тарелка» 2300 ₽ в осеннем предложении и 1700 ₽ в закусках),
// существующая позиция (с фото и весом) ушла в первую строку (осеннюю, 2300), а для второй
// завелась новая пустая карточка. Правильно наоборот: старая цена существующей позиции
// совпадает со второй строкой — значит это она. Меняем местами цену и подраздел между парой;
// фото и вес остаются у прежней карточки. Меняем только если значения всё ещё те, что
// поставила та миграция (руками не правили). Идемпотентно.
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const contentDir = process.argv[2];
if (!contentDir) { console.error('usage: node apply.mjs <packages/db/content>'); process.exit(2); }
const pairs = JSON.parse(readFileSync(join(here, 'patch.json'), 'utf-8'));
let n = 0;
const byFile = new Map();
for (const p of pairs) { const f = `${p.location}/${p.realm}`; (byFile.get(f) ?? byFile.set(f, []).get(f)).push(p); }
for (const [rel, list] of byFile) {
  const file = join(contentDir, `${rel}.json`);
  if (!existsSync(file)) { console.error(`нет ${file}`); continue; }
  const raw = readFileSync(file, 'utf-8'); const data = JSON.parse(raw); let changed = false;
  for (const p of list) {
    const a = data.find((i) => i.id === p.existing.id), b = data.find((i) => i.id === p.added.id);
    if (!a || !b) continue;
    const ok = a.price === p.existing.nowPrice && (p.existing.nowSub == null || a.sub === p.existing.nowSub) && b.price === p.added.nowPrice && b.sub === p.added.nowSub;
    if (!ok) { console.log(`${rel}: ${a.name} — значения уже менялись, пропуск`); continue; }
    a.price = p.existing.price; if (p.existing.sub) a.sub = p.existing.sub;
    b.price = p.added.price; if (p.added.sub) b.sub = p.added.sub;
    changed = true; n++; console.log(`${rel}: ${a.name} — ${a.price} ₽/${a.sub} ↔ новая ${b.price} ₽/${b.sub}`);
  }
  if (changed) { writeFileSync(`${file}.tmp`, JSON.stringify(data, null, 2) + '\n', 'utf-8'); renameSync(`${file}.tmp`, file); }
}
console.log(`--- исправлено пар: ${n}`);
