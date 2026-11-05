// «Синергия вкусов» — 3 вида (05.11.2026, по просьбе владельца). Формат ещё не утверждён
// («три позиции» или «три в одной»), поэтому рядом с существующей карточкой (вид 1, пряная —
// крафт-мешок со специями) добавляем на каждой локации, где она есть:
//   - «Синергия вкусов · Цветочная» (маки, корица) — фото sinergiya-vkusov-5/10/8;
//   - «Синергия вкусов · Травяная» (деревянный поднос с травами) — фото 6/11/9;
//   - «Синергия вкусов · Три вида на выбор» — по фото каждого вида.
// Цена и описание — как у «Синергии вкусов» этой локации (из Google-таблицы; своих описаний у видов там нет). Существующую карточку не трогаем (по её названию
// матчится Google-таблица). Названия рабочие — владелец может переименовать в бэк-офисе.
// Идемпотентно. usage: node apply.mjs <packages/db/content> [--dry]
import { readFileSync, writeFileSync, renameSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const contentDir = process.argv[2];
const DRY = process.argv.includes('--dry');
if (!contentDir) { console.error('usage: node apply.mjs <packages/db/content> [--dry]'); process.exit(2); }
const norm = (s) => String(s ?? '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, '');
const ph = (n) => ({ src: `/menu-admin/_shared/2026-10/sinergiya-vkusov-${n}.webp`, position: null, transform: null });

const NEW = [
  {
    slug: 'cvetochnaya',
    name: 'Синергия вкусов · Цветочная',
    photos: [ph(5), ph(10), ph(8)],
  },
  {
    slug: 'travyanaya',
    name: 'Синергия вкусов · Травяная',
    photos: [ph(6), ph(11), ph(9)],
  },
  {
    slug: 'tri-vida',
    name: 'Синергия вкусов · Три вида на выбор',
    photos: [ph(3), ph(5), ph(6), ph(4), ph(10), ph(11)],
  },
];

const report = [];
for (const slug of readdirSync(contentDir).sort()) {
  const f = join(contentDir, slug, 'hookah.json');
  if (slug.startsWith('.') || !existsSync(f)) continue;
  const raw = readFileSync(f, 'utf-8');
  const data = JSON.parse(raw);
  const idx = data.findIndex((i) => !i.is_archived && norm(i.name) === norm('Синергия вкусов'));
  if (idx < 0) continue;
  const base = data[idx];
  const prefix = String(base.id).split('-')[1] ?? slug.slice(0, 3);
  const added = [];
  let at = idx + 1;
  for (const v of NEW) {
    if (data.some((i) => norm(i.name) === norm(v.name))) { at = data.findIndex((i) => norm(i.name) === norm(v.name)) + 1; continue; }
    const id = `hookah-${prefix}-sinergiya-vkusov-${v.slug}-${createHash('sha1').update(`${slug}|hookah|${v.name}`).digest('hex').slice(0, 6)}`;
    data.splice(at, 0, {
      id, realm: 'hookah', name: v.name, description: base.description ?? null, composition: null, kbju: null,
      price: base.price, is_available: base.is_available !== false, is_archived: false,
      photos: v.photos.map((p) => ({ ...p })), sub: base.sub ?? 'Специальное предложение',
    });
    at += 1;
    added.push(v.slug);
  }
  if (added.length) {
    const out = JSON.stringify(data, null, 2) + '\n';
    if (!DRY && out !== raw) { writeFileSync(`${f}.tmp`, out, 'utf-8'); renameSync(`${f}.tmp`, f); }
  }
  report.push(`${slug.padEnd(27)} ${String(base.price).padStart(5)} ₽  ${added.length ? '+' + added.join(', +') : 'уже есть'}`);
}
console.log(report.join('\n'));
if (DRY) console.log('(dry — ничего не записано)');
