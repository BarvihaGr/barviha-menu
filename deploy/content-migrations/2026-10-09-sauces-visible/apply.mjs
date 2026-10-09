// «Соусы» (170 ₽, кетчуп / свитчили / брусничный / …) — по решению владельца 09.10.2026
// позиция снова показывается гостям везде, где она есть в мастер-файле.
// Раньше была скрыта (is_available: false) на всех точках: соусы считались частью
// блюд, а раздел «Хлеб и соусы» подписывался просто «Хлеб».
//
// Включаем только там, где лист файла содержит эту позицию и на витрине ещё нет
// другой видимой «Соусы» (Раменки/Невский/Нижний уже показывают свою копию с 22.09).
// Стоп-лист админа после этого — обычный тумблер в бэк-офисе.
//
// usage: node apply.mjs <абсолютный путь к packages/db/content>  — идемпотентно.
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const contentDir = process.argv[2];
if (!contentDir) { console.error('usage: node apply.mjs <packages/db/content>'); process.exit(2); }

const LOCATIONS = ['krasnaia-ploshchad', 'kievskaia', 'moskva-siti', 'paveletskaia', 'mendeleevskaia',
  'mitino', 'marino', 'tepliy-stan', 'otradnoe', 'iugo-zapadnaia', 'baumanskaia', 'cska', 'kolomenskaia',
  'seligerskaia', 'barvixa-lounge-krylatskoe', 'barvixa-lounge-saratov'];
const isSauces = (it) => /^соусы?$/i.test(it.name.trim()) && it.realm === 'kitchen';
let n = 0;
for (const slug of LOCATIONS) {
  const file = join(contentDir, slug, 'kitchen.json');
  if (!existsSync(file)) { console.error(`нет ${file}`); continue; }
  const raw = readFileSync(file, 'utf-8');
  const data = JSON.parse(raw);
  const visible = data.some((it) => isSauces(it) && it.is_available && !it.is_archived);
  if (visible) continue;
  const it = data.find((it) => isSauces(it) && !it.is_archived);
  if (!it) { console.error(`${slug}: позиции «Соусы» нет`); continue; }
  it.is_available = true; n++;
  const out = JSON.stringify(data, null, 2) + '\n';
  writeFileSync(`${file}.tmp`, out, 'utf-8'); renameSync(`${file}.tmp`, file);
  console.log(`${slug}: «Соусы» показаны`);
}
console.log(`--- включено: ${n}`);
