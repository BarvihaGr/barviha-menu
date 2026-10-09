// Саратов: в мастер-файле две позиции соусов (170 ₽ сырный/перечный/… и 100 ₽ чесночный/томатный/
// йогуртовый). Первая уже видна, вторая осталась скрытой после 2026-10-09-sauces-visible
// (та миграция включала только одну). Показываем все неархивные «Соусы». Идемпотентно.
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const contentDir = process.argv[2];
if (!contentDir) { console.error('usage: node apply.mjs <packages/db/content>'); process.exit(2); }
const file = join(contentDir, 'barvixa-lounge-saratov', 'kitchen.json');
if (!existsSync(file)) { console.error(`нет ${file}`); process.exit(0); }
const raw = readFileSync(file, 'utf-8'); const data = JSON.parse(raw); let n = 0;
for (const it of data) if (/^соусы?$/i.test(it.name.trim()) && !it.is_archived && !it.is_available) { it.is_available = true; n++; }
if (n) { writeFileSync(`${file}.tmp`, JSON.stringify(data, null, 2) + '\n', 'utf-8'); renameSync(`${file}.tmp`, file); }
console.log(`Саратов: включено ${n}`);
