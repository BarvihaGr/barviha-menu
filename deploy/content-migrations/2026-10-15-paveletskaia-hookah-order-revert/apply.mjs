// Откат миграции 2026-10-15-paveletskaia-hookah-order по просьбе владельца
// («не так сделал»): возвращаем порядок и подразделы кальянов Павелецкой
// ровно такими, какими они были до неё (снимок прод-контента 14.10.2026).
// Идемпотентно. usage: node apply.mjs <абсолютный путь к packages/db/content>
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const contentDir = process.argv[2];
if (!contentDir) { console.error('usage: node apply.mjs <packages/db/content>'); process.exit(2); }

// [id, sub] в исходном порядке
const SNAPSHOT = [
  ['hookah-акции-k811et', 'АКЦИИ'], ['hookah-hookah-kalian-barvikha-2kla24p', 'hookah'], ['hookah-hookah-firmennyi-kalian', 'hookah'],
  ['hookah-hookah-tropikana-mama-koeu24q', 'hookah'], ['hookah-hookah-chernoe-solnce-cbih24r', 'hookah'],
  ['hookah-hookah-eshche-odin-pozhaluista-03ae24s', 'hookah'], ['hookah-hookah-rozovaia-pantera-boo724t', 'hookah'],
  ['hookah-hookah-dolche-vita-m75n24u', 'hookah'], ['hookah-hookah-parfium-na-frukte-7g6q24m', 'hookah'],
  ['hookah-hookah-parfium-na-chashe-j1zn24l', 'Специальное предложение'], ['hookah-hookah-elektronnaia-chasha-d1ea24o', 'hookah'],
  ['hookah-hookah-2-5-hours', 'hookah'], ['hookah-hookah-banana-boom', 'hookah'], ['hookah-hookah-berry-blast', 'hookah'],
  ['hookah-hookah-black-edition', 'hookah'], ['hookah-hookah-dolce-vita', 'hookah'], ['hookah-hookah-du-barry', 'hookah'],
  ['hookah-hookah-greenie', 'hookah'], ['hookah-hookah-jasse-pinkman', 'hookah'], ['hookah-hookah-nom-nom', 'hookah'],
  ['hookah-hookah-old-money', 'hookah'], ['hookah-hookah-one-more-please', 'hookah'], ['hookah-hookah-paradise', 'hookah'],
  ['hookah-hookah-pink-panther', 'hookah'], ['hookah-hookah-red-energy', 'hookah'], ['hookah-hookah-red-mojito', 'hookah'],
  ['hookah-hookah-smoky-duchess-pear', 'hookah'], ['hookah-hookah-sweet-passion', 'hookah'], ['hookah-hookah-the-right-choice', 'hookah'],
  ['hookah-hookah-tropicana-mama', 'hookah'], ['hookah-hookah-vitamin-c', 'hookah'], ['hookah-hookah-kalian-na-frukte', 'hookah'],
  ['hookah-hookah-elektronnaia-chasha-0unr24n', 'hookah'], ['hookah-hookah-kalian-deus-perfume', 'hookah'],
  ['hookah-hookah-kalian-na-chashe-2x5t24k', 'hookah'], ['hookah-hookah-wto-bonche-miks', 'hookah'],
  ['hookah-hookah-kalian-wto-bonche', 'hookah'], ['hookah-hookah-kalian-premium', 'hookah'],
  ['hookah-pav-malibu-216eed', 'Специальное предложение'], ['hookah-pav-bagrovoe-cvetenie-02fd8a', 'Специальное предложение'],
  ['hookah-pav-sinergiya-vkusov-69aa9e', 'Специальное предложение'],
];

const file = join(contentDir, 'paveletskaia', 'hookah.json');
if (!existsSync(file)) { console.error(`нет ${file}`); process.exit(0); }
const raw = readFileSync(file, 'utf-8');
const data = JSON.parse(raw);
const byId = new Map(data.map((x) => [x.id, x]));
const out = [];
for (const [id, sub] of SNAPSHOT) {
  const it = byId.get(id);
  if (!it) continue; // позицию удалили после снимка — пропускаем
  it.sub = sub;
  out.push(it);
}
for (const it of data) if (!out.includes(it)) out.push(it); // новое после снимка — в конец
const text = JSON.stringify(out, null, 2) + '\n';
if (text === raw) { console.log('paveletskaia/hookah: уже как до изменения'); process.exit(0); }
writeFileSync(`${file}.tmp`, text, 'utf-8');
renameSync(`${file}.tmp`, file);
console.log(`paveletskaia/hookah: откачено, ${out.length} позиций`);
